import React, { useRef, useEffect, useState } from 'react'
import { Image, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

const RichTextEditor = ({ 
  value, 
  onChange, 
  name = 'content',
  onFilesChange,
  placeholder = "Ketik atau paste konten di sini...",
  error,
  rows = 6,
  label,
  required = false
}) => {
  const editorRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || ''
      setIsInitialized(true)
    }
  }, [value, isInitialized])

  // Ensure content is captured whenever the editor changes
  const handleInput = () => {
    if (onChange && editorRef.current) {
      const content = editorRef.current.innerHTML
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
    handleInput()
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

  const handlePaste = (e) => {
    e.preventDefault()
    
    const items = (e.clipboardData || e.originalEvent.clipboardData).items
    
    for (let item of items) {
      if (item.type.indexOf('image') !== -1) {
        const blob = item.getAsFile()
        
        // Add file to uploadedFiles state instead of inserting base64
        setUploadedFiles(prev => {
          const newFiles = [...prev, blob];
          
          // Notify parent component about new files
          if (onFilesChange) {
            onFilesChange(newFiles)
          }
          
          return newFiles;
        })
        
        // Insert placeholder instead of base64 image
        const placeholder = document.createElement('div')
        placeholder.className = 'image-placeholder'
        placeholder.style.cssText = `
          border: 2px dashed #ccc;
          padding: 20px;
          margin: 10px 0;
          text-align: center;
          background: #f9f9f9;
          border-radius: 4px;
          color: #666;
        `
        placeholder.innerHTML = `
          <div>📷 ${blob.name || 'Pasted Image'}</div>
          <div style="font-size: 12px; margin-top: 5px;">
            ${(blob.size / 1024).toFixed(1)} KB - Will be uploaded when form is submitted
          </div>
        `
        
        // Insert placeholder at cursor position
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          range.deleteContents()
          range.insertNode(placeholder)
          range.collapse(false)
        } else {
          editorRef.current.appendChild(placeholder)
        }
        
        handleInput()
        return
      }
    }
    
    // If no image, paste as text
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain')
    document.execCommand('insertHTML', false, text)
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
        // Add files to uploadedFiles state
        setUploadedFiles(prev => {
          const newFiles = [...prev, ...files];
          
          // Notify parent component about new files
          if (onFilesChange) {
            onFilesChange(newFiles)
          }
          
          return newFiles;
        })
        
        // Insert placeholders into editor (NOT base64 images)
        files.forEach((file, index) => {
          // Create a placeholder div instead of actual image
          const placeholder = document.createElement('div')
          placeholder.className = 'image-placeholder'
          placeholder.style.cssText = `
            border: 2px dashed #ccc;
            padding: 20px;
            margin: 10px 0;
            text-align: center;
            background: #f9f9f9;
            border-radius: 4px;
            color: #666;
          `
          placeholder.innerHTML = `
            <div>📷 ${file.name}</div>
            <div style="font-size: 12px; margin-top: 5px;">
              ${(file.size / 1024).toFixed(1)} KB - Will be uploaded when form is submitted
            </div>
          `
          
          // Insert placeholder at cursor position
          const selection = window.getSelection()
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            range.deleteContents()
            range.insertNode(placeholder)
            range.collapse(false)
          } else {
            editorRef.current.appendChild(placeholder)
          }
          
          handleInput()
        })
      }
    }
    input.click()
  }

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
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
        onMouseUp={handleInput}
        onMouseDown={handleInput}
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
      {uploadedFiles.length > 0 && (
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