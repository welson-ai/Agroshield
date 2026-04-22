'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

/**
 * Sheet component - Slide-out panel from screen edge
 * Provides accessible sheet with focus management
 * 
 * @param open - Whether sheet is open
 * @param onOpenChange - Callback when sheet state changes
 * @param side - Sheet side: 'top' | 'bottom' | 'left' | 'right'
 * @param size - Sheet size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param children - Sheet content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Sheet component
 * 
 * @example
 * <Sheet open={isOpen} onOpenChange={setIsOpen} side="right" size="md">
 *   <SheetHeader>
 *     <SheetTitle>Sheet Title</SheetTitle>
 *   </SheetHeader>
 *   <SheetContent>Sheet content</SheetContent>
 * </Sheet>
 */
interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  className?: string
}

const SheetContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {}
})

const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ 
    open = false, 
    onOpenChange, 
    side = 'right', 
    size = 'md', 
    children, 
    className, 
    ...props 
  }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(open)
    const isOpen = open !== undefined ? open : internalOpen

    const handleOpenChange = React.useCallback((newOpen: boolean) => {
      if (open === undefined) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }, [open, onOpenChange])

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleOpenChange(false)
        }
      }

      if (isOpen) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    }, [isOpen, handleOpenChange])

    const contextValue = React.useMemo(() => ({
      open: isOpen,
      onOpenChange: handleOpenChange
    }), [isOpen, handleOpenChange])

    if (!isOpen) return null

    const sideClasses = {
      top: "inset-x-0 top-0 h-auto border-b",
      bottom: "inset-x-0 bottom-0 h-auto border-t",
      left: "inset-y-0 left-0 w-auto border-r",
      right: "inset-y-0 right-0 w-auto border-l"
    }

    const sizeClasses = {
      sm: {
        top: "max-h-[25vh]",
        bottom: "max-h-[25vh]",
        left: "max-w-[25vw]",
        right: "max-w-[25vw]"
      },
      md: {
        top: "max-h-[50vh]",
        bottom: "max-h-[50vh]",
        left: "max-w-[50vw]",
        right: "max-w-[50vw]"
      },
      lg: {
        top: "max-h-[75vh]",
        bottom: "max-h-[75vh]",
        left: "max-w-[75vw]",
        right: "max-w-[75vw]"
      },
      xl: {
        top: "max-h-[90vh]",
        bottom: "max-h-[90vh]",
        left: "max-w-[90vw]",
        right: "max-w-[90vw]"
      },
      full: {
        top: "h-screen",
        bottom: "h-screen",
        left: "w-screen",
        right: "w-screen"
      }
    }

    return (
      <SheetContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            "fixed inset-0 z-50 flex",
            side === 'top' && "items-start",
            side === 'bottom' && "items-end",
            side === 'left' && "justify-start",
            side === 'right' && "justify-end",
            className
          )}
          {...props}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => handleOpenChange(false)}
            aria-hidden="true"
          />
          
          {/* Sheet */}
          <div
            role="dialog"
            aria-modal="true"
            className={cn(
              "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
              sideClasses[side],
              sizeClasses[size][side],
              "animate-in slide-in-from-" + side + " duration-300",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:slide-out-to-" + side
            )}
          >
            {children}
          </div>
        </div>
      </SheetContext.Provider>
    )
  }
)
Sheet.displayName = "Sheet"

/**
 * SheetContent component - Sheet content container
 * 
 * @param children - Sheet content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Sheet content
 */
interface SheetContentProps {
  children: React.ReactNode
  className?: string
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ children, className, ...props }, ref) => {
    const { open } = React.useContext(SheetContext)

    React.useEffect(() => {
      if (open && ref && 'current' in ref) {
        const element = ref.current
        if (element) {
          // Focus first focusable element
          const focusableElement = element.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (focusableElement) {
            (focusableElement as HTMLElement).focus()
          }
        }
      }
    }, [open, ref])

    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-4", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SheetContent.displayName = "SheetContent"

/**
 * SheetHeader component - Sheet header section
 * 
 * @param children - Header content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Sheet header
 */
interface SheetHeaderProps {
  children: React.ReactNode
  className?: string
}

const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SheetHeader.displayName = "SheetHeader"

/**
 * SheetTitle component - Sheet title
 * 
 * @param children - Title text
 * @param className - Additional CSS classes
 * @returns JSX.Element - Sheet title
 */
interface SheetTitleProps {
  children: React.ReactNode
  className?: string
}

const SheetTitle = React.forwardRef<HTMLHeadingElement, SheetTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
      >
        {children}
      </h2>
    )
  }
)
SheetTitle.displayName = "SheetTitle"

/**
 * SheetDescription component - Sheet description
 * 
 * @param children - Description text
 * @param className - Additional CSS classes
 * @returns JSX.Element - Sheet description
 */
interface SheetDescriptionProps {
  children: React.ReactNode
  className?: string
}

const SheetDescription = React.forwardRef<HTMLParagraphElement, SheetDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      >
        {children}
      </p>
    )
  }
)
SheetDescription.displayName = "SheetDescription"

/**
 * SheetFooter component - Sheet footer with actions
 * 
 * @param children - Footer content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Sheet footer
 */
interface SheetFooterProps {
  children: React.ReactNode
  className?: string
}

const SheetFooter = React.forwardRef<HTMLDivElement, SheetFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SheetFooter.displayName = "SheetFooter"

/**
 * SheetClose component - Close button for sheet
 * 
 * @param children - Button content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Sheet close button
 */
interface SheetCloseProps {
  children?: React.ReactNode
  className?: string
}

const SheetClose = React.forwardRef<HTMLButtonElement, SheetCloseProps>(
  ({ children, className, ...props }, ref) => {
    const { onOpenChange } = React.useContext(SheetContext)

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
        aria-label="Close sheet"
        {...props}
      >
        {children || <X className="h-4 w-4" />}
      </button>
    )
  }
)
SheetClose.displayName = "SheetClose"

/**
 * SheetTrigger component - Button that opens the sheet
 * 
 * @param children - Trigger content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Sheet trigger
 */
interface SheetTriggerProps {
  children: React.ReactNode
  className?: string
}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const { onOpenChange } = React.useContext(SheetContext)

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          className
        )}
        onClick={() => onOpenChange(true)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SheetTrigger.displayName = "SheetTrigger"

export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  SheetTrigger
}
