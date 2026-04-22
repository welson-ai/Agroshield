'use client'

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * DropdownMenu component - Accessible dropdown menu
 * Provides keyboard navigation and screen reader support
 * 
 * @param children - Menu trigger and content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Dropdown menu
 * 
 * @example
 * <DropdownMenu>
 *   <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>Item 1</DropdownMenuItem>
 *     <DropdownMenuItem>Item 2</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 */
interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  activeIndex: number
  setActiveIndex: (index: number) => void
}>({
  isOpen: false,
  setIsOpen: () => {},
  activeIndex: -1,
  setActiveIndex: () => {}
})

const DropdownMenu: React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ children, className, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(-1)

    const contextValue = React.useMemo(() => ({
      isOpen,
      setIsOpen,
      activeIndex,
      setActiveIndex
    }), [isOpen, activeIndex])

    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false)
          setActiveIndex(-1)
        }
      }

      const handleClickOutside = (e: MouseEvent) => {
        if (ref && 'current' in ref && !ref.current?.contains(e.target as Node)) {
          setIsOpen(false)
          setActiveIndex(-1)
        }
      }

      if (isOpen) {
        document.addEventListener('keydown', handleEscape)
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen, ref])

    return (
      <DropdownMenuContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("relative inline-block text-left", className)}
          {...props}
        >
          {children}
        </div>
      </DropdownMenuContext.Provider>
    )
  }
)
DropdownMenu.displayName = "DropdownMenu"

/**
 * DropdownMenuTrigger component - Button that opens the menu
 * 
 * @param children - Trigger content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Dropdown trigger
 */
interface DropdownMenuTriggerProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext)

    const handleClick = () => {
      setIsOpen(!isOpen)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-between w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
    )
  }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

/**
 * DropdownMenuContent component - Menu content container
 * 
 * @param children - Menu items
 * @param className - Additional CSS classes
 * @param align - Menu alignment: 'start' | 'center' | 'end'
 * @returns JSX.Element - Dropdown content
 */
interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ children, className, align = 'start', ...props }, ref) => {
    const { isOpen, activeIndex } = React.useContext(DropdownMenuContext)

    const alignClasses = {
      start: 'left-0',
      center: 'left-1/2 transform -translate-x-1/2',
      end: 'right-0'
    }

    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "animate-in slide-in-from-top-1",
          alignClasses[align],
          className
        )}
        role="menu"
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              key: index,
              index,
              isActive: activeIndex === index
            })
          }
          return child
        })}
      </div>
    )
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

/**
 * DropdownMenuItem component - Individual menu item
 * 
 * @param children - Item content
 * @param className - Additional CSS classes
 * @param onSelect - Callback when item is selected
 * @param disabled - Whether item is disabled
 * @returns JSX.Element - Dropdown menu item
 */
interface DropdownMenuItemProps {
  children: React.ReactNode
  className?: string
  onSelect?: () => void
  disabled?: boolean
  index?: number
  isActive?: boolean
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ children, className, onSelect, disabled = false, index, isActive, ...props }, ref) => {
    const { setIsOpen, setActiveIndex } = React.useContext(DropdownMenuContext)

    const handleClick = () => {
      if (disabled) return
      onSelect?.()
      setIsOpen(false)
      setActiveIndex(-1)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (!disabled) {
            onSelect?.()
            setIsOpen(false)
            setActiveIndex(-1)
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          // Navigation handled by parent
          break
        case 'ArrowUp':
          e.preventDefault()
          // Navigation handled by parent
          break
      }
    }

    React.useEffect(() => {
      if (isActive) {
        ref?.current?.scrollIntoView({ block: 'nearest' })
      }
    }, [isActive, ref])

    return (
      <div
        ref={ref}
        role="menuitem"
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "focus:bg-accent focus:text-accent-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          isActive && "bg-accent text-accent-foreground",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

/**
 * DropdownMenuSeparator component - Visual separator between items
 * 
 * @param className - Additional CSS classes
 * @returns JSX.Element - Dropdown separator
 */
interface DropdownMenuSeparatorProps {
  className?: string
}

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        className={cn("my-1 h-px bg-muted", className)}
        {...props}
      />
    )
  }
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

/**
 * DropdownMenuCheckboxItem component - Menu item with checkbox
 * 
 * @param children - Item content
 * @param checked - Whether checkbox is checked
 * @param onCheckedChange - Callback when checkbox state changes
 * @param className - Additional CSS classes
 * @returns JSX.Element - Dropdown checkbox item
 */
interface DropdownMenuCheckboxItemProps {
  children: React.ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  ({ children, checked = false, onCheckedChange, className, ...props }, ref) => {
    const { setIsOpen } = React.useContext(DropdownMenuContext)

    const handleClick = () => {
      onCheckedChange?.(!checked)
      setIsOpen(false)
    }

    return (
      <div
        ref={ref}
        role="menuitemcheckbox"
        aria-checked={checked}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
          "focus:bg-accent focus:text-accent-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {checked && (
            <Check className="h-4 w-4" />
          )}
        </span>
        {children}
      </div>
    )
  }
)
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

/**
 * DropdownMenuLabel component - Non-interactive label
 * 
 * @param children - Label content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Dropdown label
 */
interface DropdownMenuLabelProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="menuitem"
        className={cn(
          "px-2 py-1.5 text-sm font-semibold",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel
}
