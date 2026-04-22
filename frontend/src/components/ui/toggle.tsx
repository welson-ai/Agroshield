'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Toggle component - Switch-style toggle input
 * Provides accessible toggle with smooth animations
 * 
 * @param checked - Whether the toggle is checked
 * @param onCheckedChange - Callback when toggle state changes
 * @param disabled - Whether the toggle is disabled
 * @param className - Additional CSS classes
 * @param id - Unique identifier for the toggle
 * @param label - Accessible label for the toggle
 * @param size - Toggle size: 'sm' | 'md' | 'lg'
 * @param variant - Toggle variant: 'default' | 'outline' | 'ghost'
 * @returns JSX.Element - Toggle component
 * 
 * @example
 * <Toggle
 *   checked={isEnabled}
 *   onCheckedChange={setIsEnabled}
 *   label="Enable notifications"
 *   size="md"
 * />
 */
interface ToggleProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ 
    checked = false, 
    onCheckedChange, 
    disabled = false, 
    className, 
    id,
    label,
    size = 'md',
    variant = 'default',
    ...props 
  }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked)
    const toggleId = id || `toggle-${React.useId()}`

    React.useEffect(() => {
      setIsChecked(checked)
    }, [checked])

    const handleToggle = () => {
      const newChecked = !isChecked
      setIsChecked(newChecked)
      onCheckedChange?.(newChecked)
    }

    const sizeClasses = {
      sm: 'h-5 w-9',
      md: 'h-6 w-11',
      lg: 'h-7 w-13'
    }

    const thumbSizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }

    const variantClasses = {
      default: 'bg-input',
      outline: 'border-2 border-border bg-background',
      ghost: 'bg-transparent border-2 border-transparent'
    }

    const checkedVariantClasses = {
      default: 'bg-primary',
      outline: 'border-primary bg-primary',
      ghost: 'bg-primary border-primary'
    }

    return (
      <div className="flex items-center space-x-2">
        <button
          type="button"
          role="switch"
          aria-checked={isChecked}
          aria-label={label}
          ref={ref}
          className={cn(
            // Base styles
            "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-transparent transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            
            // Size styles
            sizeClasses[size],
            
            // Variant styles
            variantClasses[variant],
            isChecked && checkedVariantClasses[variant],
            
            // Disabled styles
            disabled && "opacity-50 cursor-not-allowed",
            
            // Custom classes
            className
          )}
          onClick={disabled ? undefined : handleToggle}
          disabled={disabled}
          {...props}
        >
          <span
            data-state={isChecked ? "checked" : "unchecked"}
            className={cn(
              "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform",
              thumbSizeClasses[size],
              isChecked && "translate-x-" + (size === 'sm' ? '4' : size === 'md' ? '5' : '6')
            )}
          />
        </button>
        {label && (
          <label 
            htmlFor={toggleId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)
Toggle.displayName = "Toggle"

/**
 * ToggleGroup component - Group of related toggles
 * Provides radio-button behavior for toggle groups
 * 
 * @param children - Toggle components
 * @param value - Currently selected value
 * @param onValueChange - Callback when selection changes
 * @param className - Additional CSS classes
 * @param orientation - Group orientation: 'horizontal' | 'vertical'
 * @returns JSX.Element - Toggle group
 * 
 * @example
 * <ToggleGroup value={theme} onValueChange={setTheme}>
 *   <Toggle value="light" label="Light" />
 *   <Toggle value="dark" label="Dark" />
 *   <Toggle value="system" label="System" />
 * </ToggleGroup>
 */
interface ToggleGroupProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

const ToggleGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ children, value, onValueChange, className, orientation = 'horizontal' }, ref) => {
    const contextValue = React.useMemo(() => ({
      value,
      onValueChange
    }), [value, onValueChange])

    return (
      <ToggleGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            "inline-flex",
            orientation === 'vertical' ? "flex-col space-y-2" : "flex-row space-x-2",
            className
          )}
          role="radiogroup"
        >
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                key: index,
                groupValue: value,
                onGroupValueChange: onValueChange
              })
            }
            return child
          })}
        </div>
      </ToggleGroupContext.Provider>
    )
  }
)
ToggleGroup.displayName = "ToggleGroup"

/**
 * ToggleItem component - Individual toggle in a group
 * 
 * @param children - Toggle content
 * @param value - Unique value for this toggle
 * @param className - Additional CSS classes
 * @returns JSX.Element - Toggle item
 */
interface ToggleItemProps {
  children: React.ReactNode
  value: string
  className?: string
  groupValue?: string
  onGroupValueChange?: (value: string) => void
}

const ToggleItem = React.forwardRef<HTMLButtonElement, ToggleItemProps>(
  ({ children, value, className, groupValue, onGroupValueChange, ...props }, ref) => {
    const isChecked = groupValue === value
    const toggleId = `toggle-item-${value}`

    const handleToggle = () => {
      onGroupValueChange?.(value)
    }

    return (
      <div className="flex items-center space-x-2">
        <button
          type="button"
          role="radio"
          aria-checked={isChecked}
          ref={ref}
          className={cn(
            // Base styles
            "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "h-6 w-11 bg-input",
            
            // Checked styles
            isChecked && "bg-primary border-primary",
            
            // Custom classes
            className
          )}
          onClick={handleToggle}
          {...props}
        >
          <span
            data-state={isChecked ? "checked" : "unchecked"}
            className={cn(
              "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
              isChecked && "translate-x-5"
            )}
          />
        </button>
        <label 
          htmlFor={toggleId}
          className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {children}
        </label>
      </div>
    )
  }
)
ToggleItem.displayName = "ToggleItem"

export { Toggle, ToggleGroup, ToggleItem }
