'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Kbd component - Keyboard key indicator
 * Provides styled keyboard key display
 * 
 * @param children - Key content
 * @param size - Key size: 'sm' | 'md' | 'lg'
 * @param variant - Key variant: 'default' | 'outline' | 'solid'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Keyboard key component
 * 
 * @example
 * <Kbd size="md" variant="default">Ctrl</Kbd>
 * <Kbd size="md" variant="default">+</Kbd>
 * <Kbd size="md" variant="default">S</Kbd>
 */
interface KbdProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'solid'
  className?: string
}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ children, size = 'md', variant = 'default', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base'
    }

    const variantClasses = {
      default: 'bg-muted border border-border text-foreground shadow-sm',
      outline: 'bg-background border border-border text-foreground shadow-sm',
      solid: 'bg-foreground text-background shadow-md'
    }

    return (
      <kbd
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-mono font-medium',
          'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </kbd>
    )
  }
)
Kbd.displayName = "Kbd"

/**
 * KbdCombo component - Keyboard shortcut combination
 * 
 * @param keys - Array of keys to display
 * @param separator - Separator between keys
 * @param size - Key size: 'sm' | 'md' | 'lg'
 * @param variant - Key variant: 'default' | 'outline' | 'solid'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Keyboard combo
 * 
 * @example
 * <KbdCombo keys={['Ctrl', 'S']} />
 * <KbdCombo keys={['Cmd', 'Shift', 'Z']} separator="+" />
 */
export const KbdCombo: React.FC<{
  keys: string[]
  separator?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'solid'
  className?: string
}> = ({
  keys,
  separator = '+',
  size = 'md',
  variant = 'default',
  className
}) => {
  return (
    <div className={cn("inline-flex items-center space-x-1", className)}>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <Kbd size={size} variant={variant}>
            {key}
          </Kbd>
          {index < keys.length - 1 && (
            <span className="text-muted-foreground text-sm mx-1">
              {separator}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

/**
 * KbdList component - List of keyboard shortcuts
 * 
 * @param shortcuts - Array of shortcut objects
 * @param columns - Number of columns
 * @param size - Key size: 'sm' | 'md' | 'lg'
 * @param variant - Key variant: 'default' | 'outline' | 'solid'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Keyboard shortcuts list
 * 
 * @example
 * <KbdList 
 *   shortcuts={[
 *     { keys: ['Ctrl', 'S'], description: 'Save' },
 *     { keys: ['Ctrl', 'Z'], description: 'Undo' },
 *     { keys: ['Ctrl', 'Y'], description: 'Redo' }
 *   ]}
 *   columns={2}
 * />
 */
export const KbdList: React.FC<{
  shortcuts: Array<{
    keys: string[]
    description: string
  }>
  columns?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'solid'
  className?: string
}> = ({
  shortcuts,
  columns = 1,
  size = 'sm',
  variant = 'default',
  className
}) => {
  return (
    <div 
      className={cn(
        "grid gap-3",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-2",
        columns === 3 && "grid-cols-3",
        className
      )}
    >
      {shortcuts.map((shortcut, index) => (
        <div key={index} className="flex items-center justify-between space-x-4">
          <span className="text-sm text-foreground">
            {shortcut.description}
          </span>
          <KbdCombo keys={shortcut.keys} size={size} variant={variant} />
        </div>
      ))}
    </div>
  )
}

/**
 * KbdTable component - Table of keyboard shortcuts
 * 
 * @param shortcuts - Array of shortcut objects
 * @param size - Key size: 'sm' | 'md' | 'lg'
 * @param variant - Key variant: 'default' | 'outline' | 'solid'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Keyboard shortcuts table
 * 
 * @example
 * <KbdTable 
 *   shortcuts={[
 *     { action: 'Save', keys: ['Ctrl', 'S'] },
 *     { action: 'Copy', keys: ['Ctrl', 'C'] },
 *     { action: 'Paste', keys: ['Ctrl', 'V'] }
 *   ]}
 * />
 */
export const KbdTable: React.FC<{
  shortcuts: Array<{
    action: string
    keys: string[]
  }>
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'solid'
  className?: string
}> = ({
  shortcuts,
  size = 'sm',
  variant = 'default',
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <span className="text-sm font-medium text-foreground">
              {shortcut.action}
            </span>
            <KbdCombo keys={shortcut.keys} size={size} variant={variant} />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * KbdHint component - Keyboard shortcut hint
 * 
 * @param keys - Array of keys
 * @param description - Description text
 * @param position - Hint position: 'top' | 'bottom' | 'left' | 'right'
 * @param size - Key size: 'sm' | 'md' | 'lg'
 * @param variant - Key variant: 'default' | 'outline' | 'solid'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Keyboard hint
 * 
 * @example
 * <KbdHint 
 *   keys={['Ctrl', 'K']} 
 *   description="Search"
 *   position="bottom"
 * />
 */
export const KbdHint: React.FC<{
  keys: string[]
  description?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'solid'
  className?: string
}> = ({
  keys,
  description,
  position = 'bottom',
  size = 'sm',
  variant = 'default',
  className
}) => {
  const positionClasses = {
    top: 'flex-col-reverse',
    bottom: 'flex-col',
    left: 'flex-row-reverse',
    right: 'flex-row'
  }

  return (
    <div className={cn("flex items-center space-x-2", positionClasses[position], className)}>
      {description && (
        <span className="text-sm text-muted-foreground">
          {description}
        </span>
      )}
      <KbdCombo keys={keys} size={size} variant={variant} />
    </div>
  )
}

/**
 * KbdAction component - Action with keyboard shortcut
 * 
 * @param children - Action content
 * @param keys - Array of keys
 * @param onClick - Click handler
 * @param disabled - Whether disabled
 * @param size - Key size: 'sm' | 'md' | 'lg'
 * @param variant - Key variant: 'default' | 'outline' | 'solid'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Action with keyboard shortcut
 * 
 * @example
 * <KbdAction 
 *   keys={['Ctrl', 'S']} 
 *   onClick={handleSave}
 *   disabled={isSaving}
 * >
 *   Save
 * </KbdAction>
 */
export const KbdAction: React.FC<{
  children: React.ReactNode
  keys: string[]
  onClick?: () => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'solid'
  className?: string
}> = ({
  children,
  keys,
  onClick,
  disabled = false,
  size = 'sm',
  variant = 'default',
  className
}) => {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center space-x-2 px-3 py-2 text-sm rounded-md",
        "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <span>{children}</span>
      <KbdCombo keys={keys} size={size} variant={variant} />
    </button>
  )
}

export { Kbd }
