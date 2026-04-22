'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"

/**
 * Menubar component - Application menu bar
 * Provides accessible menu bar with keyboard navigation
 * 
 * @param children - Menu items
 * @param className - Additional CSS classes
 * @returns JSX.Element - Menubar component
 * 
 * @example
 * <Menubar>
 *   <Menu>
 *     <MenuTrigger>File</MenuTrigger>
 *     <MenuContent>
 *       <MenuItem>New</MenuItem>
 *       <MenuItem>Open</MenuItem>
 *       <MenuItem>Save</MenuItem>
 *     </MenuContent>
 *   </Menu>
 *   <Menu>
 *     <MenuTrigger>Edit</MenuTrigger>
 *     <MenuContent>
 *       <MenuItem>Cut</MenuItem>
 *       <MenuItem>Copy</MenuItem>
 *       <MenuItem>Paste</MenuItem>
 *     </MenuContent>
 *   </Menu>
 * </Menubar>
 */
interface MenubarProps {
  children: React.ReactNode
  className?: string
}

const MenubarContext = React.createContext<{
  openMenu: string | null
  setOpenMenu: (menu: string | null) => void
  activeIndex: number
  setActiveIndex: (index: number) => void
}>({
  openMenu: null,
  setOpenMenu: () => {},
  activeIndex: -1,
  setActiveIndex: () => {}
})

const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(
  ({ children, className, ...props }, ref) => {
    const [openMenu, setOpenMenu] = React.useState<string | null>(null)
    const [activeIndex, setActiveIndex] = React.useState(-1)

    const handleKeyDown = (e: KeyboardEvent) => {
      const menus = React.Children.toArray(children)
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          setActiveIndex(prev => Math.max(0, prev - 1))
          break
        case 'ArrowRight':
          e.preventDefault()
          setActiveIndex(prev => Math.min(menus.length - 1, prev + 1))
          break
        case 'ArrowDown':
          e.preventDefault()
          if (activeIndex >= 0) {
            const menu = menus[activeIndex]
            if (React.isValidElement(menu)) {
              setOpenMenu(menu.props.label || `menu-${activeIndex}`)
            }
          }
          break
        case 'Escape':
          e.preventDefault()
          setOpenMenu(null)
          break
      }
    }

    React.useEffect(() => {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [activeIndex, children])

    const contextValue = React.useMemo(() => ({
      openMenu,
      setOpenMenu,
      activeIndex,
      setActiveIndex
    }), [openMenu, activeIndex])

    return (
      <MenubarContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("flex items-center space-x-1 border-b bg-background p-1", className)}
          role="menubar"
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
      </MenubarContext.Provider>
    )
  }
)
Menubar.displayName = "Menubar"

/**
 * Menu component - Individual menu in menubar
 * 
 * @param label - Menu label
 * @param children - Menu content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Menu component
 */
interface MenuProps {
  label: string
  children: React.ReactNode
  className?: string
  index?: number
  isActive?: boolean
}

const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ label, children, className, index, isActive, ...props }, ref) => {
    const { openMenu, setOpenMenu, setActiveIndex } = React.useContext(MenubarContext)
    const isOpen = openMenu === label

    const handleClick = () => {
      if (isOpen) {
        setOpenMenu(null)
      } else {
        setOpenMenu(label)
        setActiveIndex(index || 0)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
          e.preventDefault()
          setOpenMenu(label)
          break
      }
    }

    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        {...props}
      >
        <button
          type="button"
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isActive && "bg-accent text-accent-foreground",
            !isActive && "hover:bg-accent hover:text-accent-foreground"
          )}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          {label}
          <ChevronDown className="ml-1 h-4 w-4" />
        </button>

        {isOpen && (
          <div
            className="absolute top-full left-0 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            role="menu"
          >
            {children}
          </div>
        )}
      </div>
    )
  }
)
Menu.displayName = "Menu"

/**
 * MenuTrigger component - Menu trigger button
 * 
 * @param children - Trigger content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Menu trigger
 */
interface MenuTriggerProps {
  children: React.ReactNode
  className?: string
}

const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "hover:bg-accent hover:text-accent-foreground",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
MenuTrigger.displayName = "MenuTrigger"

/**
 * MenuContent component - Menu content container
 * 
 * @param children - Menu items
 * @param className - Additional CSS classes
 * @returns JSX.Element - Menu content
 */
interface MenuContentProps {
  children: React.ReactNode
  className?: string
}

const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("py-1", className)}
        role="menu"
        {...props}
      >
        {children}
      </div>
    )
  }
)
MenuContent.displayName = "MenuContent"

/**
 * MenuItem component - Individual menu item
 * 
 * @param children - Item content
 * @param onSelect - Callback when item is selected
 * @param disabled - Whether item is disabled
 * @param shortcut - Keyboard shortcut
 * @param className - Additional CSS classes
 * @returns JSX.Element - Menu item
 */
interface MenuItemProps {
  children: React.ReactNode
  onSelect?: () => void
  disabled?: boolean
  shortcut?: string
  className?: string
}

const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({ 
    children, 
    onSelect, 
    disabled = false, 
    shortcut, 
    className, 
    ...props 
  }, ref) => {
    const { setOpenMenu } = React.useContext(MenubarContext)

    const handleClick = () => {
      if (disabled) return
      onSelect?.()
      setOpenMenu(null)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (!disabled) {
            onSelect?.()
            setOpenMenu(null)
          }
          break
      }
    }

    return (
      <div
        ref={ref}
        role="menuitem"
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "focus:bg-accent focus:text-accent-foreground",
          "hover:bg-accent hover:text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
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
MenuItem.displayName = "MenuItem"

/**
 * MenuSeparator component - Visual separator
 * 
 * @param className - Additional CSS classes
 * @returns JSX.Element - Menu separator
 */
interface MenuSeparatorProps {
  className?: string
}

const MenuSeparator = React.forwardRef<HTMLDivElement, MenuSeparatorProps>(
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
MenuSeparator.displayName = "MenuSeparator"

/**
 * MenuCheckboxItem component - Menu item with checkbox
 * 
 * @param children - Item content
 * @param checked - Whether checkbox is checked
 * @param onCheckedChange - Callback when checkbox state changes
 * @param disabled - Whether item is disabled
 * @param className - Additional CSS classes
 * @returns JSX.Element - Menu checkbox item
 */
interface MenuCheckboxItemProps {
  children: React.ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

const MenuCheckboxItem = React.forwardRef<HTMLDivElement, MenuCheckboxItemProps>(
  ({ 
    children, 
    checked = false, 
    onCheckedChange, 
    disabled = false, 
    className, 
    ...props 
  }, ref) => {
    const { setOpenMenu } = React.useContext(MenubarContext)

    const handleClick = () => {
      if (disabled) return
      onCheckedChange?.(!checked)
      setOpenMenu(null)
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
            <div className="h-2 w-2 bg-primary rounded-sm" />
          )}
        </span>
        {children}
      </div>
    )
  }
)
MenuCheckboxItem.displayName = "MenuCheckboxItem"

/**
 * MenuRadioGroup component - Radio button group
 * 
 * @param children - Radio items
 * @param value - Current selected value
 * @param onValueChange - Callback when selection changes
 * @param className - Additional CSS classes
 * @returns JSX.Element - Menu radio group
 */
interface MenuRadioGroupProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

const MenuRadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({
  value: undefined,
  onValueChange: undefined
})

const MenuRadioGroup: React.FC<MenuRadioGroupProps> = ({
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
    <MenuRadioGroupContext.Provider value={contextValue}>
      <div className={cn("py-1", className)}>
        {children}
      </div>
    </MenuRadioGroupContext.Provider>
  )
}

/**
 * MenuRadioItem component - Radio button item
 * 
 * @param children - Item content
 * @param value - Radio button value
 * @param disabled - Whether item is disabled
 * @param className - Additional CSS classes
 * @returns JSX.Element - Menu radio item
 */
interface MenuRadioItemProps {
  children: React.ReactNode
  value: string
  disabled?: boolean
  className?: string
}

const MenuRadioItem: React.FC<MenuRadioItemProps> = ({
  children,
  value,
  disabled = false,
  className
}) => {
  const { value: selectedValue, onValueChange } = React.useContext(MenuRadioGroupContext)
  const { setOpenMenu } = React.useContext(MenubarContext)

  const isChecked = selectedValue === value

  const handleClick = () => {
    if (disabled) return
    onValueChange?.(value)
    setOpenMenu(null)
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
        {isChecked && (
          <div className="h-2 w-2 bg-primary rounded-full" />
        )}
      </span>
      {children}
    </div>
  )
}

/**
 * MenuLabel component - Non-interactive label
 * 
 * @param children - Label content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Menu label
 */
interface MenuLabelProps {
  children: React.ReactNode
  className?: string
}

const MenuLabel: React.FC<MenuLabelProps> = ({ children, className }) => {
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
  Menubar,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuLabel
}
