import React from 'react'

const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-4 py-3 border-b border-gray-200 bg-gray-50 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardBody = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-4 py-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`px-4 py-3 border-t border-gray-200 bg-gray-50 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card 