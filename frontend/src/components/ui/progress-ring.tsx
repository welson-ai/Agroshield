'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * ProgressRing component - Circular progress indicator
 * Provides animated circular progress with customization
 * 
 * @param value - Progress value (0-100)
 * @param size - Ring size in pixels
 * @param strokeWidth - Stroke width
 * @param color - Progress color: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
 * @param trackColor - Track color
 * @param showValue - Whether to show percentage value
 * @param showLabel - Whether to show label text
 * @param label - Label text to display
 * @param animated - Whether to animate the progress
 * @param className - Additional CSS classes
 * @returns JSX.Element - Progress ring component
 * 
 * @example
 * <ProgressRing 
 *   value={75}
 *   size={120}
 *   strokeWidth={8}
 *   color="primary"
 *   showValue
 *   label="Upload Progress"
 * />
 */
interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  trackColor?: string
  showValue?: boolean
  showLabel?: boolean
  label?: string
  animated?: boolean
  className?: string
}

const ProgressRing = React.forwardRef<SVGSVGElement, ProgressRingProps>(
  ({ 
    value, 
    size = 120, 
    strokeWidth = 8, 
    color = 'primary', 
    trackColor = 'currentColor', 
    showValue = false, 
    showLabel = false, 
    label, 
    animated = true, 
    className, 
    ...props 
  }, ref) => {
    const [animatedValue, setAnimatedValue] = React.useState(0)
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (animatedValue / 100) * circumference

    // Animate value on mount and change
    React.useEffect(() => {
      if (!animated) {
        setAnimatedValue(value)
        return
      }

      const timer = setTimeout(() => {
        setAnimatedValue(value)
      }, 100)

      return () => clearTimeout(timer)
    }, [value, animated])

    const colorClasses = {
      primary: 'text-primary',
      secondary: 'text-secondary-foreground',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-destructive'
    }

    const strokeColor = colorClasses[color]

    return (
      <div className={cn("relative inline-flex items-center justify-center", className)}>
        <svg
          ref={ref}
          width={size}
          height={size}
          className="transform -rotate-90"
          {...props}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
            className="opacity-20"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(
              strokeColor,
              animated && "transition-all duration-500 ease-out"
            )}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <span className="text-2xl font-bold text-foreground">
              {Math.round(animatedValue)}%
            </span>
          )}
          {showLabel && label && (
            <span className="text-xs text-muted-foreground text-center mt-1">
              {label}
            </span>
          )}
        </div>
      </div>
    )
  }
)
ProgressRing.displayName = "ProgressRing"

/**
 * ProgressRingGroup component - Multiple progress rings
 * 
 * @param rings - Array of ring configurations
 * @param size - Ring size
 * @param strokeWidth - Stroke width
 * @param animated - Whether to animate
 * @param className - Additional CSS classes
 * @returns JSX.Element - Progress ring group
 * 
 * @example
 * <ProgressRingGroup 
 *   rings={[
 *     { value: 75, color: 'primary', label: 'Complete' },
 *     { value: 50, color: 'warning', label: 'In Progress' },
 *     { value: 25, color: 'error', label: 'Failed' }
 *   ]}
 *   size={80}
 * />
 */
export const ProgressRingGroup: React.FC<{
  rings: Array<{
    value: number
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
    label?: string
  }>
  size?: number
  strokeWidth?: number
  animated?: boolean
  className?: string
}> = ({
  rings,
  size = 80,
  strokeWidth = 6,
  animated = true,
  className
}) => {
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      {rings.map((ring, index) => (
        <div key={index} className="flex flex-col items-center space-y-2">
          <ProgressRing
            value={ring.value}
            size={size}
            strokeWidth={strokeWidth}
            color={ring.color}
            showValue
            animated={animated}
          />
          {ring.label && (
            <span className="text-xs text-muted-foreground text-center">
              {ring.label}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * ProgressRingStack component - Stacked progress rings
 * 
 * @param rings - Array of ring configurations (from outer to inner)
 * @param size - Overall size
 * @param strokeWidth - Stroke width
 * @param animated - Whether to animate
 * @param className - Additional CSS classes
 * @returns JSX.Element - Progress ring stack
 * 
 * @example
 * <ProgressRingStack 
 *   rings={[
 *     { value: 90, color: 'primary', size: 120 },
 *     { value: 75, color: 'secondary', size: 100 },
 *     { value: 60, color: 'success', size: 80 }
 *   ]}
 * />
 */
export const ProgressRingStack: React.FC<{
  rings: Array<{
    value: number
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
    size?: number
  }>
  size?: number
  strokeWidth?: number
  animated?: boolean
  className?: string
}> = ({
  rings,
  size = 120,
  strokeWidth = 8,
  animated = true,
  className
}) => {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {rings.map((ring, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            width: ring.size || size - (index * 20),
            height: ring.size || size - (index * 20)
          }}
        >
          <ProgressRing
            value={ring.value}
            size={ring.size || size - (index * 20)}
            strokeWidth={strokeWidth}
            color={ring.color}
            animated={animated}
          />
        </div>
      ))}
    </div>
  )
}

/**
 * ProgressRingCard component - Card with progress ring
 * 
 * @param value - Progress value
 * @param title - Card title
 * @param description - Card description
 * @param color - Progress color
 * @param size - Ring size
 * @param className - Additional CSS classes
 * @returns JSX.Element - Progress ring card
 * 
 * @example
 * <ProgressRingCard 
 *   value={85}
 *   title="Project Completion"
 *   description="85% of tasks completed"
 *   color="success"
 * />
 */
export const ProgressRingCard: React.FC<{
  value: number
  title: string
  description?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: number
  className?: string
}> = ({
  value,
  title,
  description,
  color = 'primary',
  size = 100,
  className
}) => {
  return (
    <div className={cn(
      "p-6 border rounded-lg bg-card text-card-foreground shadow-sm",
      className
    )}>
      <div className="flex items-center space-x-4">
        <ProgressRing
          value={value}
          size={size}
          color={color}
          showValue
        />
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * ProgressRingDashboard component - Dashboard with multiple progress rings
 * 
 * @param metrics - Array of metrics to display
 * @param columns - Number of columns in grid
 * @param size - Ring size
 * @param className - Additional CSS classes
 * @returns JSX.Element - Progress ring dashboard
 * 
 * @example
 * <ProgressRingDashboard 
 *   metrics={[
 *     { value: 85, title: 'Revenue', color: 'success' },
 *     { value: 72, title: 'Users', color: 'primary' },
 *     { value: 93, title: 'Performance', color: 'warning' },
 *     { value: 68, title: 'Satisfaction', color: 'secondary' }
 *   ]}
 *   columns={2}
 * />
 */
export const ProgressRingDashboard: React.FC<{
  metrics: Array<{
    value: number
    title: string
    description?: string
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  }>
  columns?: number
  size?: number
  className?: string
}> = ({
  metrics,
  columns = 2,
  size = 80,
  className
}) => {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 1 && "grid-cols-1",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-3",
      columns === 4 && "grid-cols-4",
      className
    )}>
      {metrics.map((metric, index) => (
        <ProgressRingCard
          key={index}
          value={metric.value}
          title={metric.title}
          description={metric.description}
          color={metric.color}
          size={size}
        />
      ))}
    </div>
  )
}

export { ProgressRing }
