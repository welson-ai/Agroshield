'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/**
 * LoadingSkeleton component - Skeleton loading placeholder for content
 * Provides visual feedback during content loading states
 * 
 * @param className - Additional CSS classes for styling
 * @param variant - Skeleton variant: 'default' | 'text' | 'circular' | 'rectangular'
 * @param width - Custom width for skeleton
 * @param height - Custom height for skeleton
 * @param lines - Number of lines for text variant (default: 3)
 * @returns JSX.Element - Animated skeleton placeholder
 * 
 * @example
 * <LoadingSkeleton variant="text" lines={3} />
 * <LoadingSkeleton variant="circular" width={40} height={40} />
 */
interface LoadingSkeletonProps {
  className?: string
  variant?: 'default' | 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
}

export function LoadingSkeleton({ 
  className, 
  variant = 'default', 
  width, 
  height, 
  lines = 3 
}: LoadingSkeletonProps) {
  const variantClasses = {
    default: 'rounded-md',
    text: 'rounded-sm h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none'
  }

  const baseClasses = 'animate-pulse bg-muted'
  const combinedClasses = cn(
    baseClasses,
    variantClasses[variant],
    className
  )

  const style = {
    width: width || (variant === 'circular' ? '2.5rem' : '100%'),
    height: height || (variant === 'text' ? '1rem' : '2.5rem')
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses.text,
              index === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            style={{ height: style.height }}
          />
        ))}
      </div>
    )
  }

  return (
    <div 
      className={combinedClasses}
      style={style}
      role="status"
      aria-label="Loading content"
    />
  )
}

/**
 * CardSkeleton component - Skeleton placeholder for card layouts
 * Provides structured loading state for card components
 * 
 * @param className - Additional CSS classes for styling
 * @param showAvatar - Whether to show avatar skeleton
 * @param showTitle - Whether to show title skeleton
 * @param showDescription - Whether to show description skeleton
 * @returns JSX.Element - Card skeleton placeholder
 * 
 * @example
 * <CardSkeleton showAvatar showTitle showDescription />
 */
interface CardSkeletonProps {
  className?: string
  showAvatar?: boolean
  showTitle?: boolean
  showDescription?: boolean
}

export function CardSkeleton({ 
  className, 
  showAvatar = true, 
  showTitle = true, 
  showDescription = true 
}: CardSkeletonProps) {
  return (
    <div className={cn('p-4 space-y-4', className)}>
      {showAvatar && (
        <LoadingSkeleton variant="circular" width={40} height={40} />
      )}
      {showTitle && (
        <LoadingSkeleton variant="text" width="60%" />
      )}
      {showDescription && (
        <div className="space-y-2">
          <LoadingSkeleton variant="text" />
          <LoadingSkeleton variant="text" width="80%" />
        </div>
      )}
    </div>
  )
}

/**
 * TableSkeleton component - Skeleton placeholder for table layouts
 * Provides structured loading state for table components
 * 
 * @param rows - Number of skeleton rows (default: 5)
 * @param columns - Number of skeleton columns (default: 4)
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Table skeleton placeholder
 * 
 * @example
 * <TableSkeleton rows={5} columns={4} />
 */
interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className 
}: TableSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <LoadingSkeleton 
            key={`header-${index}`} 
            variant="text" 
            height="1.5rem"
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={`row-${rowIndex}`}
          className="grid gap-2" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton 
              key={`cell-${rowIndex}-${colIndex}`} 
              variant="text"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default LoadingSkeleton
