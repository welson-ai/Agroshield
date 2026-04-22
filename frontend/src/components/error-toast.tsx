'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

/**
 * ErrorToast component - Toast notification for error messages
 * Provides user-friendly error display with dismiss functionality
 * 
 * @param error - Error object or message string
 * @param onDismiss - Callback function when toast is dismissed
 * @param className - Additional CSS classes for styling
 * @param autoDismiss - Whether to auto-dismiss after timeout (default: false)
 * @param timeout - Auto-dismiss timeout in milliseconds (default: 5000)
 * @returns JSX.Element - Error toast notification
 * 
 * @example
 * <ErrorToast 
 *   error={errorMessage} 
 *   onDismiss={() => setShowError(false)} 
 * />
 */
interface ErrorToastProps {
  error: Error | string
  onDismiss: () => void
  className?: string
  autoDismiss?: boolean
  timeout?: number
}

export function ErrorToast({ 
  error, 
  onDismiss, 
  className, 
  autoDismiss = false, 
  timeout = 5000 
}: ErrorToastProps) {
  const errorMessage = typeof error === 'string' ? error : error.message
  const errorTitle = typeof error === 'string' ? 'Error' : error.name || 'Error'

  React.useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(onDismiss, timeout)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, timeout, onDismiss])

  return (
    <Card className={cn(
      'border-destructive bg-destructive/10 shadow-lg max-w-md',
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-destructive">
              {errorTitle}
            </h4>
            <p className="text-sm text-destructive/80 mt-1 break-words">
              {errorMessage}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * SuccessToast component - Toast notification for success messages
 * Provides positive feedback for successful operations
 * 
 * @param message - Success message to display
 * @param onDismiss - Callback function when toast is dismissed
 * @param className - Additional CSS classes for styling
 * @param autoDismiss - Whether to auto-dismiss after timeout (default: true)
 * @param timeout - Auto-dismiss timeout in milliseconds (default: 3000)
 * @returns JSX.Element - Success toast notification
 * 
 * @example
 * <SuccessToast 
 *   message="Operation completed successfully!" 
 *   onDismiss={() => setShowSuccess(false)} 
 * />
 */
interface SuccessToastProps {
  message: string
  onDismiss: () => void
  className?: string
  autoDismiss?: boolean
  timeout?: number
}

export function SuccessToast({ 
  message, 
  onDismiss, 
  className, 
  autoDismiss = true, 
  timeout = 3000 
}: SuccessToastProps) {
  React.useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(onDismiss, timeout)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, timeout, onDismiss])

  return (
    <Card className={cn(
      'border-green-600 bg-green-50 dark:bg-green-950/20 shadow-lg max-w-md',
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
              Success
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              {message}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
              aria-label="Dismiss success"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * InfoToast component - Toast notification for informational messages
 * Provides neutral feedback for informational content
 * 
 * @param message - Information message to display
 * @param onDismiss - Callback function when toast is dismissed
 * @param className - Additional CSS classes for styling
 * @param autoDismiss - Whether to auto-dismiss after timeout (default: true)
 * @param timeout - Auto-dismiss timeout in milliseconds (default: 4000)
 * @returns JSX.Element - Info toast notification
 * 
 * @example
 * <InfoToast 
 *   message="New features available!" 
 *   onDismiss={() => setShowInfo(false)} 
 * />
 */
interface InfoToastProps {
  message: string
  onDismiss: () => void
  className?: string
  autoDismiss?: boolean
  timeout?: number
}

export function InfoToast({ 
  message, 
  onDismiss, 
  className, 
  autoDismiss = true, 
  timeout = 4000 
}: InfoToastProps) {
  React.useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(onDismiss, timeout)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, timeout, onDismiss])

  return (
    <Card className={cn(
      'border-blue-600 bg-blue-50 dark:bg-blue-950/20 shadow-lg max-w-md',
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Information
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {message}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
              aria-label="Dismiss info"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * WarningToast component - Toast notification for warning messages
 * Provides warning feedback for potentially problematic situations
 * 
 * @param message - Warning message to display
 * @param onDismiss - Callback function when toast is dismissed
 * @param className - Additional CSS classes for styling
 * @param autoDismiss - Whether to auto-dismiss after timeout (default: false)
 * @param timeout - Auto-dismiss timeout in milliseconds (default: 6000)
 * @returns JSX.Element - Warning toast notification
 * 
 * @example
 * <WarningToast 
 *   message="Unsaved changes will be lost" 
 *   onDismiss={() => setShowWarning(false)} 
 * />
 */
interface WarningToastProps {
  message: string
  onDismiss: () => void
  className?: string
  autoDismiss?: boolean
  timeout?: number
}

export function WarningToast({ 
  message, 
  onDismiss, 
  className, 
  autoDismiss = false, 
  timeout = 6000 
}: WarningToastProps) {
  React.useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(onDismiss, timeout)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, timeout, onDismiss])

  return (
    <Card className={cn(
      'border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 shadow-lg max-w-md',
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Warning
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              {message}
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-700"
              aria-label="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ErrorToast
