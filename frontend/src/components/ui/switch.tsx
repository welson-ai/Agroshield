'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Switch component - Toggle switch for binary options
 * Provides accessible switch with smooth animations
 * 
 * @param checked - Whether switch is checked
 * @param onCheckedChange - Callback when switch state changes
 * @param disabled - Whether switch is disabled
 * @param id - Unique identifier
 * @param label - Accessible label
 * @param size - Switch size: 'sm' | 'md' | 'lg'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Switch component
 * 
 * @example
 * <Switch
 *   checked={isEnabled}
 *   onCheckedChange={setIsEnabled}
 *   label="Enable notifications"
 *   size="md"
 * />
 */
interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  id?: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ 
    checked = false, 
    onCheckedChange, 
    disabled = false, 
    id, 
    label, 
    size = 'md', 
    className, 
    ...props 
  }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked)
    const switchId = id || `switch-${React.useId()}`

    React.useEffect(() => {
      setIsChecked(checked)
    }, [checked])

    const handleToggle = () => {
      const newChecked = !isChecked
      setIsChecked(newChecked)
      onCheckedChange?.(newChecked)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault()
          handleToggle()
          break
      }
    }

    const sizeClasses = {
      sm: {
        track: 'h-5 w-9',
        thumb: 'h-3 w-3',
        thumbTranslate: 'translate-x-4'
      },
      md: {
        track: 'h-6 w-11',
        thumb: 'h-4 w-4',
        thumbTranslate: 'translate-x-5'
      },
      lg: {
        track: 'h-7 w-13',
        thumb: 'h-5 w-5',
        thumbTranslate: 'translate-x-6'
      }
    }

    const currentSize = sizeClasses[size]

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
            "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
            
            // Size styles
            currentSize.track,
            
            // State styles
            isChecked 
              ? "bg-primary" 
              : "bg-input",
            
            // Focus styles
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            
            // Disabled styles
            disabled && "opacity-50 cursor-not-allowed",
            
            // Custom classes
            className
          )}
          onClick={disabled ? undefined : handleToggle}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          {...props}
        >
          <span
            data-state={isChecked ? "checked" : "unchecked"}
            className={cn(
              "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform",
              currentSize.thumb,
              isChecked && currentSize.thumbTranslate
            )}
          />
        </button>
        
        {label && (
          <label 
            htmlFor={switchId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)
Switch.displayName = "Switch"

/**
 * SwitchGroup component - Group of related switches
 * 
 * @param children - Switch components
 * @param className - Additional CSS classes
 * @returns JSX.Element - Switch group
 * 
 * @example
 * <SwitchGroup>
 *   <Switch checked={notifications} onCheckedChange={setNotifications} label="Notifications" />
 *   <Switch checked={darkMode} onCheckedChange={setDarkMode} label="Dark Mode" />
 * </SwitchGroup>
 */
interface SwitchGroupProps {
  children: React.ReactNode
  className?: string
}

export const SwitchGroup: React.FC<SwitchGroupProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  )
}

/**
 * SwitchWithDescription component - Switch with description text
 * 
 * @param checked - Whether switch is checked
 * @param onCheckedChange - Callback when switch state changes
 * @param label - Switch label
 * @param description - Switch description
 * @param disabled - Whether switch is disabled
 * @param className - Additional CSS classes
 * @returns JSX.Element - Switch with description
 * 
 * @example
 * <SwitchWithDescription
 *   checked={isEnabled}
 *   onCheckedChange={setIsEnabled}
 *   label="Email Notifications"
 *   description="Receive email updates about your account"
 * />
 */
interface SwitchWithDescriptionProps extends Omit<SwitchProps, 'label'> {
  label: string
  description?: string
}

export const SwitchWithDescription: React.FC<SwitchWithDescriptionProps> = ({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        label={label}
      />
    </div>
  )
}

/**
 * SwitchCard component - Switch inside a card layout
 * 
 * @param checked - Whether switch is checked
 * @param onCheckedChange - Callback when switch state changes
 * @param title - Card title
 * @param description - Card description
 * @param disabled - Whether switch is disabled
 * @param className - Additional CSS classes
 * @returns JSX.Element - Switch card
 * 
 * @example
 * <SwitchCard
 *   checked={isEnabled}
 *   onCheckedChange={setIsEnabled}
 *   title="Push Notifications"
 *   description="Receive push notifications on your device"
 * />
 */
export const SwitchCard: React.FC<SwitchWithDescriptionProps> = ({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 border rounded-lg",
      "hover:bg-accent/50 transition-colors",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}>
      <div className="space-y-1">
        <h4 className="text-sm font-medium">{label}</h4>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        label={label}
      />
    </div>
  )
}

export { Switch }
