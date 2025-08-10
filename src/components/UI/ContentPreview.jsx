import React from 'react'
import { formatDate } from '../../utils/helpers'

const ContentPreview = ({ 
  content, 
  tanggal, 
  showStats = true, 
  maxLength = null,
  className = ""
}) => {
  const truncateHtml = (html, maxLen) => {
    if (!html || !maxLen) return html
    
    // Remove HTML tags for length calculation
    const textContent = html.replace(/<[^>]*>/g, '')
    
    if (textContent.length <= maxLen) {
      return html
    }
    
    // Truncate and add ellipsis
    const truncated = textContent.substring(0, maxLen) + '...'
    return truncated
  }

  const imageCount = (content?.match(/<img/g) || []).length
  const displayContent = maxLength ? truncateHtml(content, maxLength) : content

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-white rounded-lg border">
          <p className="text-sm text-gray-600">Tanggal Laporan</p>
          <p className="text-lg font-semibold text-gray-900">
            {tanggal ? formatDate(tanggal) : '-'}
          </p>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border">
          <p className="text-sm text-gray-600">Jumlah Gambar</p>
          <p className="text-lg font-semibold text-blue-600">
            {imageCount} gambar
          </p>
        </div>
      </div>
      
      {/* Content Display */}
      <div className="bg-white rounded-lg border p-4">
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: displayContent || '' }}
        />
        {maxLength && content && content.length > maxLength && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            ... (klik untuk melihat selengkapnya)
          </p>
        )}
      </div>
      
      {/* Stats Footer */}
      {showStats && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-white rounded border">
            <span className="font-medium text-gray-700">Panjang:</span>
            <span className="ml-1 text-gray-600">
              {content ? content.length : 0} karakter
            </span>
          </div>
          <div className="text-center p-2 bg-white rounded border">
            <span className="font-medium text-gray-700">Gambar:</span>
            <span className="ml-1 text-gray-600">
              {imageCount} file
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentPreview 