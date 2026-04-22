'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Separator component - Visual divider
 * Provides horizontal and vertical separators with variants
 * 
 * @param orientation - Separator orientation: 'horizontal' | 'vertical'
 * @param variant - Visual variant: 'default' | 'dashed' | 'dotted' | 'double'
 * @param thickness - Line thickness: 'thin' | 'medium' | 'thick'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Separator component
 * 
 * @example
 * <Separator orientation="horizontal" variant="dashed" thickness="medium" />
 * <Separator orientation="vertical" />
 */
interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'dashed' | 'dotted' | 'double'
  thickness?: 'thin' | 'medium' | 'thick'
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ 
    orientation = 'horizontal', 
    variant = 'default', 
    thickness = 'medium', 
    className, 
    ...props 
  }, ref) => {
    const orientationClasses = {
      horizontal: 'h-px w-full',
      vertical: 'w-px h-full'
    }

    const variantClasses = {
      default: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
      double: 'border-double'
    }

    const thicknessClasses = {
      thin: 'border-t',
      medium: 'border-t-2',
      thick: 'border-t-4'
    }

    const verticalThicknessClasses = {
      thin: 'border-l',
      medium: 'border-l-2',
      thick: 'border-l-4'
    }

    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={cn(
          // Base styles
          'shrink-0 bg-border',
          
          // Orientation styles
          orientationClasses[orientation],
          
          // Variant styles
          variantClasses[variant],
          
          // Thickness styles
          orientation === 'horizontal' 
            ? thicknessClasses[thickness]
            : verticalThicknessClasses[thickness],
          
          // Custom classes
          className
        )}
        {...props}
      />
    )
  }
)
Separator.displayName = "Separator"

/**
 * SeparatorWithText component - Separator with centered text
 * 
 * @param children - Text content
 * @param orientation - Separator orientation
 * @param variant - Visual variant
 * @param thickness - Line thickness
 * @param className - Additional CSS classes
 * @returns JSX.Element - Separator with text
 * 
 * @example
 * <SeparatorWithText orientation="horizontal">
 *   OR
 * </SeparatorWithText>
 */
interface SeparatorWithTextProps extends Omit<SeparatorProps, 'children'> {
  children: React.ReactNode
}

const SeparatorWithText: React.FC<SeparatorWithTextProps> = ({
  children,
  orientation = 'horizontal',
  variant = 'default',
  thickness = 'medium',
  className
}) => {
  const variantClasses = {
    default: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
    double: 'border-double'
  }

  const thicknessClasses = {
    thin: 'border-t',
    medium: 'border-t-2',
    thick: 'border-t-4'
  }

  if (orientation === 'vertical') {
    return (
      <div className={cn("flex items-center", className)}>
        <div
          className={cn(
            'flex-1 h-px bg-border',
            variantClasses[variant],
            thicknessClasses[thickness]
          )}
        />
        <div className="px-3 text-sm text-muted-foreground">
          {children}
        </div>
        <div
          className={cn(
            'flex-1 h-px bg-border',
            variantClasses[variant],
            thicknessClasses[thickness]
          )}
        />
      </div>
    )
  }

  return (
    <div className={cn("flex items-center", className)}>
      <div
        className={cn(
          'flex-1 h-px bg-border',
          variantClasses[variant],
          thicknessClasses[thickness]
        )}
      />
      <div className="px-3 text-sm text-muted-foreground">
        {children}
      </div>
      <div
        className={cn(
          'flex-1 h-px bg-border',
          variantClasses[variant],
          thicknessClasses[thickness]
        )}
      />
    </div>
  )
}

/**
 * SectionSeparator component - Section divider with spacing
 * 
 * @param children - Optional section title
 * @param orientation - Separator orientation
 * @param size - Section size: 'sm' | 'md' | 'lg'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Section separator
 * 
 * @example
 * <SectionSeparator size="md">
 *   <h3>Section Title</h3>
 * </SectionSeparator>
 */
interface SectionSeparatorProps {
  children?: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SectionSeparator: React.FC<SectionSeparatorProps> = ({
  children,
  orientation = 'horizontal',
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'my-4',
    md: 'my-6',
    lg: 'my-8'
  }

  const verticalSizeClasses = {
    sm: 'mx-4',
    md: 'mx-6',
    lg: 'mx-8'
  }

  return (
    <div className={cn(
      orientation === 'horizontal' ? sizeClasses[size] : verticalSizeClasses[size],
      className
    )}>
      {children ? (
        <SeparatorWithText orientation={orientation}>
          {children}
        </SeparatorWithText>
      ) : (
        <Separator orientation={orientation} />
      )}
    </div>
  )
}

/**
 * GroupSeparator component - Separator for grouping content
 * 
 * @param title - Group title
 * @param description - Optional description
 * @param orientation - Separator orientation
 * @param className - Additional CSS classes
 * @returns JSX.Element - Group separator
 * 
 * @example
 * <GroupSeparator 
 *   title="Account Settings" 
 *   description="Manage your account preferences"
 * />
 */
interface GroupSeparatorProps {
  title: string
  description?: string
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

const GroupSeparator: React.FC<GroupSeparatorProps> = ({
  title,
  description,
  orientation = 'horizontal',
  className
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <Separator orientation={orientation} />
    </div>
  )
}

/**
 * AnimatedSeparator component - Animated separator with gradient
 * 
 * @param orientation - Separator orientation
 * @param animated - Whether to animate
 * @param className - Additional CSS classes
 * @returns JSX.Element - Animated separator
 * 
 * @example
 * <AnimatedSeparator orientation="horizontal" animated={true} />
 */
interface AnimatedSeparatorProps extends Omit<SeparatorProps, 'variant' | 'thickness'> {
  animated?: boolean
}

const AnimatedSeparator: React.FC<AnimatedSeparatorProps> = ({
  orientation = 'horizontal',
  animated = false,
  className
}) => {
  const orientationClasses = {
    horizontal: 'h-px w-full',
    vertical: 'w-px h-full'
  }

  return (
    <div
      ref={React.createRef()}
      role="separator"
      aria-orientation={orientation}
      className={cn(
        // Base styles
        'shrink-0',
        
        // Orientation styles
        orientationClasses[orientation],
        
        // Animated gradient
        animated && 'bg-gradient-to-r from-transparent via-border to-transparent',
        animated && 'animate-pulse',
        
        // Default border
        !animated && 'bg-border',
        
        // Custom classes
        className
      )}
    />
  )
}

export { 
  Separator, 
  SeparatorWithText, 
  SectionSeparator, 
  GroupSeparator, 
  AnimatedSeparator 
}
