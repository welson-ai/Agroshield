'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * LoadingSpinner component - Animated loading indicator
 * Provides customizable loading animations
 * 
 * @param size - Spinner size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 * @param variant - Spinner style: 'default' | 'dots' | 'pulse' | 'bars' | 'bounce'
 * @param color - Spinner color: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
 * @param speed - Animation speed: 'slow' | 'normal' | 'fast'
 * @param label - Accessibility label
 * @param showLabel - Whether to show loading text
 * @param className - Additional CSS classes
 * @returns JSX.Element - Loading spinner component
 * 
 * @example
 * <LoadingSpinner size="md" variant="default" color="primary" showLabel />
 */
interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse' | 'bars' | 'bounce'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  speed?: 'slow' | 'normal' | 'fast'
  label?: string
  showLabel?: boolean
  className?: string
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ 
    size = 'md', 
    variant = 'default', 
    color = 'primary', 
    speed = 'normal', 
    label = 'Loading...', 
    showLabel = false, 
    className, 
    ...props 
  }, ref) => {
    const sizeClasses = {
      xs: {
        default: 'w-3 h-3',
        dots: 'w-2 h-2',
        pulse: 'w-3 h-3',
        bars: 'w-1 h-3',
        bounce: 'w-2 h-2'
      },
      sm: {
        default: 'w-4 h-4',
        dots: 'w-3 h-3',
        pulse: 'w-4 h-4',
        bars: 'w-1 h-4',
        bounce: 'w-3 h-3'
      },
      md: {
        default: 'w-6 h-6',
        dots: 'w-4 h-4',
        pulse: 'w-6 h-6',
        bars: 'w-2 h-6',
        bounce: 'w-4 h-4'
      },
      lg: {
        default: 'w-8 h-8',
        dots: 'w-6 h-6',
        pulse: 'w-8 h-8',
        bars: 'w-3 h-8',
        bounce: 'w-6 h-6'
      },
      xl: {
        default: 'w-12 h-12',
        dots: 'w-8 h-8',
        pulse: 'w-12 h-12',
        bars: 'w-4 h-12',
        bounce: 'w-8 h-8'
      }
    }

    const colorClasses = {
      primary: 'text-primary',
      secondary: 'text-muted-foreground',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-destructive'
    }

    const speedClasses = {
      slow: 'animate-spin-slow',
      normal: 'animate-spin',
      fast: 'animate-spin-fast'
    }

    const currentSize = sizeClasses[size][variant]
    const currentColor = colorClasses[color]
    const currentSpeed = speedClasses[speed]

    const renderSpinner = () => {
      switch (variant) {
        case 'default':
          return (
            <div
              className={cn(
                "border-2 border-current border-t-transparent rounded-full",
                currentSpeed,
                currentSize,
                currentColor
              )}
            />
          )

        case 'dots':
          return (
            <div className="flex space-x-1">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-full bg-current",
                    currentSize,
                    currentColor,
                    speed === 'slow' ? 'animate-pulse-slow' :
                    speed === 'fast' ? 'animate-pulse-fast' : 'animate-pulse'
                  )}
                  style={{
                    animationDelay: `${index * 0.2}s`
                  }}
                />
              ))}
            </div>
          )

        case 'pulse':
          return (
            <div
              className={cn(
                "rounded-full bg-current",
                currentSize,
                currentColor,
                speed === 'slow' ? 'animate-pulse-slow' :
                speed === 'fast' ? 'animate-pulse-fast' : 'animate-pulse'
              )}
            />
          )

        case 'bars':
          return (
            <div className="flex space-x-1 items-end">
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded bg-current",
                    currentSize,
                    currentColor,
                    speed === 'slow' ? 'animate-bounce-slow' :
                    speed === 'fast' ? 'animate-bounce-fast' : 'animate-bounce'
                  )}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                />
              ))}
            </div>
          )

        case 'bounce':
          return (
            <div className="flex space-x-1">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-full bg-current",
                    currentSize,
                    currentColor,
                    speed === 'slow' ? 'animate-bounce-slow' :
                    speed === 'fast' ? 'animate-bounce-fast' : 'animate-bounce'
                  )}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                />
              ))}
            </div>
          )

        default:
          return null
      }
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        role="status"
        aria-label={label}
        {...props}
      >
        {renderSpinner()}
        {showLabel && (
          <span className={cn(
            "ml-2 text-sm",
            currentColor
          )}>
            {label}
          </span>
        )}
      </div>
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

/**
 * LoadingOverlay component - Full screen loading overlay
 * 
 * @param isLoading - Whether overlay is visible
 * @param spinner - Custom spinner component
 * @param message - Loading message
 * @param backdrop - Whether to show backdrop
 * @param className - Additional CSS classes
 * @returns JSX.Element - Loading overlay
 * 
 * @example
 * <LoadingOverlay 
 *   isLoading={true} 
 *   message="Processing your request..."
 *   backdrop
 * />
 */
export const LoadingOverlay: React.FC<{
  isLoading: boolean
  spinner?: React.ReactNode
  message?: string
  backdrop?: boolean
  className?: string
}> = ({
  isLoading,
  spinner,
  message = "Loading...",
  backdrop = true,
  className
}) => {
  if (!isLoading) return null

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      backdrop && "bg-black/50 backdrop-blur-sm",
      className
    )}>
      <div className="flex flex-col items-center space-y-4">
        {spinner || <LoadingSpinner size="lg" />}
        {message && (
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * LoadingButton component - Button with loading state
 * 
 * @param isLoading - Whether button is in loading state
 * @param children - Button content
 * @param loadingText - Text to show when loading
 * @param spinnerSize - Spinner size when loading
 * @param disabled - Whether button is disabled
 * @param className - Additional CSS classes
 * @returns JSX.Element - Loading button
 * 
 * @example
 * <LoadingButton 
 *   isLoading={isSubmitting}
 *   loadingText="Submitting..."
 *   onClick={handleSubmit}
 * >
 *   Submit Form
 * </LoadingButton>
 */
export const LoadingButton: React.FC<{
  isLoading?: boolean
  children: React.ReactNode
  loadingText?: string
  spinnerSize?: 'xs' | 'sm' | 'md'
  disabled?: boolean
  className?: string
  onClick?: () => void
}> = ({
  isLoading = false,
  children,
  loadingText = "Loading...",
  spinnerSize = 'sm',
  disabled = false,
  className,
  onClick
}) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        className
      )}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading && (
        <LoadingSpinner 
          size={spinnerSize} 
          variant="default" 
          className="mr-2" 
          showLabel={false}
        />
      )}
      {isLoading ? loadingText : children}
    </button>
  )
}

/**
 * LoadingCard component - Card with loading skeleton
 * 
 * @param isLoading - Whether card is in loading state
 * @param children - Card content
 * @param skeleton - Custom skeleton component
 * @param className - Additional CSS classes
 * @returns JSX.Element - Loading card
 * 
 * @example
 * <LoadingCard isLoading={loading}>
 *   <CardContent>Card content here</CardContent>
 * </LoadingCard>
 */
export const LoadingCard: React.FC<{
  isLoading?: boolean
  children: React.ReactNode
  skeleton?: React.ReactNode
  className?: string
}> = ({
  isLoading = false,
  children,
  skeleton,
  className
}) => {
  if (isLoading) {
    return (
      <div className={cn("rounded-lg border p-6", className)}>
        {skeleton || (
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn("rounded-lg border", className)}>
      {children}
    </div>
  )
}

/**
 * LoadingProgress component - Progress with loading state
 * 
 * @param isLoading - Whether to show loading spinner
 * @param progress - Current progress value (0-100)
 * @param showPercentage - Whether to show percentage
 * @param className - Additional CSS classes
 * @returns JSX.Element - Loading progress
 * 
 * @example
 * <LoadingProgress 
 *   isLoading={true} 
 *   progress={75} 
 *   showPercentage 
 * />
 */
export const LoadingProgress: React.FC<{
  isLoading?: boolean
  progress?: number
  showPercentage?: boolean
  className?: string
}> = ({
  isLoading = false,
  progress = 0,
  showPercentage = false,
  className
}) => {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {isLoading && (
        <LoadingSpinner size="sm" showLabel={false} />
      )}
      
      <div className="flex-1">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {showPercentage && (
        <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  )
}

export { LoadingSpinner }
