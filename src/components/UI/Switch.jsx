import React from 'react'

const Switch = ({ 
  checked = false, 
  onChange, 
  disabled = false, 
  className = '',
  size = 'md',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-11 h-6',
    lg: 'w-14 h-7'
  }

  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const thumbTranslateClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0.5',
    md: checked ? 'translate-x-5' : 'translate-x-0.5',
    lg: checked ? 'translate-x-7' : 'translate-x-0.5'
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange?.(!checked)}
      className={`
        relative inline-flex items-center justify-center
        ${sizeClasses[size]}
        rounded-full transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        ${checked 
          ? 'bg-blue-600 hover:bg-blue-700' 
          : 'bg-gray-200 hover:bg-gray-300'
        }
        ${className}
      `}
      {...props}
    >
      <span
        className={`
          inline-block ${thumbSizeClasses[size]} rounded-full
          bg-white shadow transform transition-transform duration-200 ease-in-out
          ${thumbTranslateClasses[size]}
        `}
      />
    </button>
  )
}

export default Switch 