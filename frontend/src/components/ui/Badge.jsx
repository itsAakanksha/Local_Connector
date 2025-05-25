import { motion } from 'framer-motion';
import { 
  StarIcon, 
  QuestionMarkCircleIcon, 
  MegaphoneIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';

const Badge = ({ 
  type, 
  variant = 'default', 
  size = 'md', 
  className = '', 
  children 
}) => {
  const postTypeConfig = {
    recommend: {
      label: 'Recommendation',
      icon: StarIcon,
      className: 'post-type-recommend'
    },
    help: {
      label: 'Help Needed',
      icon: QuestionMarkCircleIcon,
      className: 'post-type-help'
    },
    update: {
      label: 'Local Update',
      icon: MegaphoneIcon,
      className: 'post-type-update'
    },
    event: {
      label: 'Event',
      icon: CalendarIcon,
      className: 'post-type-event'
    }
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };
  
  const variants = {
    default: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-200',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400',
    success: 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400',
    error: 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400'
  };
  
  // Handle post type badges
  if (type && postTypeConfig[type]) {
    const config = postTypeConfig[type];
    const Icon = config.icon;
    
    return (
      <motion.span
        className={`
          post-type-badge
          ${config.className}
          ${sizes[size]}
          ${className}
        `}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </motion.span>
    );
  }
  
  // Handle generic badges
  return (
    <motion.span
      className={`
        inline-flex items-center font-medium rounded-lg
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.span>
  );
};

export default Badge;
