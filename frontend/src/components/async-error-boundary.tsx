'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, RefreshCw, Zap } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  timeout?: number
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  isLoading: boolean
  isTimeout: boolean
  retryCount: number
}

/**
 * AsyncErrorBoundary component - Catches async operation errors and timeouts
 * Provides fallback UI for async operations that fail or take too long
 * 
 * @param children - Child components to wrap with async error boundary
 * @param fallback - Optional custom fallback component
 * @param timeout - Timeout in milliseconds (default: 10000)
 * @returns JSX.Element - Async error boundary wrapper with timeout handling
 * 
 * @example
 * <AsyncErrorBoundary timeout={5000}>
 *   <AsyncComponent />
 * </AsyncErrorBoundary>
 */
class AsyncErrorBoundary extends Component<Props, State> {
  private timeoutId?: NodeJS.Timeout

  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      isLoading: false,
      isTimeout: false,
      retryCount: 0
    }
  }

  componentDidMount() {
    this.startTimeout()
  }

  componentWillUnmount() {
    this.clearTimeout()
  }

  static getDerivedStateFromError(error: Error): State {
    const isAsyncError = error.message.includes('async') ||
                        error.message.includes('promise') ||
                        error.message.includes('timeout') ||
                        error.name === 'TimeoutError'

    return { 
      hasError: true, 
      error,
      isLoading: false,
      isTimeout: error.name === 'TimeoutError',
      retryCount: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      isLoading: false
    })

    // Log async error
    if (process.env.NODE_ENV === 'development') {
      console.error('AsyncErrorBoundary caught an async error:', error, errorInfo)
    }

    // In production, send to error monitoring service
    // logAsyncErrorToService(error, errorInfo)
  }

  startTimeout = () => {
    const { timeout = 10000 } = this.props
    
    this.timeoutId = setTimeout(() => {
      this.setState({
        hasError: true,
        error: new Error(`Operation timed out after ${timeout}ms`),
        errorInfo: { componentStack: 'Async operation timeout' },
        isLoading: false,
        isTimeout: true
      })
    }, timeout)
  }

  clearTimeout = () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
  }

  setLoading = (loading: boolean) => {
    this.setState({ isLoading: loading })
  }

  handleRetry = () => {
    const { retryCount } = this.state
    const maxRetries = 3

    if (retryCount < maxRetries) {
      this.clearTimeout()
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        isLoading: true,
        isTimeout: false,
        retryCount: prevState.retryCount + 1
      }), () => {
        this.startTimeout()
      })
    }
  }

  handleRefresh = () => {
    window.location.reload()
  }

  isAsyncError = (error?: Error): boolean => {
    if (!error) return false
    
    const asyncErrorPatterns = [
      'async',
      'promise',
      'timeout',
      'await',
      'async function',
      'Promise',
      'TimeoutError'
    ]

    return asyncErrorPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase()) ||
      error.name?.toLowerCase().includes(pattern.toLowerCase())
    )
  }

  render() {
    const { hasError, error, isLoading, isTimeout, retryCount } = this.state

    if (hasError && (this.isAsyncError(error) || isTimeout)) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const maxRetries = 3
      const canRetry = retryCount < maxRetries

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                {isTimeout ? (
                  <Clock className="w-6 h-6 text-purple-600" />
                ) : (
                  <Zap className="w-6 h-6 text-purple-600" />
                )}
              </div>
              <CardTitle className="text-purple-600">
                {isTimeout ? 'Operation Timeout' : 'Async Error'}
              </CardTitle>
              <CardDescription>
                {isTimeout 
                  ? 'The operation took too long to complete. Please try again.'
                  : 'An async operation failed. Please retry the operation.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Retrying...</span>
                </div>
              )}

              {/* Retry Counter */}
              {retryCount > 0 && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Retry attempts: {retryCount}/{maxRetries}
                  </p>
                </div>
              )}

              {/* Error Details in Development */}
              {process.env.NODE_ENV === 'development' && error && (
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">
                    {isTimeout ? 'Timeout Details:' : 'Async Error Details:'}
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {error.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer">Component Stack</summary>
                      <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {canRetry && !isLoading && (
                  <Button onClick={this.handleRetry} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {retryCount === 0 ? 'Retry' : `Retry (${retryCount + 1}/${maxRetries})`}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={this.handleRefresh}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Refresh Page
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  {isTimeout 
                    ? 'This may be due to slow network or server issues. Please check your connection.'
                    : 'Async operations may fail due to network issues or server problems.'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Context provider for async operations
interface AsyncContextValue {
  setLoading: (loading: boolean) => void
  isLoading: boolean
}

const AsyncContext = React.createContext<AsyncContextValue | undefined>(undefined)

/**
 * AsyncContextProvider component - Provides context for async operations
 * Allows child components to communicate loading state to AsyncErrorBoundary
 * 
 * @param children - Child components to wrap with async context
 * @returns JSX.Element - Async context provider
 * 
 * @example
 * <AsyncContextProvider>
 *   <AsyncComponent />
 * </AsyncContextProvider>
 */
export function AsyncContextProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(false)

  const setLoading = React.useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  const value = React.useMemo(() => ({
    setLoading,
    isLoading
  }), [setLoading, isLoading])

  return (
    <AsyncContext.Provider value={value}>
      {children}
    </AsyncContext.Provider>
  )
}

/**
 * useAsyncContext hook - Access async context in child components
 * Provides setLoading function for async operations
 * 
 * @returns AsyncContextValue - Context value with setLoading and isLoading
 * @throws Error if used outside AsyncContextProvider
 * 
 * @example
 * const { setLoading, isLoading } = useAsyncContext()
 * 
 * const fetchData = async () => {
 *   setLoading(true)
 *   try {
 *     await apiCall()
 *   } finally {
 *     setLoading(false)
 *   }
 * }
 */
export function useAsyncContext(): AsyncContextValue {
  const context = React.useContext(AsyncContext)
  if (context === undefined) {
    throw new Error('useAsyncContext must be used within an AsyncContextProvider')
  }
  return context
}

export default AsyncErrorBoundary
