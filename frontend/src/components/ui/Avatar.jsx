import { useState } from 'react';
import { motion } from 'framer-motion';

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '', 
  onClick,
  online = false,
  username = ''
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-20 w-20 text-2xl',
    '3xl': 'h-24 w-24 text-3xl'
  };
  
  const onlineSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
    '2xl': 'h-5 w-5',
    '3xl': 'h-6 w-6'
  };
  
  const baseClasses = `
    relative inline-flex items-center justify-center overflow-hidden rounded-full
    bg-gradient-to-br from-primary-500 to-accent-500
    ${sizes[size]}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;
  
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <motion.div
      className={baseClasses}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      transition={{ duration: 0.2 }}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || username}
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <span className="font-medium text-white">
          {getInitials(username || alt)}
        </span>
      )}
      
      {online && (
        <motion.div
          className={`
            absolute bottom-0 right-0 block rounded-full bg-success-500 ring-2 ring-white dark:ring-secondary-900
            ${onlineSizes[size]}
          `}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
        />
      )}
    </motion.div>
  );
};

export default Avatar;
