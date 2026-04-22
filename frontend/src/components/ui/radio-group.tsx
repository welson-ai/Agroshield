'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * RadioGroup component - Group of radio buttons
 * Provides accessible radio button group with keyboard navigation
 * 
 * @param children - Radio button items
 * @param value - Currently selected value
 * @param onValueChange - Callback when selection changes
 * @param className - Additional CSS classes
 * @param orientation - Group orientation: 'horizontal' | 'vertical'
 * @returns JSX.Element - Radio group
 * 
 * @example
 * <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
 *   <RadioGroupItem value="option1" id="option1">Option 1</RadioGroupItem>
 *   <RadioGroupItem value="option2" id="option2">Option 2</RadioGroupItem>
 * </RadioGroup>
 */
interface RadioGroupProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
}>({
  value: undefined,
  onValueChange: undefined,
  orientation: 'horizontal'
})

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ children, value, onValueChange, className, orientation = 'horizontal', ...props }, ref) => {
    const contextValue = React.useMemo(() => ({
      value,
      onValueChange,
      orientation
    }), [value, onValueChange, orientation])

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          role="radiogroup"
          aria-orientation={orientation}
          className={cn(
            "grid gap-2",
            orientation === 'horizontal' ? "grid-flow-col auto-cols-max" : "grid-flow-row",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

/**
 * RadioGroupItem component - Individual radio button
 * 
 * @param value - Radio button value
 * @param id - Unique identifier
 * @param children - Radio button label
 * @param disabled - Whether radio button is disabled
 * @param className - Additional CSS classes
 * @returns JSX.Element - Radio group item
 * 
 * @example
 * <RadioGroupItem value="option1" id="option1" disabled={false}>
 *   Option 1
 * </RadioGroupItem>
 */
interface RadioGroupItemProps {
  value: string
  id: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

const RadioGroupItem = React.forwardRef<HTMLDivElement, RadioGroupItemProps>(
  ({ value, id, children, disabled = false, className, ...props }, ref) => {
    const { value: selectedValue, onValueChange, orientation } = React.useContext(RadioGroupContext)
    const isChecked = selectedValue === value
    const [focused, setFocused] = React.useState(false)

    const handleClick = () => {
      if (!disabled) {
        onValueChange?.(value)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault()
          onValueChange?.(value)
          break
        case 'ArrowRight':
        case 'ArrowDown':
          if (orientation === 'horizontal' || orientation === 'vertical') {
            e.preventDefault()
            // Navigate to next radio button
            const nextElement = (e.target as HTMLElement).nextElementSibling as HTMLElement
            if (nextElement && nextElement.role === 'radio') {
              nextElement.focus()
              nextElement.click()
            }
          }
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          if (orientation === 'horizontal' || orientation === 'vertical') {
            e.preventDefault()
            // Navigate to previous radio button
            const prevElement = (e.target as HTMLElement).previousElementSibling as HTMLElement
            if (prevElement && prevElement.role === 'radio') {
              prevElement.focus()
              prevElement.click()
            }
          }
          break
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center space-x-2 cursor-pointer",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        {...props}
      >
        <div
          role="radio"
          aria-checked={isChecked}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          className={cn(
            "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isChecked && "bg-primary",
            focused && "ring-2 ring-ring ring-offset-2"
          )}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {isChecked && (
            <div className="flex items-center justify-center h-full w-full">
              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
            </div>
          )}
        </div>
        
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {children}
        </label>
      </div>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

/**
 * RadioGroupLabel component - Label for radio group
 * 
 * @param children - Label text
 * @param className - Additional CSS classes
 * @returns JSX.Element - Radio group label
 * 
 * @example
 * <RadioGroupLabel>Select an option</RadioGroupLabel>
 */
interface RadioGroupLabelProps {
  children: React.ReactNode
  className?: string
}

export const RadioGroupLabel: React.FC<RadioGroupLabelProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn("text-sm font-medium mb-2", className)}>
      {children}
    </div>
  )
}

/**
 * RadioGroupDescription component - Description for radio group
 * 
 * @param children - Description text
 * @param className - Additional CSS classes
 * @returns JSX.Element - Radio group description
 * 
 * @example
 * <RadioGroupDescription>Choose one option from the list below</RadioGroupDescription>
 */
export const RadioGroupDescription: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({
  children,
  className
}) => {
  return (
    <div className={cn("text-sm text-muted-foreground mb-4", className)}>
      {children}
    </div>
  )
}

/**
 * RadioGroupError component - Error message for radio group
 * 
 * @param children - Error message
 * @param className - Additional CSS classes
 * @returns JSX.Element - Radio group error
 * 
 * @example
 * <RadioGroupError>Please select an option</RadioGroupError>
 */
export const RadioGroupError: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({
  children,
  className
}) => {
  return (
    <div className={cn("text-sm text-destructive mt-2", className)}>
      {children}
    </div>
  )
}

export { RadioGroup, RadioGroupItem }
