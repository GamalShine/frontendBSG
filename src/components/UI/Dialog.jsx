import React, { createContext, useContext, useState } from 'react';

const DialogContext = createContext();

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const Dialog = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(open || false);

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
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => handleOpenChange(false)}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${className}`}
          {...props}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export const DialogHeader = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-b ${className}`} {...props}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className = '', ...props }) => (
  <h2 className={`text-lg font-semibold text-gray-900 ${className}`} {...props}>
    {children}
  </h2>
);

export const DialogBody = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);

export const DialogFooter = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 border-t flex justify-end space-x-2 ${className}`} {...props}>
    {children}
  </div>
);













