import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  variant?: 'default' | 'dots' | 'pulse' | 'bars';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        {text && <span className={cn('ml-2 text-gray-600', textSizeClasses[size])}>{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className={cn('bg-current rounded-full animate-pulse', sizeClasses[size])}></div>
        {text && <span className={cn('ml-2 text-gray-600', textSizeClasses[size])}>{text}</span>}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <div className="flex gap-1 items-end">
          <div className="w-1 bg-current rounded animate-pulse" style={{ height: '16px', animationDelay: '0ms' }}></div>
          <div className="w-1 bg-current rounded animate-pulse" style={{ height: '24px', animationDelay: '150ms' }}></div>
          <div className="w-1 bg-current rounded animate-pulse" style={{ height: '20px', animationDelay: '300ms' }}></div>
          <div className="w-1 bg-current rounded animate-pulse" style={{ height: '28px', animationDelay: '450ms' }}></div>
          <div className="w-1 bg-current rounded animate-pulse" style={{ height: '18px', animationDelay: '600ms' }}></div>
        </div>
        {text && <span className={cn('ml-2 text-gray-600', textSizeClasses[size])}>{text}</span>}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      <div className={cn('animate-spin', sizeClasses[size])}>
        <svg
          className="w-full h-full"
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
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      {text && <span className={cn('ml-2 text-gray-600', textSizeClasses[size])}>{text}</span>}
    </div>
  );
};

// Full page loading component
export const FullPageLoader: React.FC<{
  text?: string;
  variant?: LoadingSpinnerProps['variant'];
}> = ({ text = 'Loading...', variant = 'default' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="xl" text={text} variant={variant} className="text-blue-600" />
      </div>
    </div>
  );
};

// Card loading skeleton
export const CardSkeleton: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      {Array.from({ length: lines - 1 }, (_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
      ))}
    </div>
  );
};

// Table skeleton loader
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="border-b">
        <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="border-b">
          <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Button loading state
export const ButtonLoader: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ loading, children, className = '' }) => {
  return (
    <button className={cn('relative', className)} disabled={loading}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
    </button>
  );
};
