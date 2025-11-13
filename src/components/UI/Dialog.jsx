import React, { createContext, useContext, useState, useEffect } from 'react';

const DialogContext = createContext();

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const Dialog = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(!!open);

  // Sync with controlled `open` prop
  useEffect(() => {
    if (typeof open === 'boolean') {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <DialogContext.Provider value={{ isOpen, setIsOpen, handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger = ({ children, asChild = false, ...props }) => {
  const { handleOpenChange } = useDialog();
  
  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => handleOpenChange(true),
      ...props,
    });
  }
  
  return (
    <button
      type="button"
      onClick={() => handleOpenChange(true)}
      {...props}
    >
      {children}
    </button>
  );
};

export const DialogContent = ({ children, className = '', ...props }) => {
  const { isOpen, handleOpenChange } = useDialog();
  
  if (!isOpen) return null;
  
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={() => handleOpenChange(false)}
      />
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
        <div
          className={`relative bg-white rounded-t-2xl md:rounded-2xl shadow-2xl border border-gray-200 max-w-full md:max-w-2xl w-full max-h-[90vh] overflow-y-auto ${className}`}
          {...props}
        >
          <button
            type="button"
            aria-label="Tutup"
            onClick={() => handleOpenChange(false)}
            className="absolute top-3 right-3 inline-flex items-center justify-center h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {children}
        </div>
      </div>
    </>
  );
};

export const DialogHeader = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl ${className}`} {...props}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className = '', ...props }) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </h2>
);

export const DialogBody = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-5 ${className}`} {...props}>
    {children}
  </div>
);

export const DialogFooter = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end space-x-2 ${className}`} {...props}>
    {children}
  </div>
);













