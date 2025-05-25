import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Input = forwardRef(({ 
  label, 
  type = 'text', 
  error, 
  helper, 
  icon, 
  className = '', 
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  
  const inputClasses = `
    input-field
    ${icon ? 'pl-12' : ''}
    ${isPassword ? 'pr-12' : ''}
    ${error ? 'border-error-500 focus:ring-error-500' : ''}
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <motion.label 
          className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: isFocused ? 1 : 0.7 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-secondary-400 dark:text-secondary-500">
              {icon}
            </span>
          </div>
        )}
        
        <motion.input
          ref={ref}
          type={inputType}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          {...props}
        />
        
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300" />
              ) : (
                <EyeIcon className="h-5 w-5 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300" />
              )}
            </motion.div>
          </button>
        )}
      </div>
      
      {(error || helper) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-2"
        >
          {error && (
            <p className="text-sm text-error-600 dark:text-error-400">
              {error}
            </p>
          )}
          {helper && !error && (
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              {helper}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
