'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

/**
 * TooltipGroup component - Group of related tooltips
 * Provides coordinated tooltip management
 * 
 * @param children - Tooltip components
 * @param delay - Delay before showing tooltip
 * @param closeDelay - Delay before hiding tooltip
 * @param disableHoverableContent - Whether to disable hoverable content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Tooltip group
 * 
 * @example
 * <TooltipGroup delay={300} closeDelay={200}>
 *   <Tooltip content="First tooltip">
 *     <Button>Button 1</Button>
 *   </Tooltip>
 *   <Tooltip content="Second tooltip">
 *     <Button>Button 2</Button>
 *   </Tooltip>
 * </TooltipGroup>
 */
interface TooltipGroupProps {
  children: React.ReactNode
  delay?: number
  closeDelay?: number
  disableHoverableContent?: boolean
  className?: string
}

const TooltipGroup = React.forwardRef<HTMLDivElement, TooltipGroupProps>(
  ({ 
    children, 
    delay = 400, 
    closeDelay = 100, 
    disableHoverableContent = false, 
    className, 
    ...props 
  }, ref) => {
    return (
      <TooltipProvider delayDuration={delay} skipDelayDuration={closeDelay} disableHoverableContent={disableHoverableContent}>
        <div ref={ref} className={cn("inline-flex items-center space-x-2", className)} {...props}>
          {children}
        </div>
      </TooltipProvider>
    )
  }
)
TooltipGroup.displayName = "TooltipGroup"

/**
 * TooltipList component - List of tooltips with consistent styling
 * 
 * @param items - Array of tooltip items
 * @param orientation - List orientation: 'horizontal' | 'vertical'
 * @param delay - Delay before showing tooltip
 * @param className - Additional CSS classes
 * @returns JSX.Element - Tooltip list
 * 
 * @example
 * <TooltipList 
 *   items={[
 *     { content: "Save", trigger: <Button>Save</Button> },
 *     { content: "Cancel", trigger: <Button>Cancel</Button> },
 *     { content: "Delete", trigger: <Button>Delete</Button> }
 *   ]}
 *   orientation="horizontal"
 * />
 */
export const TooltipList: React.FC<{
  items: Array<{
    content: React.ReactNode
    trigger: React.ReactNode
    side?: 'top' | 'right' | 'bottom' | 'left'
    align?: 'start' | 'center' | 'end'
  }>
  orientation?: 'horizontal' | 'vertical'
  delay?: number
  className?: string
}> = ({
  items,
  orientation = 'horizontal',
  delay = 400,
  className
}) => {
  return (
    <TooltipGroup delay={delay} className={cn(
      orientation === 'horizontal' ? "flex-row" : "flex-col",
      className
    )}>
      {items.map((item, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            {item.trigger}
          </TooltipTrigger>
          <TooltipContent side={item.side} align={item.align}>
            {item.content}
          </TooltipContent>
        </Tooltip>
      ))}
    </TooltipGroup>
  )
}

/**
 * TooltipGrid component - Grid of tooltips
 * 
 * @param items - Array of tooltip items
 * @param columns - Number of grid columns
 * @param gap - Gap between grid items
 * @param delay - Delay before showing tooltip
 * @param className - Additional CSS classes
 * @returns JSX.Element - Tooltip grid
 * 
 * @example
 * <TooltipGrid 
 *   items={gridItems}
 *   columns={3}
 *   gap={4}
 * />
 */
export const TooltipGrid: React.FC<{
  items: Array<{
    content: React.ReactNode
    trigger: React.ReactNode
    side?: 'top' | 'right' | 'bottom' | 'left'
    align?: 'start' | 'center' | 'end'
  }>
  columns?: number
  gap?: number
  delay?: number
  className?: string
}> = ({
  items,
  columns = 3,
  gap = 4,
  delay = 400,
  className
}) => {
  return (
    <div 
      className={cn(
        "grid",
        className
      )}
      style={{ 
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap * 4}px`
      }}
    >
      <TooltipGroup delay={delay}>
        {items.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              {item.trigger}
            </TooltipTrigger>
            <TooltipContent side={item.side} align={item.align}>
              {item.content}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipGroup>
    </div>
  )
}

/**
 * TooltipMenu component - Menu with tooltips for each item
 * 
 * @param items - Array of menu items with tooltips
 * @param delay - Delay before showing tooltip
 * @param className - Additional CSS classes
 * @returns JSX.Element - Tooltip menu
 * 
 * @example
 * <TooltipMenu 
 *   items={[
 *     { label: "File", tooltip: "File operations", shortcut: "Ctrl+F" },
 *     { label: "Edit", tooltip: "Edit operations", shortcut: "Ctrl+E" },
 *     { label: "View", tooltip: "View options", shortcut: "Ctrl+V" }
 *   ]}
 * />
 */
export const TooltipMenu: React.FC<{
  items: Array<{
    label: string
    tooltip: string
    shortcut?: string
    onClick?: () => void
    disabled?: boolean
  }>
  delay?: number
  className?: string
}> = ({
  items,
  delay = 400,
  className
}) => {
  return (
    <div className={cn("space-y-1 p-1", className)}>
      <TooltipGroup delay={delay}>
        {items.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "w-full px-2 py-1.5 text-sm text-left rounded-md",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-between"
                )}
                onClick={item.onClick}
                disabled={item.disabled}
              >
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {item.shortcut}
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" align="start">
              <div className="space-y-1">
                <p>{item.tooltip}</p>
                {item.shortcut && (
                  <p className="text-xs text-muted-foreground">
                    Shortcut: {item.shortcut}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipGroup>
    </div>
  )
}

/**
 * TooltipToolbar component - Toolbar with tooltips
 * 
 * @param items - Array of toolbar items with tooltips
 * @param orientation - Toolbar orientation: 'horizontal' | 'vertical'
 * @param delay - Delay before showing tooltip
 * @param className - Additional CSS classes
 * @returns JSX.Element - Tooltip toolbar
 * 
 * @example
 * <TooltipToolbar 
 *   items={[
 *     { icon: <SaveIcon />, tooltip: "Save document", onClick: save },
 *     { icon: <CopyIcon />, tooltip: "Copy selection", onClick: copy },
 *     { icon: <PasteIcon />, tooltip: "Paste content", onClick: paste }
 *   ]}
 * />
 */
export const TooltipToolbar: React.FC<{
  items: Array<{
    icon: React.ReactNode
    tooltip: string
    onClick?: () => void
    disabled?: boolean
    active?: boolean
  }>
  orientation?: 'horizontal' | 'vertical'
  delay?: number
  className?: string
}> = ({
  items,
  orientation = 'horizontal',
  delay = 400,
  className
}) => {
  return (
    <div className={cn(
      "flex p-1 border rounded-md bg-background",
      orientation === 'horizontal' ? "flex-row" : "flex-col",
      className
    )}>
      <TooltipGroup delay={delay}>
        {items.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  "p-2 rounded-md text-sm font-medium",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  item.active && "bg-accent text-accent-foreground"
                )}
                onClick={item.onClick}
                disabled={item.disabled}
              >
                {item.icon}
              </button>
            </TooltipTrigger>
            <TooltipContent side={orientation === 'horizontal' ? 'bottom' : 'right'}>
              {item.tooltip}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipGroup>
    </div>
  )
}

/**
 * TooltipCard component - Card with tooltip overlay
 * 
 * @param children - Card content
 * @param tooltip - Tooltip content
 * @param side - Tooltip side: 'top' | 'right' | 'bottom' | 'left'
 * @param delay - Delay before showing tooltip
 * @param className - Additional CSS classes
 * @returns JSX.Element - Tooltip card
 * 
 * @example
 * <TooltipCard 
 *   tooltip="Click to view details"
 *   side="top"
 * >
 *   <Card>Card content</Card>
 * </TooltipCard>
 */
export const TooltipCard: React.FC<{
  children: React.ReactNode
  tooltip: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  delay?: number
  className?: string
}> = ({
  children,
  tooltip,
  side = 'top',
  delay = 400,
  className
}) => {
  return (
    <Tooltip delayDuration={delay}>
      <TooltipTrigger asChild>
        <div className={cn("cursor-pointer", className)}>
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * TooltipProgress component - Progress bar with tooltip
 * 
 * @param value - Progress value (0-100)
 * @param tooltip - Tooltip content
 * @param showValue - Whether to show value in tooltip
 * @param className - Additional CSS classes
 * @returns JSX.Element - Tooltip progress
 * 
 * @example
 * <TooltipProgress 
 *   value={75}
 *   tooltip="Upload progress"
 *   showValue
 * />
 */
export const TooltipProgress: React.FC<{
  value: number
  tooltip?: React.ReactNode
  showValue?: boolean
  className?: string
}> = ({
  value,
  tooltip = "Progress",
  showValue = false,
  className
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("w-full", className)}>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          <p>{tooltip}</p>
          {showValue && (
            <p className="text-sm text-muted-foreground">
              {Math.round(value)}%
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

export { TooltipGroup }
