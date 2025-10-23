import React, { useRef, useEffect, useState } from 'react'
import { Image, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

const RichTextEditor = ({ 
  value, 
  onChange, 
  name = 'content',
  onFilesChange,
  placeholder = "Ketik atau paste konten di sini...",
  error,
  rows = 6,
  label,
  required = false,
  showUploadList = true
}) => {
  const editorRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!editorRef.current) return
    // Hanya sinkron saat inisialisasi pertama (untuk halaman Edit ketika data baru di-fetch)
    if (!isInitialized) {
      editorRef.current.innerHTML = value || ''
      setIsInitialized(true)
    }
    // Setelah inisialisasi, JANGAN overwrite innerHTML dari prop value
    // untuk menghindari img di editor berubah menjadi token [IMG:id]
  }, [value, isInitialized])

  // Ensure content is captured whenever the editor changes
  const handleInput = () => {
    if (onChange && editorRef.current) {
      // Serialize: replace <img data-image-id="ID"> with [IMG:ID]
      let content = editorRef.current.innerHTML
      try {
        // Use a temporary DOM to safely transform
        const tmp = document.createElement('div')
        tmp.innerHTML = content
        // Find images with data-image-id and replace with token text nodes
        const imgs = tmp.querySelectorAll('img[data-image-id]')
        imgs.forEach(img => {
          const id = img.getAttribute('data-image-id')
          const token = document.createTextNode(`[IMG:${id}]`)
          img.parentNode.replaceChild(token, img)
        })
        content = tmp.innerHTML
      } catch {}
      // Normalize <b> to <strong> and cleanup
      try {
        content = content
          .replace(/<\s*b\s*>/gi, '<strong>')
          .replace(/<\s*\/\s*b\s*>/gi, '</strong>')
          .replace(/<strong>\s*(?:<br\s*\/??\s*>)+\s*<\/strong>/gi, '<br>')
          .replace(/<strong>\s*<\/strong>/gi, '')
        // collapse nested <strong>
        let prev
        do {
          prev = content
          content = content
            .replace(/<strong>\s*<strong>/gi, '<strong>')
            .replace(/<\/strong>\s*<\/strong>/gi, '</strong>')
        } while (content !== prev)
      } catch {}
      // Normalize block containers to <br> (remove <div>/<p> wrappers)
      try {
        content = content
          .replace(/<\s*\/\s*p\s*>/gi, '<br>')
          .replace(/<\s*p[^>]*>/gi, '')
          .replace(/<\s*\/\s*div\s*>/gi, '<br>')
          .replace(/<\s*div[^>]*>/gi, '')
          .replace(/<br[^>]*>/gi, '<br>')
          // collapse 3+ consecutive <br> to max 2
          .replace(/(?:<br>\s*){3,}/gi, '<br><br>')
      } catch {}
      // Remove zero-width and trim stray leading/trailing breaks
      try {
        content = content
          .replace(/[\u200B-\u200D\uFEFF]/g, '')
          .replace(/^(?:\s*<br>)+/i, '')
          .replace(/(?:<br>\s*)+$/i, '')
      } catch {}
      console.log('RichTextEditor: Content changed:', content.substring(0, 100))
      onChange({
        target: {
          name: name,
          value: content
        }
      })
    }
  }

  // Ensure content is captured on blur as well
  const handleBlur = () => {
    setIsFocused(false)
    handleInput()
  }

  // Ensure content is captured on focus
  const handleFocus = () => {
    setIsFocused(true)
    // Jangan serialisasi saat fokus agar gambar tidak langsung berubah ke [IMG:id]
  }

  // Add function to get current content
  const getContent = () => {
    if (editorRef.current) {
      return editorRef.current.innerHTML
    }
    return ''
  }

  // Expose getContent function to parent
  useEffect(() => {
    if (onChange) {
      // Create a ref to the getContent function
      const getContentRef = { current: getContent }
      onChange.getContent = () => getContentRef.current()
    }
  }, [onChange])

  // Generate a simple unique ID for image placeholders
  const genImageId = () => Date.now() + Math.floor(Math.random() * 1000)

  // Insert <img ... data-image-id> preview at caret
  const insertImagePreview = (id, dataUrl, alt = 'Image') => {
    const img = document.createElement('img')
    img.src = dataUrl
    img.alt = alt
    img.setAttribute('data-image-id', id)
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.style.margin = '10px 0'
    img.style.borderRadius = '4px'
    img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'

    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      range.deleteContents()
      range.insertNode(img)
      range.collapse(false)
    } else if (editorRef.current) {
      editorRef.current.appendChild(img)
    }
    // add a trailing <br> for readability
    document.execCommand('insertHTML', false, '<br>')
  }

  const handlePaste = (e) => {
    e.preventDefault()

    const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items || []

    for (let item of items) {
      if ((item.type || '').indexOf('image') !== -1) {
        const file = item.getAsFile()
        if (file) {
          const id = genImageId()
          setUploadedFiles(prev => {
            const newList = [...prev, { file, id }]
            if (onFilesChange) onFilesChange(newList)
            return newList
          })
          // Read as data URL for inline preview
          const reader = new FileReader()
          reader.onload = (ev) => {
            const dataUrl = ev.target.result
            insertImagePreview(id, dataUrl, file.name || 'Image')
            handleInput()
          }
          reader.readAsDataURL(file)
          return
        }
      }
    }

    // If no image, paste with line breaks preserved
    const html = e.clipboardData.getData('text/html') || ''
    const plain = e.clipboardData.getData('text/plain') || ''

    let toInsert = ''
    if (plain) {
      // Escape and convert newlines to <br>
      toInsert = plain
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r?\n/g, '<br>')
    } else if (html) {
      // Normalize common block tags to <br> and keep <br>
      toInsert = html
        .replace(/<\s*\/\s*p\s*>/gi, '<br>')
        .replace(/<\s*p[^>]*>/gi, '')
        .replace(/<\s*\/\s*div\s*>/gi, '<br>')
        .replace(/<\s*div[^>]*>/gi, '')
        .replace(/<br[^>]*>/gi, '<br>')
        // Normalize <b> to <strong>
        .replace(/<\s*b\s*>/gi, '<strong>')
        .replace(/<\s*\/\s*b\s*>/gi, '</strong>')
    }

    document.execCommand('insertHTML', false, toInsert)
    handleInput()
  }

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current.focus()
    handleInput()
  }

  const insertImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = (e) => {
      const files = Array.from(e.target.files)
      
      if (files.length > 0) {
        // Generate IDs, update state, and insert inline previews
        const filesWithIds = files.map((file) => ({ file, id: genImageId() }))
        setUploadedFiles(prev => {
          const newList = [...prev, ...filesWithIds]
          if (onFilesChange) onFilesChange(newList)
          return newList
        })

        filesWithIds.forEach(({ id, file }) => {
          const reader = new FileReader()
          reader.onload = (ev) => {
            const dataUrl = ev.target.result
            insertImagePreview(id, dataUrl, file.name || 'Image')
            handleInput()
          }
          reader.readAsDataURL(file)
        })
      }
    }
    input.click()
  }

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
    { icon: Image, command: 'insertImage', title: 'Insert Image', custom: insertImage }
  ]

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Toolbar */}
      <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex flex-wrap gap-1">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.custom || (() => execCommand(button.command))}
            title={button.title}
            className="p-2 hover:bg-gray-200 rounded text-gray-600 hover:text-gray-900 transition-colors"
          >
            <button.icon className="h-4 w-4" />
          </button>
        ))}
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyUp={handleInput}
        onKeyDown={handleInput}
        className={`
          border border-gray-300 rounded-b-lg p-3 min-h-[${rows * 1.5}rem] 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${isFocused ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
        style={{ minHeight: `${rows * 1.5}rem` }}
        data-placeholder={placeholder}
      />
      
      {/* File Upload Status */}
      {showUploadList && uploadedFiles.length > 0 && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 mb-1">📁 File yang akan diupload:</p>
          <div className="space-y-1">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-700">{file.name}</span>
                <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        💡 Tips: Anda bisa paste gambar langsung dari clipboard atau gunakan tombol gambar untuk upload file
      </div>
    </div>
  )
}

export default RichTextEditor 