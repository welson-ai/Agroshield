'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CreditCard, RefreshCw, Wallet } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onRetryTransaction?: () => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorType?: 'insufficient_funds' | 'network' | 'gas_limit' | 'user_rejected' | 'contract' | 'unknown'
  retryCount: number
}

/**
 * TransactionErrorBoundary component - Catches blockchain transaction errors
 * Provides fallback UI for failed transactions with specific error handling
 * 
 * @param children - Child components to wrap with transaction error boundary
 * @param fallback - Optional custom fallback component
 * @param onRetryTransaction - Optional callback for retrying transactions
 * @returns JSX.Element - Transaction error boundary wrapper with blockchain error handling
 * 
 * @example
 * <TransactionErrorBoundary onRetryTransaction={handleRetry}>
 *   <TransactionComponent />
 * </TransactionErrorBoundary>
 */
class TransactionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): State {
    const errorType = TransactionErrorBoundary.categorizeError(error)
    
    return { 
      hasError: true, 
      error,
      errorType,
      retryCount: 0
    }
  }

  static categorizeError(error: Error): 'insufficient_funds' | 'network' | 'gas_limit' | 'user_rejected' | 'contract' | 'unknown' {
    const message = error.message.toLowerCase()
    
    if (message.includes('insufficient funds') || message.includes('balance too low')) {
      return 'insufficient_funds'
    }
    
    if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
      return 'network'
    }
    
    if (message.includes('gas') || message.includes('out of gas') || message.includes('gas limit')) {
      return 'gas_limit'
    }
    
    if (message.includes('user rejected') || message.includes('user denied') || message.includes('cancelled')) {
      return 'user_rejected'
    }
    
    if (message.includes('revert') || message.includes('execution reverted') || message.includes('panic')) {
      return 'contract'
    }
    
    return 'unknown'
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log transaction error
    if (process.env.NODE_ENV === 'development') {
      console.error('TransactionErrorBoundary caught a transaction error:', error, errorInfo)
    }

    // In production, send to error monitoring service
    // logTransactionErrorToService(error, errorInfo)
  }

  handleRetry = () => {
    const { retryCount } = this.state
    const maxRetries = 3

    if (retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        errorType: undefined,
        retryCount: prevState.retryCount + 1
      }))

      // Call custom retry handler if provided
      if (this.props.onRetryTransaction) {
        this.props.onRetryTransaction()
      }
    }
  }

  handleRefresh = () => {
    window.location.reload()
  }

  getErrorIcon = (errorType?: string) => {
    switch (errorType) {
      case 'insufficient_funds':
        return <Wallet className="w-6 h-6 text-red-600" />
      case 'network':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />
      case 'gas_limit':
        return <CreditCard className="w-6 h-6 text-yellow-600" />
      case 'user_rejected':
        return <AlertTriangle className="w-6 h-6 text-blue-600" />
      case 'contract':
        return <AlertTriangle className="w-6 h-6 text-purple-600" />
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-600" />
    }
  }

  getErrorTitle = (errorType?: string): string => {
    switch (errorType) {
      case 'insufficient_funds':
        return 'Insufficient Funds'
      case 'network':
        return 'Network Error'
      case 'gas_limit':
        return 'Gas Limit Error'
      case 'user_rejected':
        return 'Transaction Rejected'
      case 'contract':
        return 'Contract Error'
      default:
        return 'Transaction Failed'
    }
  }

  getErrorDescription = (errorType?: string): string => {
    switch (errorType) {
      case 'insufficient_funds':
        return 'You don\'t have enough funds to complete this transaction. Please add more funds to your wallet.'
      case 'network':
        return 'Network connection issue. Please check your internet connection and try again.'
      case 'gas_limit':
        return 'Gas limit too low or gas price too high. Please adjust gas settings and try again.'
      case 'user_rejected':
        return 'You rejected the transaction. Please try again if you want to proceed.'
      case 'contract':
        return 'Smart contract execution failed. Please check contract parameters and try again.'
      default:
        return 'The transaction failed. Please check the error details and try again.'
    }
  }

  getErrorColor = (errorType?: string): string => {
    switch (errorType) {
      case 'insufficient_funds':
        return 'text-red-600'
      case 'network':
        return 'text-orange-600'
      case 'gas_limit':
        return 'text-yellow-600'
      case 'user_rejected':
        return 'text-blue-600'
      case 'contract':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  getErrorBgColor = (errorType?: string): string => {
    switch (errorType) {
      case 'insufficient_funds':
        return 'bg-red-100 dark:bg-red-900/20'
      case 'network':
        return 'bg-orange-100 dark:bg-orange-900/20'
      case 'gas_limit':
        return 'bg-yellow-100 dark:bg-yellow-900/20'
      case 'user_rejected':
        return 'bg-blue-100 dark:bg-blue-900/20'
      case 'contract':
        return 'bg-purple-100 dark:bg-purple-900/20'
      default:
        return 'bg-gray-100 dark:bg-gray-900/20'
    }
  }

  canRetry = (errorType?: string): boolean => {
    // Some errors cannot be retried automatically
    return errorType !== 'insufficient_funds' && errorType !== 'user_rejected'
  }

  render() {
    const { hasError, error, errorType, retryCount } = this.state

    if (hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const maxRetries = 3
      const canRetry = this.canRetry(errorType) && retryCount < maxRetries
      const errorColor = this.getErrorColor(errorType)
      const errorBgColor = this.getErrorBgColor(errorType)
      const errorTitle = this.getErrorTitle(errorType)
      const errorDescription = this.getErrorDescription(errorType)

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className={`mx-auto w-12 h-12 ${errorBgColor} rounded-full flex items-center justify-center mb-4`}>
                {this.getErrorIcon(errorType)}
              </div>
              <CardTitle className={errorColor}>
                {errorTitle}
              </CardTitle>
              <CardDescription>
                {errorDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <h4 className="font-medium text-sm mb-2">Transaction Error Details:</h4>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {error.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Error Type: {errorType}
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
                {canRetry && (
                  <Button onClick={this.handleRetry} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {retryCount === 0 ? 'Retry Transaction' : `Retry (${retryCount + 1}/${maxRetries})`}
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

              {/* Specific Help Text */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  {errorType === 'insufficient_funds' && 'Please add more CELO or cUSD to your wallet.'}
                  {errorType === 'network' && 'Check your internet connection and try again.'}
                  {errorType === 'gas_limit' && 'Try increasing the gas limit or waiting for lower gas prices.'}
                  {errorType === 'user_rejected' && 'Please approve the transaction in your wallet.'}
                  {errorType === 'contract' && 'Check the contract parameters and try again.'}
                  {!errorType && 'Please check your wallet connection and try again.'}
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

export default TransactionErrorBoundary
