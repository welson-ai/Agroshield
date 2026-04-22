import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Badge component - Small status indicators
 * Provides colored badges for status display
 * 
 * @param children - Badge content
 * @param variant - Badge variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
 * @param size - Badge size: 'sm' | 'md' | 'lg'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Badge component
 * 
 * @example
 * <Badge variant="success" size="md">Active</Badge>
 * <Badge variant="destructive">Error</Badge>
 * <Badge variant="outline">Pending</Badge>
 */
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

function Badge({ className, variant = 'default', size = 'md', ...props }: BadgeProps) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
    success: "bg-green-500 text-white hover:bg-green-600",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600",
    info: "bg-blue-500 text-white hover:bg-blue-600"
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base"
  }

  return (
    <div 
      className={cn(
        // Base styles
        "inline-flex items-center rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        
        // Variant styles
        variantClasses[variant],
        
        // Size styles
        sizeClasses[size],
        
        // Custom classes
        className
      )} 
      role="status"
      aria-label={props['aria-label']}
      aria-live="polite"
      {...props} 
    />
  )
}

export { Badge }
