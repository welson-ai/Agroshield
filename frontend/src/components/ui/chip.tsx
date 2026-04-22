'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

/**
 * Chip component - Compact interactive element
 * Provides selectable, removable, and filter chips
 * 
 * @param children - Chip content
 * @param variant - Chip variant: 'default' | 'outlined' | 'filled'
 * @param size - Chip size: 'sm' | 'md' | 'lg'
 * @param color - Chip color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
 * @param selected - Whether chip is selected
 * @param onSelect - Callback when chip is selected/deselected
 * @param removable - Whether chip can be removed
 * @param onRemove - Callback when chip is removed
 * @param disabled - Whether chip is disabled
 * @param avatar - Avatar element to show
 * @param icon - Icon element to show
 * @param className - Additional CSS classes
 * @returns JSX.Element - Chip component
 * 
 * @example
 * <Chip 
 *   variant="default" 
 *   size="md" 
 *   color="primary"
 *   selected={isSelected}
 *   onSelect={handleSelect}
 *   removable
 *   onRemove={handleRemove}
 * >
 *   Chip Label
 * </Chip>
 */
interface ChipProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined' | 'filled'
  size?: 'sm' | 'md' | 'lg'
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  selected?: boolean
  onSelect?: (selected: boolean) => void
  removable?: boolean
  onRemove?: () => void
  disabled?: boolean
  avatar?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ 
    children, 
    variant = 'default', 
    size = 'md', 
    color = 'default', 
    selected = false, 
    onSelect, 
    removable = false, 
    onRemove, 
    disabled = false, 
    avatar, 
    icon, 
    className, 
    ...props 
  }, ref) => {
    const handleClick = () => {
      if (disabled) return
      onSelect?.(!selected)
    }

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (disabled) return
      onRemove?.()
    }

    const sizeClasses = {
      sm: {
        chip: 'h-6 px-2 text-xs',
        avatar: 'w-4 h-4',
        icon: 'w-3 h-3',
        remove: 'w-3 h-3'
      },
      md: {
        chip: 'h-8 px-3 text-sm',
        avatar: 'w-5 h-5',
        icon: 'w-4 h-4',
        remove: 'w-4 h-4'
      },
      lg: {
        chip: 'h-10 px-4 text-base',
        avatar: 'w-6 h-6',
        icon: 'w-5 h-5',
        remove: 'w-5 h-5'
      }
    }

    const variantClasses = {
      default: {
        base: 'border bg-background hover:bg-accent hover:text-accent-foreground',
        selected: 'bg-primary text-primary-foreground border-primary',
        disabled: 'opacity-50 cursor-not-allowed'
      },
      outlined: {
        base: 'border-2 border-current bg-transparent hover:bg-accent hover:text-accent-foreground',
        selected: 'border-primary bg-primary text-primary-foreground',
        disabled: 'opacity-50 cursor-not-allowed'
      },
      filled: {
        base: 'bg-muted text-muted-foreground hover:bg-muted/80',
        selected: 'bg-primary text-primary-foreground',
        disabled: 'opacity-50 cursor-not-allowed'
      }
    }

    const colorClasses = {
      default: '',
      primary: 'text-primary border-primary',
      secondary: 'text-secondary-foreground border-secondary-foreground',
      success: 'text-green-600 border-green-600',
      warning: 'text-yellow-600 border-yellow-600',
      error: 'text-destructive border-destructive'
    }

    const currentSize = sizeClasses[size]
    const currentVariant = variantClasses[variant]
    const currentColor = colorClasses[color]

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          currentSize.chip,
          selected ? currentVariant.selected : currentVariant.base,
          currentColor,
          disabled && currentVariant.disabled,
          onSelect && !disabled && "cursor-pointer",
          className
        )}
        onClick={handleClick}
        role="button"
        tabIndex={onSelect && !disabled ? 0 : -1}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onSelect && !disabled) {
            e.preventDefault()
            onSelect(!selected)
          }
        }}
        {...props}
      >
        {avatar && (
          <div className={cn("rounded-full overflow-hidden flex-shrink-0", currentSize.avatar)}>
            {avatar}
          </div>
        )}
        
        {icon && (
          <div className={cn("flex-shrink-0", currentSize.icon)}>
            {icon}
          </div>
        )}
        
        <span className="truncate">{children}</span>
        
        {removable && (
          <button
            type="button"
            className={cn(
              "rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "flex-shrink-0",
              currentSize.remove
            )}
            onClick={handleRemove}
            disabled={disabled}
            aria-label="Remove chip"
          >
            <X className="w-full h-full" />
          </button>
        )}
      </div>
    )
  }
)
Chip.displayName = "Chip"

/**
 * ChipGroup component - Group of related chips
 * 
 * @param children - Chip components
 * @param multiSelect - Whether multiple chips can be selected
 * @param onSelectionChange - Callback when selection changes
 * @param className - Additional CSS classes
 * @returns JSX.Element - Chip group
 * 
 * @example
 * <ChipGroup multiSelect onSelectionChange={setSelectedChips}>
 *   <Chip value="option1">Option 1</Chip>
 *   <Chip value="option2">Option 2</Chip>
 *   <Chip value="option3">Option 3</Chip>
 * </ChipGroup>
 */
export const ChipGroup: React.FC<{
  children: React.ReactNode
  multiSelect?: boolean
  onSelectionChange?: (selectedValues: string[]) => void
  className?: string
}> = ({
  children,
  multiSelect = false,
  onSelectionChange,
  className
}) => {
  const [selectedValues, setSelectedValues] = React.useState<string[]>([])

  const handleChipSelect = React.useCallback((value: string, selected: boolean) => {
    let newSelectedValues: string[]
    
    if (multiSelect) {
      newSelectedValues = selected 
        ? [...selectedValues, value]
        : selectedValues.filter(v => v !== value)
    } else {
      newSelectedValues = selected ? [value] : []
    }
    
    setSelectedValues(newSelectedValues)
    onSelectionChange?.(newSelectedValues)
  }, [multiSelect, selectedValues, onSelectionChange])

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child) || child.type !== Chip) return child
        
        return React.cloneElement(child, {
          selected: selectedValues.includes(child.props.value),
          onSelect: (selected: boolean) => handleChipSelect(child.props.value, selected)
        })
      })}
    </div>
  )
}

/**
 * ChipInput component - Input that creates chips
 * 
 * @param value - Input value
 * @param onChange - Callback when input changes
 * @param chips - Current chips
 * @param onChipAdd - Callback when chip is added
 * @param onChipRemove - Callback when chip is removed
 * @param placeholder - Input placeholder
 * @param className - Additional CSS classes
 * @returns JSX.Element - Chip input
 * 
 * @example
 * <ChipInput 
 *   value={inputValue}
 *   onChange={setInputValue}
 *   chips={chips}
 *   onChipAdd={addChip}
 *   onChipRemove={removeChip}
 *   placeholder="Add tags..."
 * />
 */
export const ChipInput: React.FC<{
  value: string
  onChange: (value: string) => void
  chips: string[]
  onChipAdd: (chip: string) => void
  onChipRemove: (chip: string) => void
  placeholder?: string
  className?: string
}> = ({
  value,
  onChange,
  chips,
  onChipAdd,
  onChipRemove,
  placeholder = "Add chip...",
  className
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault()
      onChipAdd(value.trim())
      onChange('')
    } else if (e.key === 'Backspace' && !value && chips.length > 0) {
      onChipRemove(chips[chips.length - 1])
    }
  }

  return (
    <div 
      className={cn(
        "flex flex-wrap items-center gap-2 p-2 border rounded-md",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {chips.map((chip, index) => (
        <Chip
          key={index}
          removable
          onRemove={() => onChipRemove(chip)}
          size="sm"
        >
          {chip}
        </Chip>
      ))}
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={chips.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[60px] px-1 py-0.5 text-sm bg-transparent outline-none"
      />
    </div>
  )
}

/**
 * ChipFilter component - Filter chips
 * 
 * @param filters - Filter options
 * @param activeFilters - Currently active filters
 * @param onFilterChange - Callback when filters change
 * @param className - Additional CSS classes
 * @returns JSX.Element - Chip filter
 * 
 * @example
 * <ChipFilter 
 *   filters={filterOptions}
 *   activeFilters={activeFilters}
 *   onFilterChange={setActiveFilters}
 * />
 */
export const ChipFilter: React.FC<{
  filters: Array<{
    value: string
    label: string
    count?: number
  }>
  activeFilters: string[]
  onFilterChange: (filters: string[]) => void
  className?: string
}> = ({
  filters,
  activeFilters,
  onFilterChange,
  className
}) => {
  const handleFilterToggle = (value: string) => {
    const newFilters = activeFilters.includes(value)
      ? activeFilters.filter(f => f !== value)
      : [...activeFilters, value]
    
    onFilterChange(newFilters)
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {filters.map((filter) => (
        <Chip
          key={filter.value}
          value={filter.value}
          selected={activeFilters.includes(filter.value)}
          onSelect={() => handleFilterToggle(filter.value)}
          variant="outlined"
          size="sm"
        >
          {filter.label}
          {filter.count !== undefined && (
            <span className="ml-1 text-xs opacity-70">
              ({filter.count})
            </span>
          )}
        </Chip>
      ))}
    </div>
  )
}

export { Chip }
