import React, { useState, useRef, useEffect } from 'react';

// Main Select component
const Select = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  placeholder, 
  error, 
  className = '',
  children,
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`block w-full border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors px-3 py-3 ${
          error 
            ? 'border-red-300 focus:ring-red-500 focus:border-primary-500' 
            : 'border-gray-300'
        }`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children || options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

// Advanced Select components for better UX
export const SelectTrigger = ({ children, className = '', onClick, ...props }) => (
  <button
    type="button"
    className={`flex items-center justify-between w-full border rounded-lg px-3 py-2 text-left focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
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
    className={`w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${className}`}
    onClick={() => onClick?.(value)}
    {...props}
  >
    {children}
  </button>
);

export default Select; 