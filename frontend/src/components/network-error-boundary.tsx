'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  isOnline: boolean
  retryCount: number
}

/**
 * NetworkErrorBoundary component - Catches network-related errors
 * Provides fallback UI for network connectivity issues
 * 
 * @param children - Child components to wrap with network error boundary
 * @param fallback - Optional custom fallback component
 * @returns JSX.Element - Network error boundary wrapper with connectivity handling
 * 
 * @example
 * <NetworkErrorBoundary>
 *   <App />
 * </NetworkErrorBoundary>
 */
class NetworkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      isOnline: navigator.onLine,
      retryCount: 0
    }
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  }

  static getDerivedStateFromError(error: Error): State {
    const isNetworkError = error.message.includes('fetch') ||
                          error.message.includes('network') ||
                          error.message.includes('Failed to fetch') ||
                          error.message.includes('NetworkError')

    return { 
      hasError: true, 
      error,
      isOnline: navigator.onLine,
      retryCount: 0
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log network error
    if (process.env.NODE_ENV === 'development') {
      console.error('NetworkErrorBoundary caught a network error:', error, errorInfo)
    }

    // In production, send to error monitoring service
    // logNetworkErrorToService(error, errorInfo)
  }

  handleOnline = () => {
    this.setState({ isOnline: true })
  }

  handleOffline = () => {
    this.setState({ isOnline: false })
  }

  handleRetry = () => {
    const { retryCount } = this.state
    const maxRetries = 3

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  handleRefresh = () => {
    window.location.reload()
  }

  isNetworkError = (error?: Error): boolean => {
    if (!error) return false
    
    const networkErrorPatterns = [
      'fetch',
      'network',
      'Failed to fetch',
      'NetworkError',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_NAME_NOT_RESOLVED'
    ]

    return networkErrorPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern.toLowerCase())
    )
  }

  render() {
    const { hasError, error, isOnline, retryCount } = this.state

    if (hasError && this.isNetworkError(error)) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const maxRetries = 3
      const canRetry = retryCount < maxRetries

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
                {isOnline ? (
                  <WifiOff className="w-6 h-6 text-orange-600" />
                ) : (
                  <WifiOff className="w-6 h-6 text-red-600" />
                )}
              </div>
              <CardTitle className={isOnline ? 'text-orange-600' : 'text-red-600'}>
                {isOnline ? 'Network Error' : 'Connection Lost'}
              </CardTitle>
              <CardDescription>
                {isOnline 
                  ? 'Unable to connect to our servers. Please check your connection and try again.'
                  : 'You appear to be offline. Please check your internet connection.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Connection Status */}
              <div className="flex items-center justify-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-muted-foreground">
                  {isOnline ? 'Connected to internet' : 'Offline'}
                </span>
              </div>

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
                  <h4 className="font-medium text-sm mb-2">Network Error Details:</h4>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {error.message}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {canRetry && (
                  <Button onClick={this.handleRetry} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {retryCount === 0 ? 'Try Again' : `Retry (${retryCount + 1}/${maxRetries})`}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={this.handleRefresh}
                  className="flex-1"
                >
                  Refresh Page
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  If the problem persists, please contact support or check your network settings.
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

export default NetworkErrorBoundary
