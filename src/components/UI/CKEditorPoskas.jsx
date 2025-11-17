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
    this._abortController = new AbortController()
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
      body: form,
      signal: this._abortController.signal
    })

    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error(`Upload gagal (${res.status}): ${t}`)
    }

    const json = await res.json().catch(() => null)
    if (!json) {
      throw new Error('Upload berhasil namun respons tidak dapat dibaca sebagai JSON')
    }

    // Toleransi berbagai bentuk respons backend
    // Preferensi: { success: true, data: [ { url, path, filename } ] }
    // Fallbacks yang didukung: { files: [ ... ] } atau { url, path } atau { data: { url, path } }
    let info = null
    if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
      info = json.data[0]
    } else if (Array.isArray(json?.files) && json.files.length > 0) {
      info = json.files[0]
    } else if (json?.data && typeof json.data === 'object') {
      info = json.data
    } else if (json?.url || json?.path) {
      info = json
    }

    if (!info) {
      console.error('CKE Upload: response payload tidak dikenali:', json)
      throw new Error('Format respons upload tidak valid')
    }

    // Use backend base (BASE_URL without trailing '/api' or '/upload/<segment>') to prefix relative /uploads URL
    const backendBase = (this.uploadUrl || '')
      .replace(/\/upload\/[^/]+$/,'')
      .replace(/\/api$/,'') || ''
    const urlField = info.url || info.fileUrl || info.location || ''
    const pathField = info.path || info.filepath || info.serverPath || ''
    const rel = urlField || pathField || ''
    const fullUrl = /^(https?:)?\/\//i.test(rel) ? rel : `${backendBase}${rel.startsWith('/') ? '' : '/'}${rel}`

    // Push metadata ke parent agar bisa disertakan saat submit
    if (typeof this.onUploaded === 'function') {
      const id = Date.now() + Math.floor(Math.random()*1000)
      this.onUploaded({
        uri: `file://temp/${id}.jpg`,
        id,
        name: info.filename || info.originalName || (pathField ? String(pathField).split('/').pop() : (file.name || `poskas_${id}.jpg`)),
        url: fullUrl,
        serverPath: pathField || rel
      })
    }

    // CKEditor expects { default: imageUrl }
    return { default: fullUrl }
  }

  // Aborts the upload process.
  abort() {
    try {
      if (this._abortController) {
        this._abortController.abort()
      }
    } catch (_) { /* noop */ }
  }
}

const CKEditorPoskas = ({ value, onChangeHTML, onImagesChange, placeholder = 'Ketik atau paste konten di sini...', uploadPath, uploadUrl: uploadUrlProp, imageAlign = 'left' }) => {
  const env = getEnvironmentConfig()
  // Support custom upload path or full upload URL. Fallback to Poskas default.
  const base = env.BASE_URL
  const resolvedUploadUrl = uploadUrlProp
    ? uploadUrlProp
    : (uploadPath ? `${base}${uploadPath.startsWith('/') ? '' : '/'}${uploadPath}` : `${base}/upload/poskas`)
  const uploadUrl = resolvedUploadUrl
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
    // minimal toolbar yang aman untuk build Classic default
    toolbar: [
      'undo','redo','|','bold','italic'
    ],
    // Remove image toolbar items to avoid plugin-unavailable issues in default Classic build
  }), [placeholder, token, uploadUrl])

  // Inject global CSS to keep paragraphs left-aligned and force images alignment by prop
  useEffect(() => {
    const style = document.createElement('style')
    style.setAttribute('data-cke-poskas-style', 'true')
    const align = (imageAlign || 'left').toLowerCase()
    const isCenter = align === 'center'
    const marginRule = isCenter ? '10px auto' : '10px 0'
    const figureMargin = isCenter ? '10px auto' : '10px 0'
    const inlineImgDisplay = isCenter ? 'inline-block' : 'block'
    const inlineTextAlign = isCenter ? 'center' : 'left'
    style.textContent = `
      .ck-content { text-align: left !important; }
      .ck-content p { text-align: left !important; }
      /* Force image wrapper alignment */
      .ck-content figure.image { margin: ${figureMargin} !important; float: none !important; }
      .ck-content .image.image-style-align-center,
      .ck-content .image.image-style-align-right,
      .ck-content .image.image-style-align-left {
        margin: ${figureMargin} !important;
        float: none !important;
      }
      /* CKEditor inline image variant -> force to act like block */
      .ck-content .image-inline { display: block !important; text-align: ${inlineTextAlign} !important; float: none !important; }
      .ck-content .image-inline img { display: ${inlineImgDisplay} !important; margin: ${marginRule} !important; float: none !important; }
      /* Always force raw <img> blocks */
      .ck-content img { display: block !important; margin: ${marginRule} !important; float: none !important; }
    `
    document.head.appendChild(style)
    return () => {
      if (style && style.parentNode) style.parentNode.removeChild(style)
    }
  }, [imageAlign])

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
          if (onChangeHTML) onChangeHTML({ target: { value: editor.getData() } })
        }}
        onChange={(event, editor) => {
          const data = editor.getData()
          if (onChangeHTML) onChangeHTML({ target: { value: data } })
        }}
      />
    </div>
  )
}

export default CKEditorPoskas
