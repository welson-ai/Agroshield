'use client'

import React from 'react'
import ErrorBoundary from './error-boundary'
import NetworkErrorBoundary from './network-error-boundary'
import AsyncErrorBoundary from './async-error-boundary'
import TransactionErrorBoundary from './transaction-error-boundary'

/**
 * ErrorBoundaryIndex component - Combined error boundary system
 * Provides comprehensive error handling with multiple specialized boundaries
 * 
 * @param children - Child components to wrap with error boundaries
 * @param showNetworkBoundary - Whether to include network error boundary (default: true)
 * @param showAsyncBoundary - Whether to include async error boundary (default: true)
 * @param showTransactionBoundary - Whether to include transaction error boundary (default: true)
 * @param timeout - Timeout for async boundary in milliseconds (default: 10000)
 * @param onRetryTransaction - Callback for transaction retry
 * @returns JSX.Element - Nested error boundaries for comprehensive error handling
 * 
 * @example
 * <ErrorBoundaryIndex>
 *   <App />
 * </ErrorBoundaryIndex>
 */
interface ErrorBoundaryIndexProps {
  children: React.ReactNode
  showNetworkBoundary?: boolean
  showAsyncBoundary?: boolean
  showTransactionBoundary?: boolean
  timeout?: number
  onRetryTransaction?: () => void
}

export function ErrorBoundaryIndex({
  children,
  showNetworkBoundary = true,
  showAsyncBoundary = true,
  showTransactionBoundary = true,
  timeout = 10000,
  onRetryTransaction
}: ErrorBoundaryIndexProps) {
  let content = children

  // Wrap with TransactionErrorBoundary if enabled
  if (showTransactionBoundary) {
    content = (
      <TransactionErrorBoundary onRetryTransaction={onRetryTransaction}>
        {content}
      </TransactionErrorBoundary>
    )
  }

  // Wrap with AsyncErrorBoundary if enabled
  if (showAsyncBoundary) {
    content = (
      <AsyncErrorBoundary timeout={timeout}>
        {content}
      </AsyncErrorBoundary>
    )
  }

  // Wrap with NetworkErrorBoundary if enabled
  if (showNetworkBoundary) {
    content = (
      <NetworkErrorBoundary>
        {content}
      </NetworkErrorBoundary>
    )
  }

  // Always wrap with base ErrorBoundary
  content = (
    <ErrorBoundary>
      {content}
    </ErrorBoundary>
  )

  return content
}

/**
 * withErrorBoundary HOC - Higher-order component for error boundary wrapping
 * Provides a convenient way to add error boundaries to any component
 * 
 * @param Component - Component to wrap with error boundary
 * @param options - Error boundary configuration options
 * @returns Wrapped component with error boundary
 * 
 * @example
 * const MyComponent = withErrorBoundary(MyComponent, {
 *   showNetworkBoundary: true,
 *   showAsyncBoundary: true,
 *   timeout: 5000
 * })
 */
interface WithErrorBoundaryOptions {
  showNetworkBoundary?: boolean
  showAsyncBoundary?: boolean
  showTransactionBoundary?: boolean
  timeout?: number
  onRetryTransaction?: () => void
  fallback?: React.ReactNode
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundaryIndex {...options}>
      <Component {...props} />
    </ErrorBoundaryIndex>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

/**
 * ErrorBoundaryProvider component - Context provider for error boundary configuration
 * Allows global configuration of error boundary behavior
 * 
 * @param children - Child components
 * @param config - Global error boundary configuration
 * @returns JSX.Element - Context provider with error boundary config
 * 
 * @example
 * <ErrorBoundaryProvider config={{ timeout: 8000, showNetworkBoundary: true }}>
 *   <App />
 * </ErrorBoundaryProvider>
 */
interface ErrorBoundaryConfig {
  timeout?: number
  showNetworkBoundary?: boolean
  showAsyncBoundary?: boolean
  showTransactionBoundary?: boolean
  enableLogging?: boolean
  maxRetries?: number
}

interface ErrorBoundaryProviderProps {
  children: React.ReactNode
  config?: ErrorBoundaryConfig
}

const ErrorBoundaryContext = React.createContext<ErrorBoundaryConfig | undefined>(undefined)

export function ErrorBoundaryProvider({ 
  children, 
  config = {} 
}: ErrorBoundaryProviderProps) {
  const defaultConfig: ErrorBoundaryConfig = {
    timeout: 10000,
    showNetworkBoundary: true,
    showAsyncBoundary: true,
    showTransactionBoundary: true,
    enableLogging: true,
    maxRetries: 3,
    ...config
  }

  return (
    <ErrorBoundaryContext.Provider value={defaultConfig}>
      {children}
    </ErrorBoundaryContext.Provider>
  )
}

/**
 * useErrorBoundaryConfig hook - Access error boundary configuration
 * Provides access to global error boundary settings
 * 
 * @returns ErrorBoundaryConfig - Current error boundary configuration
 * 
 * @example
 * const config = useErrorBoundaryConfig()
 * console.log('Timeout:', config.timeout)
 */
export function useErrorBoundaryConfig(): ErrorBoundaryConfig {
  const config = React.useContext(ErrorBoundaryContext)
  if (config === undefined) {
    // Return default config if not in provider
    return {
      timeout: 10000,
      showNetworkBoundary: true,
      showAsyncBoundary: true,
      showTransactionBoundary: true,
      enableLogging: true,
      maxRetries: 3
    }
  }
  return config
}

/**
 * ErrorBoundaryLogger component - Utility for error logging
 * Provides centralized error logging functionality
 * 
 * @param error - Error object to log
 * @param errorInfo - Additional error information
 * @param context - Context where error occurred
 * 
 * @example
 * ErrorBoundaryLogger.logError(error, errorInfo, 'TransactionComponent')
 */
export class ErrorBoundaryLogger {
  static logError(error: Error, errorInfo?: ErrorInfo, context?: string) {
    const config = useErrorBoundaryConfig()
    
    if (!config.enableLogging) return

    const errorData = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundaryLogger:', errorData)
    }

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // sendErrorToMonitoringService(errorData)
    }
  }

  static logNetworkError(error: Error, context?: string) {
    this.logError(error, undefined, `Network: ${context}`)
  }

  static logAsyncError(error: Error, context?: string) {
    this.logError(error, undefined, `Async: ${context}`)
  }

  static logTransactionError(error: Error, context?: string) {
    this.logError(error, undefined, `Transaction: ${context}`)
  }
}

// Export all error boundaries for easy importing
export {
  ErrorBoundary,
  NetworkErrorBoundary,
  AsyncErrorBoundary,
  TransactionErrorBoundary
}

export default ErrorBoundaryIndex
