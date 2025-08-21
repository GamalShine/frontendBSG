import React from 'react';

export const Pagination = ({ children, className = '', ...props }) => (
  <nav className={`flex items-center space-x-1 ${className}`} {...props}>
    {children}
  </nav>
);

export const PaginationContent = ({ children, className = '', ...props }) => (
  <div className={`flex items-center space-x-1 ${className}`} {...props}>
    {children}
  </div>
);

export const PaginationItem = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

export const PaginationLink = ({ 
  children, 
  className = '', 
  isActive = false, 
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'px-3 py-2 text-sm font-medium rounded-md transition-colors';
  const activeClasses = isActive 
    ? 'bg-blue-600 text-white' 
    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100';
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer';
  
  return (
    <button
      className={`${baseClasses} ${activeClasses} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const PaginationPrevious = ({ className = '', disabled = false, ...props }) => (
  <PaginationLink
    className={`flex items-center space-x-1 ${className}`}
    disabled={disabled}
    {...props}
  >
    <span>←</span>
    <span>Previous</span>
  </PaginationLink>
);

export const PaginationNext = ({ className = '', disabled = false, ...props }) => (
  <PaginationLink
    className={`flex items-center space-x-1 ${className}`}
    disabled={disabled}
    {...props}
  >
    <span>Next</span>
    <span>→</span>
  </PaginationLink>
);

export const PaginationEllipsis = ({ className = '', ...props }) => (
  <span className={`px-3 py-2 text-gray-500 ${className}`} {...props}>
    ...
  </span>
);













