'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Popover component - Floating content container
 * Provides accessible popover with positioning and focus management
 * 
 * @param children - Popover content
 * @param open - Whether popover is open
 * @param onOpenChange - Callback when open state changes
 * @param side - Popover side: 'top' | 'bottom' | 'left' | 'right'
 * @param align - Popover alignment: 'start' | 'center' | 'end'
 * @param offset - Distance from trigger
 * @param className - Additional CSS classes
 * @returns JSX.Element - Popover component
 * 
 * @example
 * <Popover open={isOpen} onOpenChange={setIsOpen} side="bottom" align="center">
 *   <PopoverTrigger>Open Popover</PopoverTrigger>
 *   <PopoverContent>Popover content</PopoverContent>
 * </Popover>
 */
interface PopoverProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  offset?: number
  className?: string
}

const PopoverContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
  contentRef: React.RefObject<HTMLDivElement>
}>({
  open: false,
  onOpenChange: () => {},
  triggerRef: React.createRef(),
  contentRef: React.createRef()
})

const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  ({ 
    children, 
    open = false, 
    onOpenChange, 
    side = 'bottom', 
    align = 'center', 
    offset = 8, 
    className, 
    ...props 
  }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(open)
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const contentRef = React.useRef<HTMLDivElement>(null)
    
    const isOpen = open !== undefined ? open : internalOpen

    const handleOpenChange = React.useCallback((newOpen: boolean) => {
      if (open === undefined) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }, [open, onOpenChange])

    const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          handleOpenChange(false)
          triggerRef.current?.focus()
          break
      }
    }, [isOpen, handleOpenChange])

    const handleClickOutside = React.useCallback((e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      ) {
        return
      }
      handleOpenChange(false)
    }, [handleOpenChange])

    React.useEffect(() => {
      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
          document.removeEventListener('keydown', handleKeyDown)
          document.removeEventListener('mousedown', handleClickOutside)
        }
      }
    }, [isOpen, handleKeyDown, handleClickOutside])

    const contextValue = React.useMemo(() => ({
      open: isOpen,
      onOpenChange: handleOpenChange,
      triggerRef,
      contentRef
    }), [isOpen, handleOpenChange])

    return (
      <PopoverContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("relative inline-block", className)}
          {...props}
        >
          {children}
        </div>
      </PopoverContext.Provider>
    )
  }
)
Popover.displayName = "Popover"

/**
 * PopoverTrigger component - Button that opens the popover
 * 
 * @param children - Trigger content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Popover trigger
 */
interface PopoverTriggerProps {
  children: React.ReactNode
  className?: string
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const { open, onOpenChange, triggerRef } = React.useContext(PopoverContext)

    const handleClick = () => {
      onOpenChange(!open)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    return (
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-haspopup="dialog"
        {...props}
      >
        {children}
      </button>
    )
  }
)
PopoverTrigger.displayName = "PopoverTrigger"

/**
 * PopoverContent component - Popover content container
 * 
 * @param children - Content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Popover content
 */
interface PopoverContentProps {
  children: React.ReactNode
  className?: string
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, className, ...props }, ref) => {
    const { open, side, align, offset, contentRef } = React.useContext(PopoverContext)

    React.useEffect(() => {
      if (open && contentRef.current) {
        // Focus first focusable element
        const focusableElement = contentRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElement) {
          (focusableElement as HTMLElement).focus()
        }
      }
    }, [open])

    if (!open) return null

    const sideClasses = {
      top: "bottom-full",
      bottom: "top-full",
      left: "right-full",
      right: "left-full"
    }

    const alignClasses = {
      start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
      center: side === 'top' || side === 'bottom' ? 'left-1/2 transform -translate-x-1/2' : 'top-1/2 transform -translate-y-1/2',
      end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0'
    }

    return (
      <div
        ref={contentRef}
        className={cn(
          "absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md",
          "animate-in fade-in-0 zoom-in-95",
          sideClasses[side],
          alignClasses[align],
          className
        )}
        style={{
          [side === 'top' ? 'marginBottom' : side === 'bottom' ? 'marginTop' : 
           side === 'left' ? 'marginRight' : 'marginLeft']: `${offset}px`
        }}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {children}
      </div>
    )
  }
)
PopoverContent.displayName = "PopoverContent"

/**
 * PopoverClose component - Close button for popover
 * 
 * @param children - Button content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Popover close button
 */
interface PopoverCloseProps {
  children?: React.ReactNode
  className?: string
}

const PopoverClose = React.forwardRef<HTMLButtonElement, PopoverCloseProps>(
  ({ children, className, ...props }, ref) => {
    const { onOpenChange } = React.useContext(PopoverContext)

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:pointer-events-none",
          className
        )}
        onClick={() => onOpenChange(false)}
        aria-label="Close popover"
        {...props}
      >
        {children}
      </button>
    )
  }
)
PopoverClose.displayName = "PopoverClose"

/**
 * PopoverArrow component - Visual arrow pointing to trigger
 * 
 * @param className - Additional CSS classes
 * @returns JSX.Element - Popover arrow
 */
interface PopoverArrowProps {
  className?: string
}

export const PopoverArrow: React.FC<PopoverArrowProps> = ({ className }) => {
  const { side } = React.useContext(PopoverContext)

  const arrowClasses = {
    top: "bottom-[-4px] left-1/2 transform -translate-x-1/2",
    bottom: "top-[-4px] left-1/2 transform -translate-x-1/2",
    left: "right-[-4px] top-1/2 transform -translate-y-1/2",
    right: "left-[-4px] top-1/2 transform -translate-y-1/2"
  }

  return (
    <div
      className={cn(
        "absolute w-2 h-2 bg-popover border border-border rotate-45",
        arrowClasses[side],
        className
      )}
    />
  )
}

/**
 * PopoverHeader component - Header section
 * 
 * @param children - Header content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Popover header
 */
export const PopoverHeader: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <div className={cn("border-b pb-3 mb-3", className)}>
      {children}
    </div>
  )
}

/**
 * PopoverFooter component - Footer section
 * 
 * @param children - Footer content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Popover footer
 */
export const PopoverFooter: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <div className={cn("border-t pt-3 mt-3", className)}>
      {children}
    </div>
  )
}

/**
 * PopoverTitle component - Title text
 * 
 * @param children - Title content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Popover title
 */
export const PopoverTitle: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <h3 className={cn("text-sm font-medium leading-none", className)}>
      {children}
    </h3>
  )
}

/**
 * PopoverDescription component - Description text
 * 
 * @param children - Description content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Popover description
 */
export const PopoverDescription: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  )
}

export { Popover, PopoverTrigger, PopoverContent, PopoverClose }
