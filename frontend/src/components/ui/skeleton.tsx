'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Skeleton component - Loading placeholder
 * Provides animated loading placeholders for content
 * 
 * @param className - Additional CSS classes
 * @param variant - Skeleton variant: 'default' | 'text' | 'circular' | 'rectangular'
 * @param width - Custom width
 * @param height - Custom height
 * @param lines - Number of lines for text variant
 * @param animated - Whether to show animation
 * @returns JSX.Element - Skeleton component
 * 
 * @example
 * <Skeleton variant="text" lines={3} />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="rectangular" width="100%" height={200} />
 */
interface SkeletonProps {
  className?: string
  variant?: 'default' | 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
  animated?: boolean
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = 'default', 
    width, 
    height, 
    lines = 1, 
    animated = true, 
    ...props 
  }, ref) => {
    const variantClasses = {
      default: "rounded-md",
      text: "rounded-none h-4",
      circular: "rounded-full",
      rectangular: "rounded-md"
    }

    const animationClass = animated ? "animate-pulse" : ""

    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {Array.from({ length: lines }, (_, index) => (
            <div
              key={index}
              className={cn(
                "h-4 bg-muted rounded",
                animationClass,
                index === lines - 1 && "w-3/4" // Last line is shorter
              )}
              style={{
                width: index === 0 ? "100%" : `${90 - (index * 10)}%`
              }}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          "bg-muted",
          variantClasses[variant],
          animationClass,
          className
        )}
        style={{
          width: width || (variant === 'circular' ? '40px' : '100%'),
          height: height || (variant === 'text' ? '16px' : variant === 'circular' ? '40px' : '20px')
        }}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

/**
 * SkeletonCard component - Card skeleton placeholder
 * 
 * @param showAvatar - Whether to show avatar skeleton
 * @param showTitle - Whether to show title skeleton
 * @param showDescription - Whether to show description skeleton
 * @param showFooter - Whether to show footer skeleton
 * @param className - Additional CSS classes
 * @returns JSX.Element - Skeleton card
 * 
 * @example
 * <SkeletonCard showAvatar showTitle showDescription showFooter />
 */
export const SkeletonCard: React.FC<{
  showAvatar?: boolean
  showTitle?: boolean
  showDescription?: boolean
  showFooter?: boolean
  className?: string
}> = ({
  showAvatar = true,
  showTitle = true,
  showDescription = true,
  showFooter = false,
  className
}) => {
  return (
    <div className={cn("rounded-lg border p-4 space-y-4", className)}>
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      )}
      
      {showTitle && <Skeleton variant="text" width="80%" />}
      
      {showDescription && (
        <div className="space-y-2">
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="70%" />
        </div>
      )}
      
      {showFooter && (
        <div className="flex justify-between">
          <Skeleton variant="rectangular" width={80} height={32} />
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
      )}
    </div>
  )
}

/**
 * SkeletonTable component - Table skeleton placeholder
 * 
 * @param rows - Number of rows
 * @param columns - Number of columns
 * @param showHeader - Whether to show header skeleton
 * @param className - Additional CSS classes
 * @returns JSX.Element - Skeleton table
 * 
 * @example
 * <SkeletonTable rows={5} columns={4} showHeader />
 */
export const SkeletonTable: React.FC<{
  rows?: number
  columns?: number
  showHeader?: boolean
  className?: string
}> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className
}) => {
  return (
    <div className={cn("w-full space-y-4", className)}>
      {showHeader && (
        <div className="flex space-x-4 pb-2 border-b">
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton
              key={index}
              variant="text"
              width={index === 0 ? "150px" : "100px"}
              height={16}
            />
          ))}
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4">
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                width={colIndex === 0 ? "120px" : colIndex === columns - 1 ? "80px" : "100px"}
                height={16}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * SkeletonList component - List skeleton placeholder
 * 
 * @param items - Number of list items
 * * @param showAvatar - Whether to show avatar for each item
 * @param showIcon - Whether to show icon for each item
 * @param className - Additional CSS classes
 * @returns JSX.Element - Skeleton list
 * 
 * @example
 * <SkeletonList items={5} showAvatar />
 */
export const SkeletonList: React.FC<{
  items?: number
  showAvatar?: boolean
  showIcon?: boolean
  className?: string
}> = ({
  items = 5,
  showAvatar = false,
  showIcon = false,
  className
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="flex items-center space-x-3">
          {showAvatar && <Skeleton variant="circular" width={32} height={32} />}
          {showIcon && <Skeleton variant="rectangular" width={16} height={16} />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width={`${80 - (index * 5)}%`} />
            <Skeleton variant="text" width={`${60 - (index * 3)}%`} />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * SkeletonChart component - Chart skeleton placeholder
 * 
 * @param type - Chart type: 'bar' | 'line' | 'pie' | 'area'
 * @param height - Chart height
 * @param className - Additional CSS classes
 * @returns JSX.Element - Skeleton chart
 * 
 * @example
 * <SkeletonChart type="bar" height={300} />
 */
export const SkeletonChart: React.FC<{
  type?: 'bar' | 'line' | 'pie' | 'area'
  height?: number
  className?: string
}> = ({
  type = 'bar',
  height = 300,
  className
}) => {
  if (type === 'pie') {
    return (
      <div 
        className={cn("flex items-center justify-center", className)}
        style={{ height }}
      >
        <Skeleton variant="circular" width={200} height={200} />
      </div>
    )
  }

  if (type === 'line' || type === 'area') {
    return (
      <div className={cn("space-y-4", className)} style={{ height }}>
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={2}
              width={`${100 - (index * 15)}%`}
              className="ml-auto"
            />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={2}
              width={`${50 + (index * 10)}%`}
            />
          ))}
        </div>
      </div>
    )
  }

  // Bar chart
  return (
    <div 
      className={cn("flex items-end space-x-2", className)}
      style={{ height }}
    >
      {Array.from({ length: 8 }, (_, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          width="20px"
          height={`${Math.random() * 60 + 20}%`}
        />
      ))}
    </div>
  )
}

/**
 * SkeletonForm component - Form skeleton placeholder
 * 
 * @param fields - Number of form fields
 * @param showButton - Whether to show submit button skeleton
 * @param className - Additional CSS classes
 * @returns JSX Element - Skeleton form
 * 
 * @example
 * <SkeletonForm fields={4} showButton />
 */
export const SkeletonForm: React.FC<{
  fields?: number
  showButton?: boolean
  className?: string
}> = ({
  fields = 4,
  showButton = true,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" width="30%" height={14} />
          <Skeleton variant="rectangular" height={40} />
        </div>
      ))}
      
      {showButton && (
        <Skeleton variant="rectangular" width={120} height={40} />
      )}
    </div>
  )
}

export { Skeleton }
