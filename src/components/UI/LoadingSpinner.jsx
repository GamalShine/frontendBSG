import React from 'react'

const LoadingSpinner = ({ 
  size = 'medium', 
  className = '',
  text = 'Memuat...'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xlarge: 'w-16 h-16'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Simple Spinning Circle */}
      <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-red-500 ${sizeClasses[size]} mb-3`}></div>
      
      {/* Loading Text */}
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  )
}

export default LoadingSpinner 