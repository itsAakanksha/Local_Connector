import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false, 
  icon, 
  className = '', 
  onClick,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-secondary-900 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white shadow-soft hover:shadow-medium",
    secondary: "bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700 focus:ring-secondary-500 text-secondary-900 dark:text-secondary-100 shadow-soft hover:shadow-medium",
    ghost: "text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:ring-secondary-500",
    outline: "border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 focus:ring-secondary-500",
    danger: "bg-error-600 hover:bg-error-700 focus:ring-error-500 text-white shadow-soft hover:shadow-medium",
    success: "bg-success-600 hover:bg-success-700 focus:ring-success-500 text-white shadow-soft hover:shadow-medium"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <motion.button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
