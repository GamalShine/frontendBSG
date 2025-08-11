import React from 'react'
import { X, Image as ImageIcon } from 'lucide-react'
import { getImageInfo } from '../../utils/imageUtils'

const ImagePreview = ({ images, onRemove }) => {
  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        📷 Gambar yang akan diupload ({images.length})
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((image, index) => {
          const imageInfo = getImageInfo(image)
          
          return (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors">
                {imageInfo.preview ? (
                  <img
                    src={imageInfo.preview}
                    alt={imageInfo.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                
                {/* Fallback icon */}
                <div 
                  className={`w-full h-full flex items-center justify-center ${imageInfo.preview ? 'hidden' : 'flex'}`}
                  style={{ display: imageInfo.preview ? 'none' : 'flex' }}
                >
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                
                {/* Remove button */}
                {onRemove && (
                  <button
                    onClick={() => onRemove(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus gambar"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              
              {/* Image info */}
              <div className="mt-1 text-xs text-gray-600">
                <div className="font-medium truncate">{imageInfo.name}</div>
                <div className="text-gray-500">
                  {imageInfo.size > 0 ? `${(imageInfo.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ImagePreview 