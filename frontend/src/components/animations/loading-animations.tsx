'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/**
 * LoadingSpinner component - Advanced loading spinner with variations
 * Provides multiple spinner styles and animations
 * 
 * @param size - Spinner size: 'sm' | 'md' | 'lg' | 'xl'
 * @param variant - Spinner variant: 'default' | 'dots' | 'pulse' | 'bounce' | 'wave'
 * @param color - Spinner color: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Loading spinner
 * 
 * @example
 * <LoadingSpinner size="md" variant="dots" color="primary" />
 */
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'pulse' | 'bounce' | 'wave'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  color = 'primary', 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    destructive: 'text-destructive'
  }

  switch (variant) {
    case 'dots':
      return (
        <div className={cn('flex space-x-1', className)}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={cn(
                'rounded-full bg-current',
                sizeClasses[size],
                colorClasses[color]
              )}
              style={{
                animation: `bounce 1.4s infinite ease-in-out both`,
                animationDelay: `${index * 0.16}s`
              }}
            />
          ))}
        </div>
      )
    
    case 'pulse':
      return (
        <div
          className={cn(
            'rounded-full bg-current',
            sizeClasses[size],
            colorClasses[color],
            'animate-pulse'
          )}
        />
      )
    
    case 'bounce':
      return (
        <div className={cn('flex space-x-1', className)}>
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={cn(
                'rounded-full bg-current',
                sizeClasses[size],
                colorClasses[color]
              )}
              style={{
                animation: `bounce 1s infinite ease-in-out both`,
                animationDelay: `${index * 0.2}s`
              }}
            />
          ))}
        </div>
      )
    
    case 'wave':
      return (
        <div className={cn('flex space-x-1', className)}>
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={cn(
                'rounded-full bg-current',
                sizeClasses[size],
                colorClasses[color]
              )}
              style={{
                animation: `wave 1.2s infinite ease-in-out`,
                animationDelay: `${index * 0.1}s`
              }}
            />
          ))}
        </div>
      )
    
    default:
      return (
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-current border-t-transparent',
            sizeClasses[size],
            colorClasses[color],
            className
          )}
        />
      )
  }
}

/**
 * SkeletonLoader component - Advanced skeleton loading with animations
 * Provides animated skeleton placeholders for content loading
 * 
 * @param lines - Number of skeleton lines
 * @param className - Additional CSS classes for styling
 * @param variant - Skeleton variant: 'text' | 'card' | 'avatar' | 'custom'
 * @param animated - Whether to show shimmer animation
 * @returns JSX.Element - Skeleton loader
 * 
 * @example
 * <SkeletonLoader lines={3} variant="text" animated />
 */
export interface SkeletonLoaderProps {
  lines?: number
  className?: string
  variant?: 'text' | 'card' | 'avatar' | 'custom'
  animated?: boolean
}

export function SkeletonLoader({ 
  lines = 3, 
  className, 
  variant = 'text', 
  animated = true 
}: SkeletonLoaderProps) {
  const baseClasses = 'bg-muted'
  const animatedClasses = animated ? 'animate-pulse' : ''

  switch (variant) {
    case 'text':
      return (
        <div className={cn('space-y-2', className)}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                baseClasses,
                animatedClasses,
                'h-4 rounded',
                index === lines - 1 ? 'w-3/4' : 'w-full'
              )}
            />
          ))}
        </div>
      )
    
    case 'card':
      return (
        <div className={cn('p-4 space-y-3', className)}>
          <div className={cn(baseClasses, animatedClasses, 'h-4 w-2/3 rounded')} />
          <div className={cn(baseClasses, animatedClasses, 'h-3 w-full rounded')} />
          <div className={cn(baseClasses, animatedClasses, 'h-3 w-4/5 rounded')} />
        </div>
      )
    
    case 'avatar':
      return (
        <div className={cn('flex items-center space-x-3', className)}>
          <div className={cn(baseClasses, animatedClasses, 'w-10 h-10 rounded-full')} />
          <div className="space-y-2">
            <div className={cn(baseClasses, animatedClasses, 'h-4 w-24 rounded')} />
            <div className={cn(baseClasses, animatedClasses, 'h-3 w-32 rounded')} />
          </div>
        </div>
      )
    
    default:
      return (
        <div className={cn(baseClasses, animatedClasses, className)} />
      )
  }
}

/**
 * ProgressBar component - Animated progress bar with variations
 * Provides multiple progress bar styles and animations
 * 
 * @param value - Progress value (0-100)
 * @param variant - Progress variant: 'default' | 'striped' | 'animated' | 'indeterminate'
 * @param color - Progress color: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
 * @param size - Progress bar size: 'sm' | 'md' | 'lg'
 * @param showLabel - Whether to show percentage label
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Progress bar
 * 
 * @example
 * <ProgressBar value={75} variant="animated" color="success" showLabel />
 */
export interface ProgressBarProps {
  value: number
  variant?: 'default' | 'striped' | 'animated' | 'indeterminate'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ 
  value, 
  variant = 'default', 
  color = 'primary', 
  size = 'md', 
  showLabel = false, 
  className 
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  }

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    destructive: 'bg-destructive'
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'striped':
        return 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:1rem_1rem] bg-repeat'
      case 'animated':
        return 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:1rem_1rem] bg-repeat animate-pulse'
      case 'indeterminate':
        return 'animate-pulse'
      default:
        return ''
    }
  }

  if (variant === 'indeterminate') {
    return (
      <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizeClasses[size], className)}>
        <div
          className={cn(
            'h-full rounded-full',
            colorClasses[color],
            'animate-pulse'
          )}
          style={{ width: '30%' }}
        />
      </div>
    )
  }

  return (
    <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizeClasses[size], className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          colorClasses[color],
          getVariantClasses()
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      >
        {showLabel && (
          <span className="flex items-center justify-center h-full text-xs text-white font-medium">
            {Math.round(value)}%
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * PulseLoader component - Pulsing loading animation
 * Provides pulsing effect for loading states
 * 
 * @param size - Loader size: 'sm' | 'md' | 'lg'
 * @param color - Loader color: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Pulse loader
 * 
 * @example
 * <PulseLoader size="md" color="primary" />
 */
export interface PulseLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
  className?: string
}

export function PulseLoader({ 
  size = 'md', 
  color = 'primary', 
  className 
}: PulseLoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    destructive: 'bg-destructive'
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'rounded-full animate-ping absolute inline-flex h-full w-full',
          colorClasses[color],
          'opacity-20'
        )}
      />
      <div
        className={cn(
          'rounded-full animate-pulse relative inline-flex',
          sizeClasses[size],
          colorClasses[color]
        )}
      />
    </div>
  )
}

/**
 * WaveLoader component - Wave animation loader
 * Provides wave-like loading animation
 * 
 * @param bars - Number of wave bars
 * @param size - Bar size: 'sm' | 'md' | 'lg'
 * @param color - Loader color: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Wave loader
 * 
 * @example
 * <WaveLoader bars={5} size="md" color="primary" />
 */
export interface WaveLoaderProps {
  bars?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
  className?: string
}

export function WaveLoader({ 
  bars = 5, 
  size = 'md', 
  color = 'primary', 
  className 
}: WaveLoaderProps) {
  const sizeClasses = {
    sm: 'w-1 h-4',
    md: 'w-2 h-6',
    lg: 'w-3 h-8'
  }

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    destructive: 'bg-destructive'
  }

  return (
    <div className={cn('flex items-end space-x-1', className)}>
      {Array.from({ length: bars }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'rounded-full',
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{
            animation: `wave 1.2s infinite ease-in-out`,
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  )
}

// Add CSS animations
const style = document.createElement('style')
style.textContent = `
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
  
  @keyframes wave {
    0%, 40%, 100% {
      transform: scaleY(0.4);
    }
    20% {
      transform: scaleY(1);
    }
  }
`
document.head.appendChild(style)

export default LoadingSpinner
