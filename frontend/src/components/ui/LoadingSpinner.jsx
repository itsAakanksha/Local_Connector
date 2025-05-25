import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = ''
}) => {
  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };
  
  const colors = {
    primary: 'text-primary-600',
    secondary: 'text-secondary-600',
    white: 'text-white',
    current: 'text-current'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`
          animate-spin rounded-full border-2 border-t-transparent
          ${sizes[size]} ${colors[color]}
        `}
        style={{
          borderColor: 'currentColor',
          borderTopColor: 'transparent'
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {text && (
        <motion.p
          className="mt-2 text-sm text-secondary-600 dark:text-secondary-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Skeleton loader for content
export const SkeletonLoader = ({ className = '', width = 'w-full', height = 'h-4' }) => (
  <div className={`shimmer rounded-lg ${width} ${height} ${className}`} />
);

// Post card skeleton
export const PostCardSkeleton = () => (
  <div className="card p-6 space-y-4">
    <div className="flex items-center space-x-3">
      <SkeletonLoader width="w-10" height="h-10" className="rounded-full" />
      <div className="space-y-2">
        <SkeletonLoader width="w-24" height="h-4" />
        <SkeletonLoader width="w-16" height="h-3" />
      </div>
    </div>
    
    <div className="space-y-2">
      <SkeletonLoader width="w-full" height="h-4" />
      <SkeletonLoader width="w-3/4" height="h-4" />
    </div>
    
    <SkeletonLoader width="w-full" height="h-48" className="rounded-xl" />
    
    <div className="flex items-center justify-between">
      <div className="flex space-x-4">
        <SkeletonLoader width="w-12" height="h-6" />
        <SkeletonLoader width="w-12" height="h-6" />
        <SkeletonLoader width="w-12" height="h-6" />
      </div>
      <SkeletonLoader width="w-16" height="h-6" />
    </div>
  </div>
);

export default LoadingSpinner;
