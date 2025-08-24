import React, { useState, useRef, useEffect } from 'react';

// Custom Select component with dropdown functionality
export const Select = ({ 
  label, 
  name, 
  value, 
  onValueChange, 
  options = [], 
  placeholder, 
  error, 
  className = '',
  disabled = false,
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const selectRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(optionValue);
    }
  };

  const selectedOption = options.find(option => option.value === selectedValue);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`relative w-full text-left bg-white border rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
          error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
        } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer'}`}
        {...props}
      >
        <span className={`block truncate ${selectedValue ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedOption ? selectedOption.label : placeholder || 'Pilih opsi...'}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg 
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">Tidak ada opsi tersedia</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${
                  option.value === selectedValue ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center mt-2 text-sm text-red-600">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

// Legacy components for backward compatibility
export const SelectTrigger = ({ children, className = '', onClick, ...props }) => (
  <button
    type="button"
    className={`flex items-center justify-between w-full border rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
);

export const SelectValue = ({ placeholder, value, options = [] }) => {
  const selectedOption = options.find(option => option.value === value);
  return (
    <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
      {selectedOption ? selectedOption.label : placeholder}
    </span>
  );
};

export const SelectContent = ({ children, isOpen, className = '', ...props }) => {
  if (!isOpen) return null;
  
  return (
    <div
      className={`absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const SelectItem = ({ children, value, onClick, className = '', ...props }) => (
  <button
    type="button"
    className={`w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none ${className}`}
    onClick={() => onClick?.(value)}
    {...props}
  >
    {children}
  </button>
);

export default Select; 