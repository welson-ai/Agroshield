'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

/**
 * EmptyState component - Empty state display
 * Provides customizable empty state with actions
 * 
 * @param icon - Empty state icon
 * @param title - Empty state title
 * @param description - Empty state description
 * @param action - Primary action button
 * @param secondaryAction - Secondary action button
 * @param variant - Visual variant: 'default' | 'minimal' | 'illustrated'
 * @param size - Size variant: 'sm' | 'md' | 'lg'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Empty state component
 * 
 * @example
 * <EmptyState
 *   icon={<Inbox className="w-12 h-12" />}
 *   title="No items found"
 *   description="Get started by creating your first item."
 *   action={<Button onClick={handleCreate}>Create Item</Button>}
 * />
 */
interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
  secondaryAction?: React.ReactNode
  variant?: 'default' | 'minimal' | 'illustrated'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ 
    icon, 
    title = "No data", 
    description, 
    action, 
    secondaryAction, 
    variant = 'default', 
    size = 'md', 
    className, 
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: {
        icon: "w-8 h-8",
        title: "text-lg",
        description: "text-sm",
        spacing: "space-y-3"
      },
      md: {
        icon: "w-12 h-12",
        title: "text-xl",
        description: "text-base",
        spacing: "space-y-4"
      },
      lg: {
        icon: "w-16 h-16",
        title: "text-2xl",
        description: "text-lg",
        spacing: "space-y-6"
      }
    }

    const variantClasses = {
      default: "text-center py-12",
      minimal: "text-center py-8",
      illustrated: "text-center py-16"
    }

    const currentSize = sizeClasses[size]
    const currentVariant = variantClasses[variant]

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center w-full",
          currentVariant,
          currentSize.spacing,
          className
        )}
        {...props}
      >
        {icon && (
          <div className={cn(
            "text-muted-foreground/50 mb-4",
            currentSize.icon
          )}>
            {icon}
          </div>
        )}
        
        {title && (
          <h3 className={cn(
            "font-semibold text-foreground",
            currentSize.title
          )}>
            {title}
          </h3>
        )}
        
        {description && (
          <p className={cn(
            "text-muted-foreground max-w-md",
            currentSize.description
          )}>
            {description}
          </p>
        )}
        
        {(action || secondaryAction) && (
          <div className={cn(
            "flex flex-col sm:flex-row gap-3 mt-6",
            variant === 'minimal' && "mt-4"
          )}>
            {action}
            {secondaryAction}
          </div>
        )}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

/**
 * EmptyStateIllustrated component - Illustrated empty state
 * 
 * @param illustration - Custom illustration component
 * @param title - Empty state title
 * @param description - Empty state description
 * @param action - Primary action button
 * @param secondaryAction - Secondary action button
 * @param className - Additional CSS classes
 * @returns JSX.Element - Illustrated empty state
 * 
 * @example
 * <EmptyStateIllustrated
 *   illustration={<EmptyIllustration />}
 *   title="No projects yet"
 *   description="Create your first project to get started."
 *   action={<Button>Create Project</Button>}
 * />
 */
export const EmptyStateIllustrated: React.FC<{
  illustration?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
  secondaryAction?: React.ReactNode
  className?: string
}> = ({
  illustration,
  title,
  description,
  action,
  secondaryAction,
  className
}) => {
  return (
    <EmptyState
      icon={illustration}
      title={title}
      description={description}
      action={action}
      secondaryAction={secondaryAction}
      variant="illustrated"
      size="lg"
      className={className}
    />
  )
}

/**
 * EmptyStateMinimal component - Minimal empty state
 * 
 * @param title - Empty state title
 * @param description - Empty state description
 * @param action - Action button
 * @param className - Additional CSS classes
 * @returns JSX.Element - Minimal empty state
 * 
 * @example
 * <EmptyStateMinimal
 *   title="No results found"
 *   description="Try adjusting your search criteria."
 *   action={<Button variant="outline">Clear Filters</Button>}
 * />
 */
export const EmptyStateMinimal: React.FC<{
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}> = ({
  title,
  description,
  action,
  className
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      action={action}
      variant="minimal"
      size="sm"
      className={className}
    />
  )
}

/**
 * EmptyStateCard component - Empty state in card format
 * 
 * @param icon - Empty state icon
 * @param title - Empty state title
 * @param description - Empty state description
 * @param action - Action button
 * @param className - Additional CSS classes
 * @returns JSX.Element - Card empty state
 * 
 * @example
 * <EmptyStateCard
 *   icon={<FolderOpen className="w-8 h-8" />}
 *   title="No folders"
 *   description="This directory is empty."
 *   action={<Button size="sm">New Folder</Button>}
 * />
 */
export const EmptyStateCard: React.FC<{
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted-foreground/20 rounded-lg",
      className
    )}>
      {icon && (
        <div className="text-muted-foreground/50 mb-3">
          {icon}
        </div>
      )}
      
      {title && (
        <h4 className="font-medium text-foreground mb-2">
          {title}
        </h4>
      )}
      
      {description && (
        <p className="text-sm text-muted-foreground text-center mb-4">
          {description}
        </p>
      )}
      
      {action}
    </div>
  )
}

/**
 * EmptyStateList component - Empty state for lists
 * 
 * @param icon - Empty state icon
 * @param title - Empty state title
 * @param description - Empty state description
 * @param action - Action button
 * @param className - Additional CSS classes
 * @returns JSX.Element - List empty state
 * 
 * @example
 * <EmptyStateList
 *   icon={<FileText className="w-8 h-8" />}
 *   title="No documents"
 *   description="Upload your first document to get started."
 *   action={<Button size="sm">Upload Document</Button>}
 * />
 */
export const EmptyStateList: React.FC<{
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn("py-12", className)}>
      <div className="flex flex-col items-center justify-center space-y-4">
        {icon && (
          <div className="text-muted-foreground/50">
            {icon}
          </div>
        )}
        
        {title && (
          <h4 className="font-medium text-foreground">
            {title}
          </h4>
        )}
        
        {description && (
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            {description}
          </p>
        )}
        
        {action}
      </div>
    </div>
  )
}

/**
 * EmptyStateTable component - Empty state for tables
 * 
 * @param colSpan - Number of columns to span
 * @param icon - Empty state icon
 * @param title - Empty state title
 * @param description - Empty state description
 * @param action - Action button
 * @param className - Additional CSS classes
 * @returns JSX.Element - Table empty state
 * 
 * @example
 * <EmptyStateTable
 *   colSpan={5}
 *   icon={<Database className="w-8 h-8" />}
 *   title="No data available"
 *   description="There are no records to display."
 *   action={<Button size="sm">Add Record</Button>}
 * />
 */
export const EmptyStateTable: React.FC<{
  colSpan: number
  icon?: React.ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}> = ({
  colSpan,
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <tr className={className}>
      <td colSpan={colSpan} className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          {icon && (
            <div className="text-muted-foreground/50">
              {icon}
            </div>
          )}
          
          {title && (
            <h4 className="font-medium text-foreground">
              {title}
            </h4>
          )}
          
          {description && (
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              {description}
            </p>
          )}
          
          {action}
        </div>
      </td>
    </tr>
  )
}

export { EmptyState }
