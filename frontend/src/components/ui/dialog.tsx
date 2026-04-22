'use client'

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Dialog component - Modal dialog with overlay
 * Provides accessible modal with focus management
 * 
 * @param open - Whether dialog is open
 * @param onOpenChange - Callback when dialog state changes
 * @param children - Dialog content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Dialog component
 * 
 * @example
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Dialog Title</DialogTitle>
 *     </DialogHeader>
 *     <DialogBody>Dialog content</DialogBody>
 *   </DialogContent>
 * </Dialog>
 */
interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {}
})

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ open = false, onOpenChange, children, className, ...props }, ref) => {
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

    return (
      <DialogContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
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
          
          {/* Dialog */}
          {children}
        </div>
      </DialogContext.Provider>
    )
  }
)
Dialog.displayName = "Dialog"

/**
 * DialogContent component - Dialog content container
 * 
 * @param children - Dialog content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Dialog content
 */
interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, className, ...props }, ref) => {
    const { open } = React.useContext(DialogContext)

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
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
          "sm:rounded-lg md:w-full",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DialogContent.displayName = "DialogContent"

/**
 * DialogHeader component - Dialog header section
 * 
 * @param children - Header content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Dialog header
 */
interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col space-y-1.5 text-center sm:text-left",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DialogHeader.displayName = "DialogHeader"

/**
 * DialogTitle component - Dialog title
 * 
 * @param children - Title text
 * @param className - Additional CSS classes
 * @returns JSX.Element - Dialog title
 */
interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn(
          "text-lg font-semibold leading-none tracking-tight",
          className
        )}
        {...props}
      >
        {children}
      </h2>
    )
  }
)
DialogTitle.displayName = "DialogTitle"

/**
 * DialogDescription component - Dialog description
 * 
 * @param children - Description text
 * @param className - Additional CSS classes
 * @returns JSX.Element - Dialog description
 */
interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
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
DialogDescription.displayName = "DialogDescription"

/**
 * DialogBody component - Dialog body content
 * 
 * @param children - Body content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Dialog body
 */
interface DialogBodyProps {
  children: React.ReactNode
  className?: string
}

const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("text-sm text-foreground", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DialogBody.displayName = "DialogBody"

/**
 * DialogFooter component - Dialog footer with actions
 * 
 * @param children - Footer content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Dialog footer
 */
interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
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
DialogFooter.displayName = "DialogFooter"

/**
 * DialogClose component - Close button for dialog
 * 
 * @param children - Button content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Dialog close button
 */
interface DialogCloseProps {
  children?: React.ReactNode
  className?: string
}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ children, className, ...props }, ref) => {
    const { onOpenChange } = React.useContext(DialogContext)

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
        aria-label="Close dialog"
        {...props}
      >
        {children || <X className="h-4 w-4" />}
      </button>
    )
  }
)
DialogClose.displayName = "DialogClose"

/**
 * DialogTrigger component - Button that opens the dialog
 * 
 * @param children - Trigger content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Dialog trigger
 */
interface DialogTriggerProps {
  children: React.ReactNode
  className?: string
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const { onOpenChange } = React.useContext(DialogContext)

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
DialogTrigger.displayName = "DialogTrigger"

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
  DialogTrigger
}
