'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle,
  X
} from "lucide-react"

/**
 * Alert component - Accessible alert messages
 * Provides different alert variants with icons and dismissibility
 * 
 * @param children - Alert content
 * @param variant - Alert variant: 'default' | 'destructive' | 'warning' | 'success' | 'info'
 * @param className - Additional CSS classes
 * @param dismissible - Whether alert can be dismissed
 * @param onDismiss - Callback when alert is dismissed
 * @param title - Optional alert title
 * @returns JSX.Element - Alert component
 * 
 * @example
 * <Alert variant="success" dismissible onDismiss={handleDismiss}>
 *   Operation completed successfully!
 * </Alert>
 */
interface AlertProps {
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info'
  className?: string
  dismissible?: boolean
  onDismiss?: () => void
  title?: string
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    children, 
    variant = 'default', 
    className, 
    dismissible = false, 
    onDismiss,
    title,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    const handleDismiss = () => {
      setIsVisible(false)
      onDismiss?.()
    }

    if (!isVisible) return null

    const variantClasses = {
      default: {
        container: "bg-background text-foreground border-border",
        icon: "text-foreground"
      },
      destructive: {
        container: "bg-destructive/10 text-destructive border-destructive/20",
        icon: "text-destructive"
      },
      warning: {
        container: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800",
        icon: "text-yellow-600 dark:text-yellow-400"
      },
      success: {
        container: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800",
        icon: "text-green-600 dark:text-green-400"
      },
      info: {
        container: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400"
      }
    }

    const getIcon = () => {
      switch (variant) {
        case 'destructive':
          return <XCircle className="h-4 w-4" />
        case 'warning':
          return <AlertTriangle className="h-4 w-4" />
        case 'success':
          return <CheckCircle className="h-4 w-4" />
        case 'info':
          return <Info className="h-4 w-4" />
        default:
          return <Info className="h-4 w-4" />
      }
    }

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="polite"
        className={cn(
          "relative w-full rounded-lg border p-4",
          variantClasses[variant].container,
          className
        )}
        {...props}
      >
        {/* Icon */}
        <div className={cn("flex-shrink-0", variantClasses[variant].icon)}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="ml-3 w-0 flex-1">
          {title && (
            <h4 className="text-sm font-medium mb-1">{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              "ml-3 flex-shrink-0 rounded-lg p-1 transition-colors",
              "hover:bg-muted hover:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Alert.displayName = "Alert"

/**
 * AlertTitle component - Alert title
 * 
 * @param children - Title text
 * @param className - Additional CSS classes
 * @returns JSX.Element - Alert title
 */
interface AlertTitleProps {
  children: React.ReactNode
  className?: string
}

const AlertTitle = React.forwardRef<HTMLParagraphElement, AlertTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <h4
        ref={ref}
        className={cn("text-sm font-medium mb-1", className)}
        {...props}
      >
        {children}
      </h4>
    )
  }
)
AlertTitle.displayName = "AlertTitle"

/**
 * AlertDescription component - Alert description
 * 
 * @param children - Description text
 * @param className - Additional CSS classes
 * @returns JSX.Element - Alert description
 */
interface AlertDescriptionProps {
  children: React.ReactNode
  className?: string
}

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("text-sm", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AlertDescription.displayName = "AlertDescription"

/**
 * AlertProvider component - Context for managing multiple alerts
 * 
 * @param children - Provider children
 * @returns JSX.Element - Alert provider
 */
interface Alert {
  id: string
  variant: 'default' | 'destructive' | 'warning' | 'success' | 'info'
  title?: string
  message: string
  dismissible?: boolean
  timeout?: number
}

interface AlertContextValue {
  alerts: Alert[]
  addAlert: (alert: Omit<Alert, 'id'>) => void
  removeAlert: (id: string) => void
  clearAlerts: () => void
}

const AlertContext = React.createContext<AlertContextValue>({
  alerts: [],
  addAlert: () => {},
  removeAlert: () => {},
  clearAlerts: () => {}
})

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = React.useState<Alert[]>([])

  const addAlert = React.useCallback((alert: Omit<Alert, 'id'>) => {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      dismissible: alert.dismissible ?? true,
      timeout: alert.timeout ?? 5000
    }

    setAlerts(prev => [...prev, newAlert])

    // Auto-dismiss if timeout is set
    if (newAlert.timeout && newAlert.timeout > 0) {
      setTimeout(() => {
        removeAlert(newAlert.id)
      }, newAlert.timeout)
    }
  }, [])

  const removeAlert = React.useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }, [])

  const clearAlerts = React.useCallback(() => {
    setAlerts([])
  }, [])

  const contextValue = React.useMemo(() => ({
    alerts,
    addAlert,
    removeAlert,
    clearAlerts
  }), [alerts, addAlert, removeAlert, clearAlerts])

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <AlertContainer alerts={alerts} onRemove={removeAlert} />
    </AlertContext.Provider>
  )
}

/**
 * AlertContainer component - Renders multiple alerts
 * 
 * @param alerts - Array of alerts to render
 * @param onRemove - Callback to remove alert
 * @returns JSX.Element - Alert container
 */
interface AlertContainerProps {
  alerts: Alert[]
  onRemove: (id: string) => void
}

const AlertContainer: React.FC<AlertContainerProps> = ({ alerts, onRemove }) => {
  if (alerts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.variant}
          title={alert.title}
          dismissible={alert.dismissible}
          onDismiss={() => onRemove(alert.id)}
          className="shadow-lg"
        >
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

/**
 * useAlert hook - Access alert context
 * 
 * @returns Alert context value
 * 
 * @example
 * const { addAlert, removeAlert, clearAlerts } = useAlert()
 * 
 * const showError = (message: string) => {
 *   addAlert({ variant: 'destructive', message })
 * }
 */
export const useAlert = () => {
  const context = React.useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider')
  }
  return context
}

/**
 * AlertActions component - Action buttons for alerts
 * 
 * @param children - Action buttons
 * @param className - Additional CSS classes
 * @returns JSX.Element - Alert actions
 */
interface AlertActionsProps {
  children: React.ReactNode
  className?: string
}

const AlertActions = React.forwardRef<HTMLDivElement, AlertActionsProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mt-3 flex gap-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AlertActions.displayName = "AlertActions"

export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertActions,
  AlertProvider,
  AlertContainer,
  useAlert
}
