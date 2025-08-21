import React from 'react';

const Separator = ({ className = '', orientation = 'horizontal', ...props }) => {
  const baseClasses = 'bg-gray-200';
  
  if (orientation === 'vertical') {
    return (
      <div
        className={`w-px h-full ${baseClasses} ${className}`}
        {...props}
      />
    );
  }
  
  return (
    <div
      className={`h-px w-full ${baseClasses} ${className}`}
      {...props}
    />
  );
};

export default Separator;













