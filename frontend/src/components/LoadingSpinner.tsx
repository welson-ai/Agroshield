import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  className?: string;
}

/**
 * LoadingSpinner component - Customizable loading spinner with text
 * Displays animated spinner with configurable size and color
 * Fully accessible with ARIA attributes for screen readers
 * 
 * @param size - Spinner size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * @param color - Spinner color: 'primary' | 'secondary' | 'white' | 'gray' (default: 'primary')
 * @param text - Optional text to display below spinner
 * @param className - Additional CSS classes
 * @returns JSX.Element - Loading spinner component
 * 
 * @example
 * <LoadingSpinner size="lg" color="primary" text="Loading..." />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  className = ''
}) => {
  // Validate props
  if (!['sm', 'md', 'lg', 'xl'].includes(size)) {
    console.warn('Invalid size prop:', size, 'Using default: md')
    size = 'md'
  }
  
  if (!['primary', 'secondary', 'white', 'gray'].includes(color)) {
    console.warn('Invalid color prop:', color, 'Using default: primary')
    color = 'primary'
  }
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'text-blue-600';
      case 'secondary':
        return 'text-gray-600';
      case 'white':
        return 'text-white';
      case 'gray':
        return 'text-gray-400';
      default:
        return 'text-blue-600';
    }
  };

  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return 'border-2';
      case 'md':
        return 'border-2';
      case 'lg':
        return 'border-3';
      case 'xl':
        return 'border-4';
      default:
        return 'border-2';
    }
  };

  return (
    <div 
      className={`flex flex-col items-center justify-center ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative">
        <div
          className={`
            ${getSizeClasses()}
            ${getColorClasses()}
            ${getSpinnerSize()}
            border-current border-t-transparent rounded-full animate-spin
          `}
          aria-hidden="true"
        />
        {/* Inner circle for visual effect */}
        <div
          className={`
            absolute inset-0
            ${getSizeClasses()}
            ${getColorClasses()}
            opacity-20 rounded-full
          `}
        />
      </div>
      
      {text && (
        <p 
          className={`mt-3 text-sm ${getColorClasses()}`}
          aria-live="polite"
        >
          {text}
        </p>
      )}
    </div>
  );
};

/**
 * FullScreenLoader component - Full screen loading overlay
 * Displays loading spinner with optional backdrop covering entire viewport
 * 
 * @param text - Loading text (default: 'Loading...')
 * @param backdrop - Show backdrop (default: true)
 * @returns JSX.Element - Full screen loader component
 */
export const FullScreenLoader: React.FC<{
  text?: string;
  backdrop?: boolean;
}> = ({ text = 'Loading...', backdrop = true }) => {
  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${backdrop ? 'bg-black bg-opacity-50' : ''}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-text"
    >
      <div 
        className="bg-white rounded-lg p-8 shadow-xl"
        role="document"
      >
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
};

/**
 * LoadingButton component - Button with loading state
 * Displays button with spinner when loading, disabled state
 * 
 * @param loading - Whether button is in loading state
 * @param children - Button content when not loading
 * @param disabled - Whether button is disabled
 * @param className - Additional CSS classes
 * @param loadingText - Text to show when loading
 * @param onClick - Click handler
 * @returns JSX.Element - Loading button component
 */
export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  loadingText?: string;
  onClick?: () => void;
}> = ({
  loading,
  children,
  disabled = false,
  className = '',
  loadingText = 'Loading...',
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center
        px-4 py-2 bg-blue-600 text-white rounded-lg
        hover:bg-blue-700 disabled:bg-gray-400
        disabled:cursor-not-allowed transition-colors
        ${className}
      `}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" color="white" />
          <span className="ml-2" aria-live="polite">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * CardSkeleton component - Skeleton loading state for cards
 * Displays animated placeholder for card content while loading
 * 
 * @param lines - Number of skeleton lines (default: 3)
 * @param showAvatar - Show avatar skeleton (default: false)
 * @returns JSX.Element - Card skeleton component
 */
export const CardSkeleton: React.FC<{
  lines?: number;
  showAvatar?: boolean;
}> = ({ lines = 3, showAvatar = false }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow p-6"
      role="status"
      aria-busy="true"
      aria-label="Loading content"
    >
      {showAvatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div 
            className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"
            aria-hidden="true"
          ></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div 
              className="h-4 bg-gray-200 rounded animate-pulse"
              style={{ width: `${Math.random() * 40 + 60}%` }}
              aria-hidden="true"
            ></div>
            {index === 0 && (
              <div 
                className="h-3 bg-gray-200 rounded animate-pulse w-1/2"
                aria-hidden="true"
              ></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Table loading skeleton
/**
 * TableSkeleton component - Skeleton loading state for tables
 * Displays animated table placeholder while loading data
 * 
 * @param rows - Number of skeleton rows (default: 5)
 * @param columns - Number of skeleton columns (default: 4)
 * @returns JSX.Element - Table skeleton component
 */
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
}> = ({ rows = 5, columns = 4 }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow overflow-hidden"
      role="status"
      aria-busy="true"
      aria-label="Loading table data"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-3 text-left">
                  <div 
                    className="h-4 bg-gray-200 rounded animate-pulse"
                    aria-hidden="true"
                  ></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div 
                      className="h-4 bg-gray-200 rounded animate-pulse"
                      style={{ width: `${Math.random() * 60 + 40}%` }}
                    ></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Progress bar with loading state
export const LoadingProgress: React.FC<{
  progress: number;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}> = ({ 
  progress, 
  showPercentage = true, 
  color = 'primary',
  size = 'md'
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-2';
      case 'md':
        return 'h-3';
      case 'lg':
        return 'h-4';
      default:
        return 'h-3';
    }
  };

  return (
    <div className="w-full">
      {showPercentage && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${getSizeClasses()}`}>
        <div
          className={`
            ${getColorClasses()}
            ${getSizeClasses()}
            rounded-full transition-all duration-300 ease-out
          `}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        >
          {progress > 0 && progress < 100 && (
            <div className="h-full bg-white bg-opacity-30 animate-pulse"></div>
          )}
        </div>
      </div>
    </div>
  );
};

// Page loading component
export const PageLoading: React.FC<{
  text?: string;
  subtitle?: string;
}> = ({ text = 'Loading...', subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" text={text} />
        {subtitle && (
          <p className="mt-4 text-gray-600 text-sm">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
