import React, { useMemo, useEffect } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { getEnvironmentConfig } from '../../config/environment'

// CKEditor upload adapter for POSKAS
class PoskasUploadAdapter {
  constructor(loader, options) {
    this.loader = loader
    this.token = options.token
    this.uploadUrl = options.uploadUrl
    this.onUploaded = options.onUploaded // callback to push image meta to parent
  }

  // Starts the upload process.
  async upload() {
    const file = await this.loader.file
    const form = new FormData()
    form.append('images', file)

    const res = await fetch(this.uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: form
    })

    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error(`Upload gagal (${res.status}): ${t}`)
    }

    const json = await res.json()
    if (!json?.success || !Array.isArray(json?.data) || json.data.length === 0) {
      throw new Error('Format respons upload tidak valid')
    }

    const info = json.data[0]
    // Use backend base (BASE_URL without trailing '/api') to prefix relative /uploads URL
    const backendBase = (this.uploadUrl || '').replace(/\/?upload\/poskas$/,'').replace(/\/api$/,'') || ''
    const fullUrl = /^(https?:)?\/\//i.test(info.url) ? info.url : `${backendBase}${info.url}`

    // Push metadata ke parent agar bisa disertakan saat submit
    if (typeof this.onUploaded === 'function') {
      const id = Date.now() + Math.floor(Math.random()*1000)
      this.onUploaded({
        uri: `file://temp/${id}.jpg`,
        id,
        name: info.filename || (info.path ? info.path.split('/').pop() : (file.name || `poskas_${id}.jpg`)),
        url: fullUrl,
        serverPath: info.path
      })
    }

    // CKEditor expects { default: imageUrl }
    return { default: fullUrl }
  }

  // Aborts the upload process.
  abort() {
    // No special abort support
  }
}

const CKEditorPoskas = ({ value, onChangeHTML, onImagesChange, placeholder = 'Ketik atau paste konten di sini...' }) => {
  const env = getEnvironmentConfig()
  const uploadUrl = `${env.BASE_URL}/upload/poskas`
  const token = localStorage.getItem('token') || ''

  // Kumpulkan list images di level komponen lalu bubbling ke parent
  const imagesRef = React.useRef([])
  const pushImage = (img) => {
    imagesRef.current = [...imagesRef.current, img]
    if (onImagesChange) onImagesChange(imagesRef.current)
  }

  const editorConfig = useMemo(() => ({
    placeholder,
    extraPlugins: [ function (editor) {
      editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
        return new PoskasUploadAdapter(loader, { token, uploadUrl, onUploaded: pushImage })
      }
    }],
    // minimal toolbar yang umum dipakai
    toolbar: [
      'undo','redo','|','bold','italic','underline'
    ],
    image: {
      toolbar: [ 'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight', '|', 'imageTextAlternative' ],
      styles: [ 'alignLeft', 'alignCenter', 'alignRight' ]
    }
  }), [placeholder, token, uploadUrl])

  // Inject global CSS to keep CKEditor content left-aligned, including images
  useEffect(() => {
    const style = document.createElement('style')
    style.setAttribute('data-cke-poskas-style', 'true')
    style.textContent = `
      .ck-content { text-align: left !important; }
      .ck-content p { text-align: left !important; }
      .ck-content figure.image { margin-left: 0 !important; margin-right: auto !important; }
      .ck-content .image.image-style-align-center, .ck-content .image.image-style-align-right { margin-left: 0 !important; margin-right: auto !important; }
      .ck-content img { display: block; margin: 10px 0 !important; }
    `
    document.head.appendChild(style)
    return () => {
      if (style && style.parentNode) style.parentNode.removeChild(style)
    }
  }, [])

  // sanitizer to remove figure/figcaption and alignment classes/styles
  const sanitizeCkeOutput = (html) => {
    let data = html || ''
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(data, 'text/html')
      // unwrap figures
      Array.from(doc.querySelectorAll('figure')).forEach(fig => {
        const parent = fig.parentNode
        const img = fig.querySelector('img')
        if (!parent) return
        if (img) {
          // remove alignment classes from wrapper
          img.classList.remove('image-style-align-center','image-style-align-right','image-style-align-left')
          img.removeAttribute('style')
          parent.insertBefore(img, fig)
        }
        fig.remove()
      })
      // remove stray figcaptions
      Array.from(doc.querySelectorAll('figcaption')).forEach(n => n.remove())
      // remove alignment classes on any residual .image elements
      Array.from(doc.querySelectorAll('.image')).forEach(el => {
        el.classList.remove('image-style-align-center','image-style-align-right','image-style-align-left')
        el.removeAttribute('style')
      })
      // reset paragraph alignment
      Array.from(doc.querySelectorAll('p')).forEach(p => {
        const style = (p.getAttribute('style')||'')
        if (/text-align\s*:\s*(center|right)/i.test(style)) p.removeAttribute('style')
      })
      // ensure images are block-level with margins handled by our global CSS,
      // and remove a single preceding <br> before each image to avoid extra spacing in edit view
      Array.from(doc.querySelectorAll('img')).forEach(img => {
        img.removeAttribute('style')
        // remove whitespace text nodes around
        const isWs = (n) => n && n.nodeType === 3 && !/\S/.test(n.nodeValue || '')
        // remove preceding BR if exists (ignore whitespace)
        let prev = img.previousSibling
        while (isWs(prev)) prev = prev.previousSibling
        if (prev && prev.nodeName === 'BR') prev.parentNode.removeChild(prev)
      })
      // also remove leading BRs at top of content
      while (doc.body.firstChild && doc.body.firstChild.nodeName === 'BR') {
        doc.body.removeChild(doc.body.firstChild)
      }
      // output HTML
      data = doc.body.innerHTML
      // cleanup: remove empty paragraphs and redundant breaks
      data = data
        .replace(/<p>\s*<\/p>/gi, '')
        .replace(/<p>\s*(<br\s*\/?\s*>)+\s*<\/p>/gi, '<br>')
        .replace(/(?:<br>\s*){3,}/gi, '<br><br>')
        .replace(/^(?:\s*<br>)+/i, '')
        .replace(/(?:<br>\s*)+$/i, '')
    } catch (_) {}
    return data
  }

  return (
    <div className="ck-wrapper">
      <CKEditor
        editor={ClassicEditor}
        data={value || ''}
        config={editorConfig}
        onReady={(editor) => {
          // Normalize initial data to avoid centered images/paragraphs
          const current = editor.getData()
          const cleaned = sanitizeCkeOutput(current)
          if (cleaned !== current) {
            editor.setData(cleaned)
            if (onChangeHTML) onChangeHTML({ target: { value: cleaned } })
          }
        }}
        onChange={(event, editor) => {
          let data = editor.getData()
          data = sanitizeCkeOutput(data)
          if (onChangeHTML) onChangeHTML({ target: { value: data } })
        }}
      />
    </div>
  )
}

export default CKEditorPoskas
