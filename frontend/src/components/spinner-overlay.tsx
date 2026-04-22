'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/loading-spinner'

/**
 * SpinnerOverlay component - Full-screen overlay with loading spinner
 * Provides loading feedback for async operations
 * 
 * @param isLoading - Whether the overlay should be visible
 * @param message - Optional loading message to display
 * @param className - Additional CSS classes for styling
 * @param backdrop - Whether to show backdrop (default: true)
 * @returns JSX.Element - Loading overlay with spinner
 * 
 * @example
 * <SpinnerOverlay isLoading={true} message="Loading data..." />
 */
interface SpinnerOverlayProps {
  isLoading: boolean
  message?: string
  className?: string
  backdrop?: boolean
}

export function SpinnerOverlay({ 
  isLoading, 
  message, 
  className, 
  backdrop = true 
}: SpinnerOverlayProps) {
  if (!isLoading) return null

  return (
    <div 
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        backdrop && 'bg-background/80 backdrop-blur-sm',
        className
      )}
      role="status"
      aria-label={message || 'Loading'}
      aria-busy={true}
    >
      <div className="flex flex-col items-center space-y-4 p-4">
        <LoadingSpinner size="lg" />
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * InlineSpinner component - Inline loading spinner for smaller areas
 * Provides loading feedback within content areas
 * 
 * @param isLoading - Whether the spinner should be visible
 * @param message - Optional loading message to display
 * @param size - Spinner size: 'sm' | 'md' | 'lg' | 'xl'
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Inline loading spinner
 * 
 * @example
 * <InlineSpinner isLoading={loading} message="Saving..." size="md" />
 */
interface InlineSpinnerProps {
  isLoading: boolean
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function InlineSpinner({ 
  isLoading, 
  message, 
  size = 'md', 
  className 
}: InlineSpinnerProps) {
  if (!isLoading) return null

  return (
    <div 
      className={cn('flex items-center space-x-2', className)}
      role="status"
      aria-label={message || 'Loading'}
      aria-busy={true}
    >
      <LoadingSpinner size={size} />
      {message && (
        <span className="text-sm text-muted-foreground animate-pulse">
          {message}
        </span>
      )}
    </div>
  )
}

/**
 * ButtonSpinner component - Spinner for button loading states
 * Replaces button content with spinner during async operations
 * 
 * @param isLoading - Whether the spinner should be visible
 * @param children - Button content to show when not loading
 * @param loadingText - Text to show during loading
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Button with integrated spinner
 * 
 * @example
 * <ButtonSpinner isLoading={saving} loadingText="Saving...">
 *   Save Changes
 * </ButtonSpinner>
 */
interface ButtonSpinnerProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  className?: string
}

export function ButtonSpinner({ 
  isLoading, 
  children, 
  loadingText = 'Loading...', 
  className 
}: ButtonSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </div>
  )
}

/**
 * ProgressSpinner component - Spinner with progress indicator
 * Shows loading progress with customizable steps
 * 
 * @param isLoading - Whether the spinner should be visible
 * @param progress - Current progress (0-100)
 * @param message - Optional progress message
 * @param steps - Total number of steps for progress calculation
 * @param currentStep - Current step number
 * @returns JSX.Element - Progress spinner with indicator
 * 
 * @example
 * <ProgressSpinner 
 *   isLoading={true} 
 *   progress={60} 
 *   message="Processing files..." 
 * />
 */
interface ProgressSpinnerProps {
  isLoading: boolean
  progress?: number
  message?: string
  steps?: number
  currentStep?: number
}

export function ProgressSpinner({ 
  isLoading, 
  progress, 
  message, 
  steps, 
  currentStep 
}: ProgressSpinnerProps) {
  if (!isLoading) return null

  const calculatedProgress = steps && currentStep 
    ? (currentStep / steps) * 100 
    : progress || 0

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="relative">
        <LoadingSpinner size="lg" />
        {calculatedProgress > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium">
              {Math.round(calculatedProgress)}%
            </span>
          </div>
        )}
      </div>
      
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse text-center">
          {message}
        </p>
      )}
      
      {steps && currentStep && (
        <p className="text-xs text-muted-foreground">
          Step {currentStep} of {steps}
        </p>
      )}
    </div>
  )
}

export default SpinnerOverlay
