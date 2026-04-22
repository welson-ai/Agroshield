'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Tooltip component - Hover tooltips with positioning
 * Provides accessible tooltips with keyboard support
 * 
 * @param children - Tooltip trigger element
 * @param content - Tooltip content
 * @param position - Tooltip position: 'top' | 'bottom' | 'left' | 'right'
 * @param delay - Show/hide delay in milliseconds
 * @param className - Additional CSS classes
 * @returns JSX.Element - Tooltip component
 * 
 * @example
 * <Tooltip content="This is a tooltip" position="top">
 *   <Button>Hover me</Button>
 * </Tooltip>
 */
interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ children, content, position = 'top', delay = 200, className, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null)
    const triggerRef = React.useRef<HTMLDivElement>(null)

    const showTooltip = React.useCallback(() => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      const id = setTimeout(() => setIsVisible(true), delay)
      setTimeoutId(id)
    }, [delay])

    const hideTooltip = React.useCallback(() => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      const id = setTimeout(() => setIsVisible(false), 50)
      setTimeoutId(id)
    }, [])

    const handleMouseEnter = () => {
      showTooltip()
    }

    const handleMouseLeave = () => {
      hideTooltip()
    }

    const handleFocus = () => {
      showTooltip()
    }

    const handleBlur = () => {
      hideTooltip()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideTooltip()
      }
    }

    React.useEffect(() => {
      const element = triggerRef.current
      if (!element) return

      element.addEventListener('mouseenter', handleMouseEnter)
      element.addEventListener('mouseleave', handleMouseLeave)
      element.addEventListener('focus', handleFocus)
      element.addEventListener('blur', handleBlur)
      element.addEventListener('keydown', handleKeyDown)

      return () => {
        element.removeEventListener('mouseenter', handleMouseEnter)
        element.removeEventListener('mouseleave', handleMouseLeave)
        element.removeEventListener('focus', handleFocus)
        element.removeEventListener('blur', handleBlur)
        element.removeEventListener('keydown', handleKeyDown)
      }
    }, [])

    React.useEffect(() => {
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }, [timeoutId])

    const positionClasses = {
      top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
      bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
      left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
      right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
    }

    const arrowClasses = {
      top: "top-full left-1/2 transform -translate-x-1/2 -translate-y-1",
      bottom: "bottom-full left-1/2 transform -translate-x-1/2 translate-y-1",
      left: "right-full top-1/2 transform -translate-y-1/2 translate-x-1",
      right: "left-full top-1/2 transform -translate-y-1/2 -translate-x-1"
    }

    return (
      <div
        ref={ref}
        className={cn("relative inline-block", className)}
        {...props}
      >
        {/* Trigger */}
        <div
          ref={triggerRef}
          className="inline-block"
          aria-describedby={isVisible ? 'tooltip-content' : undefined}
        >
          {children}
        </div>

        {/* Tooltip */}
        {isVisible && (
          <div
            id="tooltip-content"
            role="tooltip"
            className={cn(
              // Base styles
              "absolute z-50 px-2 py-1 text-xs text-popover-foreground bg-popover border rounded-md shadow-md",
              
              // Position styles
              positionClasses[position],
              
              // Animation
              "animate-in fade-in-0 zoom-in-95"
            )}
          >
            {/* Arrow */}
            <div
              className={cn(
                "absolute w-2 h-2 bg-popover",
                arrowClasses[position]
              )}
              style={{
                [position === 'top' ? 'bottom' : 'top']: '-4px',
                [position === 'bottom' ? 'top' : 'bottom']: '-4px',
                [position === 'left' ? 'right' : 'left']: '-4px',
                [position === 'right' ? 'left' : 'right']: '-4px'
              }}
            />
            
            {/* Content */}
            <div className="max-w-xs break-words">
              {content}
            </div>
          </div>
        )}
      </div>
    )
  }
)
Tooltip.displayName = "Tooltip"

/**
 * TooltipProvider component - Context for global tooltip settings
 * 
 * @param children - Provider children
 * @param defaultDelay - Default delay for all tooltips
 * @param defaultPosition - Default position for all tooltips
 * @returns JSX.Element - Tooltip provider
 * 
 * @example
 * <TooltipProvider defaultDelay={300} defaultPosition="bottom">
 *   <App />
 * </TooltipProvider>
 */
interface TooltipProviderProps {
  children: React.ReactNode
  defaultDelay?: number
  defaultPosition?: 'top' | 'bottom' | 'left' | 'right'
}

const TooltipContext = React.createContext<{
  defaultDelay: number
  defaultPosition: 'top' | 'bottom' | 'left' | 'right'
}>({
  defaultDelay: 200,
  defaultPosition: 'top'
})

export const TooltipProvider: React.FC<TooltipProviderProps> = ({
  children,
  defaultDelay = 200,
  defaultPosition = 'top'
}) => {
  const contextValue = React.useMemo(() => ({
    defaultDelay,
    defaultPosition
  }), [defaultDelay, defaultPosition])

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
    </TooltipContext.Provider>
  )
}

/**
 * useTooltip hook - Access tooltip context
 * 
 * @returns Tooltip context value
 * 
 * @example
 * const { defaultDelay, defaultPosition } = useTooltip()
 */
export const useTooltip = () => {
  const context = React.useContext(TooltipContext)
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider')
  }
  return context
}

/**
 * TooltipContent component - Rich content tooltip
 * 
 * @param children - Tooltip content
 * @param title - Tooltip title
 * @param className - Additional CSS classes
 * @returns JSX.Element - Rich tooltip content
 * 
 * @example
 * <TooltipContent title="User Information">
 *   <div>
 *     <p><strong>Name:</strong> John Doe</p>
 *     <p><strong>Email:</strong> john@example.com</p>
 *   </div>
 * </TooltipContent>
 */
interface TooltipContentProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export const TooltipContent: React.FC<TooltipContentProps> = ({
  children,
  title,
  className
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      {title && (
        <h4 className="font-semibold text-sm">{title}</h4>
      )}
      <div className="text-xs">{children}</div>
    </div>
  )
}

/**
 * TooltipText component - Simple text tooltip
 * 
 * @param text - Tooltip text
 * @param maxLength - Maximum text length before truncating
 * @param className - Additional CSS classes
 * @returns JSX.Element - Text tooltip
 * 
 * @example
 * <TooltipText 
 *   text="This is a very long tooltip text that might need truncation"
 *   maxLength={50}
 * />
 */
interface TooltipTextProps {
  text: string
  maxLength?: number
  className?: string
}

export const TooltipText: React.FC<TooltipTextProps> = ({
  text,
  maxLength = 100,
  className
}) => {
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text

  return (
    <div className={cn("text-xs", className)}>
      {truncatedText}
    </div>
  )
}

export default Tooltip
