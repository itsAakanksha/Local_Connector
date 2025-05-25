import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
          />
          
          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              className={`
                relative w-full bg-white dark:bg-secondary-900 rounded-2xl shadow-large
                border border-secondary-200 dark:border-secondary-700
                ${sizes[size]}
                ${className}
              `}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-secondary-700">
                  {title && (
                    <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                      {title}
                    </h3>
                  )}
                  
                  {showCloseButton && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      className="ml-auto"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              )}
              
              {/* Content */}
              <div className="p-6">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
