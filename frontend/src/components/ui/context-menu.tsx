'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Square } from "lucide-react"

/**
 * ContextMenu component - Right-click context menu
 * Provides accessible context menu with keyboard navigation
 * 
 * @param children - Menu content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Context menu
 * 
 * @example
 * <ContextMenu>
 *   <ContextMenuTrigger>Right click me</ContextMenuTrigger>
 *   <ContextMenuContent>
 *     <ContextMenuItem>Cut</ContextMenuItem>
 *     <ContextMenuItem>Copy</ContextMenuItem>
 *     <ContextMenuItem>Paste</ContextMenuItem>
 *   </ContextMenuContent>
 * </ContextMenu>
 */
interface ContextMenuProps {
  children: React.ReactNode
  className?: string
}

const ContextMenuContext = React.createContext<{
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  position: { x: number; y: number }
  setPosition: (position: { x: number; y: number }) => void
  activeIndex: number
  setActiveIndex: (index: number) => void
}>({
  isOpen: false,
  setIsOpen: () => {},
  position: { x: 0, y: 0 },
  setPosition: () => {},
  activeIndex: -1,
  setActiveIndex: () => {}
})

const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ children, className, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [position, setPosition] = React.useState({ x: 0, y: 0 })
    const [activeIndex, setActiveIndex] = React.useState(-1)

    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault()
      setPosition({ x: e.clientX, y: e.clientY })
      setIsOpen(true)
      setActiveIndex(0)
    }

    const handleClick = () => {
      setIsOpen(false)
      setActiveIndex(-1)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          setActiveIndex(-1)
          break
        case 'ArrowDown':
          e.preventDefault()
          setActiveIndex(prev => prev + 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveIndex(prev => Math.max(0, prev - 1))
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          // Handled by ContextMenuItem
          break
      }
    }

    React.useEffect(() => {
      if (isOpen) {
        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('click', handleClick)
        return () => {
          document.removeEventListener('keydown', handleKeyDown)
          document.removeEventListener('click', handleClick)
        }
      }
    }, [isOpen])

    const contextValue = React.useMemo(() => ({
      isOpen,
      setIsOpen,
      position,
      setPosition,
      activeIndex,
      setActiveIndex
    }), [isOpen, position, activeIndex])

    return (
      <ContextMenuContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("relative inline-block", className)}
          onContextMenu={handleContextMenu}
          {...props}
        >
          {children}
        </div>
      </ContextMenuContext.Provider>
    )
  }
)
ContextMenu.displayName = "ContextMenu"

/**
 * ContextMenuTrigger component - Area that triggers context menu
 * 
 * @param children - Trigger content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Context menu trigger
 */
interface ContextMenuTriggerProps {
  children: React.ReactNode
  className?: string
}

const ContextMenuTrigger = React.forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("cursor-context", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ContextMenuTrigger.displayName = "ContextMenuTrigger"

/**
 * ContextMenuContent component - Menu content container
 * 
 * @param children - Menu items
 * @param className - Additional CSS classes
 * @returns JSX.Element - Context menu content
 */
interface ContextMenuContentProps {
  children: React.ReactNode
  className?: string
}

const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ children, className, ...props }, ref) => {
    const { isOpen, position, activeIndex } = React.useContext(ContextMenuContext)

    if (!isOpen) return null

    return (
      <div
        ref={ref}
        className={cn(
          "fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
        style={{
          left: position.x,
          top: position.y
        }}
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
ContextMenuContent.displayName = "ContextMenuContent"

/**
 * ContextMenuItem component - Individual menu item
 * 
 * @param children - Item content
 * @param onSelect - Callback when item is selected
 * @param disabled - Whether item is disabled
 * @param shortcut - Keyboard shortcut
 * @param className - Additional CSS classes
 * @returns JSX.Element - Context menu item
 */
interface ContextMenuItemProps {
  children: React.ReactNode
  onSelect?: () => void
  disabled?: boolean
  shortcut?: string
  className?: string
  index?: number
  isActive?: boolean
}

const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(
  ({ 
    children, 
    onSelect, 
    disabled = false, 
    shortcut, 
    className, 
    index, 
    isActive, 
    ...props 
  }, ref) => {
    const { setIsOpen, setActiveIndex } = React.useContext(ContextMenuContext)

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
        {shortcut && (
          <span className="ml-auto text-xs tracking-widest text-muted-foreground">
            {shortcut}
          </span>
        )}
      </div>
    )
  }
)
ContextMenuMenuItem.displayName = "ContextMenuItem"

/**
 * ContextMenuSeparator component - Visual separator
 * 
 * @param className - Additional CSS classes
 * @returns JSX.Element - Context menu separator
 */
interface ContextMenuSeparatorProps {
  className?: string
}

const ContextMenuSeparator = React.forwardRef<HTMLDivElement, ContextMenuSeparatorProps>(
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
ContextMenuSeparator.displayName = "ContextMenuSeparator"

/**
 * ContextMenuCheckboxItem component - Menu item with checkbox
 * 
 * @param children - Item content
 * @param checked - Whether checkbox is checked
 * @param onCheckedChange - Callback when checkbox state changes
 * @param disabled - Whether item is disabled
 * @param className - Additional CSS classes
 * @returns JSX.Element - Context menu checkbox item
 */
interface ContextMenuCheckboxItemProps {
  children: React.ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

const ContextMenuCheckboxItem = React.forwardRef<HTMLDivElement, ContextMenuCheckboxItemProps>(
  ({ 
    children, 
    checked = false, 
    onCheckedChange, 
    disabled = false, 
    className, 
    ...props 
  }, ref) => {
    const { setIsOpen } = React.useContext(ContextMenuContext)

    const handleClick = () => {
      if (disabled) return
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
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={handleClick}
        disabled={disabled}
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
ContextMenuCheckboxItem.displayName = "ContextMenuCheckboxItem"

/**
 * ContextMenuRadioGroup component - Radio button group
 * 
 * @param children - Radio items
 * @param value - Current selected value
 * @param onValueChange - Callback when selection changes
 * @param className - Additional CSS classes
 * @returns JSX.Element - Context menu radio group
 */
interface ContextMenuRadioGroupProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

const ContextMenuRadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({
  value: undefined,
  onValueChange: undefined
})

const ContextMenuRadioGroup: React.FC<ContextMenuRadioGroupProps> = ({
  children,
  value,
  onValueChange,
  className
}) => {
  const contextValue = React.useMemo(() => ({
    value,
    onValueChange
  }), [value, onValueChange])

  return (
    <ContextMenuRadioGroupContext.Provider value={contextValue}>
      <div className={cn("py-1", className)}>
        {children}
      </div>
    </ContextMenuRadioGroupContext.Provider>
  )
}

/**
 * ContextMenuRadioItem component - Radio button item
 * 
 * @param children - Item content
 * @param value - Radio button value
 * @param disabled - Whether item is disabled
 * @param className - Additional CSS classes
 * @returns JSX.Element - Context menu radio item
 */
interface ContextMenuRadioItemProps {
  children: React.ReactNode
  value: string
  disabled?: boolean
  className?: string
}

const ContextMenuRadioItem: React.FC<ContextMenuRadioItemProps> = ({
  children,
  value,
  disabled = false,
  className
}) => {
  const { value: selectedValue, onValueChange } = React.useContext(ContextMenuRadioGroupContext)
  const { setIsOpen } = React.useContext(ContextMenuContext)

  const isChecked = selectedValue === value

  const handleClick = () => {
    if (disabled) return
    onValueChange?.(value)
    setIsOpen(false)
  }

  return (
    <div
      role="menuitemradio"
      aria-checked={isChecked}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground",
        "hover:bg-accent hover:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleClick}
      disabled={disabled}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isChecked && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
}

/**
 * ContextMenuLabel component - Non-interactive label
 * 
 * @param children - Label content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Context menu label
 */
interface ContextMenuLabelProps {
  children: React.ReactNode
  className?: string
}

const ContextMenuLabel: React.FC<ContextMenuLabelProps> = ({
  children,
  className
}) => {
  return (
    <div
      role="menuitem"
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        className
      )}
    >
      {children}
    </div>
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel
}
