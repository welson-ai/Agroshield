'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, Command as CommandIcon } from "lucide-react"

/**
 * Command component - Command palette/search interface
 * Provides accessible command palette with keyboard navigation
 * 
 * @param children - Command content
 * @param open - Whether command palette is open
 * @param onOpenChange - Callback when open state changes
 * @param placeholder - Search placeholder
 * @param className - Additional CSS classes
 * @returns JSX.Element - Command component
 * 
 * @example
 * <Command open={isOpen} onOpenChange={setIsOpen}>
 *   <CommandInput placeholder="Search commands..." />
 *   <CommandList>
 *     <CommandGroup heading="Actions">
 *       <CommandItem onSelect={handleAction}>New File</CommandItem>
 *     </CommandGroup>
 *   </CommandList>
 * </Command>
 */
interface CommandProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  className?: string
}

const CommandContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
  search: string
  setSearch: (search: string) => void
  selectedIndex: number
  setSelectedIndex: (index: number) => void
}>({
  open: false,
  onOpenChange: () => {},
  search: '',
  setSearch: () => {},
  selectedIndex: 0,
  setSelectedIndex: () => {}
})

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ children, open = false, onOpenChange, placeholder = "Type a command or search...", className, ...props }, ref) => {
    const [search, setSearch] = React.useState('')
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleOpenChange = React.useCallback((newOpen: boolean) => {
      onOpenChange?.(newOpen)
      if (newOpen) {
        setTimeout(() => inputRef.current?.focus(), 0)
      } else {
        setSearch('')
        setSelectedIndex(0)
      }
    }, [onOpenChange])

    const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          handleOpenChange(false)
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => prev + 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(0, prev - 1))
          break
        case 'Enter':
          e.preventDefault()
          // Handled by CommandItem
          break
      }
    }, [open, handleOpenChange])

    React.useEffect(() => {
      if (open) {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
      }
    }, [open, handleKeyDown])

    const contextValue = React.useMemo(() => ({
      open,
      onOpenChange: handleOpenChange,
      search,
      setSearch,
      selectedIndex,
      setSelectedIndex
    }), [open, handleOpenChange, search, selectedIndex])

    if (!open) return null

    return (
      <CommandContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
            "flex items-start justify-center pt-[20vh]",
            className
          )}
          onClick={() => handleOpenChange(false)}
        >
          <div
            className="w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-lg border bg-background shadow-lg">
              {children}
            </div>
          </div>
        </div>
      </CommandContext.Provider>
    )
  }
)
Command.displayName = "Command"

/**
 * CommandInput component - Search input for command palette
 * 
 * @param className - Additional CSS classes
 * @returns JSX.Element - Command input
 */
interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, ...props }, ref) => {
    const { search, setSearch } = React.useContext(CommandContext)

    return (
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          ref={ref}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          placeholder={props.placeholder}
          {...props}
        />
      </div>
    )
  }
)
CommandInput.displayName = "CommandInput"

/**
 * CommandList component - Container for command items
 * 
 * @param children - Command items
 * @param className - Additional CSS classes
 * @returns JSX.Element - Command list
 */
interface CommandListProps {
  children: React.ReactNode
  className?: string
}

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("max-h-[300px] overflow-y-auto p-1", className)}
        role="listbox"
        {...props}
      >
        {children}
      </div>
    )
  }
)
CommandList.displayName = "CommandList"

/**
 * CommandGroup component - Group of related commands
 * 
 * @param heading - Group heading
 * @param children - Command items
 * @param className - Additional CSS classes
 * @returns JSX.Element - Command group
 */
interface CommandGroupProps {
  heading?: string
  children: React.ReactNode
  className?: string
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ heading, children, className, ...props }, ref) => {
    const { search } = React.useContext(CommandContext)
    
    // Filter children based on search
    const filteredChildren = React.Children.toArray(children).filter(child => {
      if (!React.isValidElement(child)) return false
      
      const itemText = child.props.children?.toString().toLowerCase() || ''
      return itemText.includes(search.toLowerCase())
    })

    if (filteredChildren.length === 0) return null

    return (
      <div
        ref={ref}
        role="group"
        aria-label={heading}
        className={cn("overflow-hidden p-1 text-foreground", className)}
        {...props}
      >
        {heading && (
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {heading}
          </div>
        )}
        <div role="presentation">
          {filteredChildren}
        </div>
      </div>
    )
  }
)
CommandGroup.displayName = "CommandGroup"

/**
 * CommandItem component - Individual command item
 * 
 * @param children - Item content
 * @param onSelect - Callback when item is selected
 * @param shortcut - Keyboard shortcut
 * @param className - Additional CSS classes
 * @returns JSX.Element - Command item
 */
interface CommandItemProps {
  children: React.ReactNode
  onSelect?: () => void
  shortcut?: string
  className?: string
}

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ children, onSelect, shortcut, className, ...props }, ref) => {
    const { search, selectedIndex, setSelectedIndex, onOpenChange } = React.useContext(CommandContext)
    const itemIndex = React.useRef(0)
    const isActive = selectedIndex === itemIndex.current

    React.useEffect(() => {
      // Update item index based on position in DOM
      const items = Array.from(document.querySelectorAll('[data-command-item]'))
      itemIndex.current = items.indexOf(ref.current || document.body)
    }, [])

    const handleClick = () => {
      onSelect?.()
      onOpenChange(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    }

    // Highlight search match
    const highlightText = (text: string) => {
      if (!search) return text
      
      const parts = text.split(new RegExp(`(${search})`, 'gi'))
      return parts.map((part, index) => 
        part.toLowerCase() === search.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )
    }

    return (
      <div
        ref={ref}
        data-command-item
        role="option"
        aria-selected={isActive}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "hover:bg-accent hover:text-accent-foreground",
          isActive && "bg-accent text-accent-foreground",
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {typeof children === 'string' ? highlightText(children) : children}
        {shortcut && (
          <span className="ml-auto text-xs tracking-widest text-muted-foreground">
            {shortcut}
          </span>
        )}
      </div>
    )
  }
)
CommandItem.displayName = "CommandItem"

/**
 * CommandSeparator component - Visual separator
 * 
 * @param className - Additional CSS classes
 * @returns JSX.Element - Command separator
 */
interface CommandSeparatorProps {
  className?: string
}

const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        className={cn("-mx-1 my-1 h-px bg-border", className)}
        {...props}
      />
    )
  }
)
CommandSeparator.displayName = "CommandSeparator"

/**
 * CommandEmpty component - Empty state
 * 
 * @param children - Empty message
 * @param className - Additional CSS classes
 * @returns JSX.Element - Command empty state
 */
interface CommandEmptyProps {
  children: React.ReactNode
  className?: string
}

const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("py-6 text-center text-sm text-muted-foreground", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CommandEmpty.displayName = "CommandEmpty"

export {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandEmpty
}
