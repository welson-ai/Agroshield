'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Star, Heart, ThumbsUp } from "lucide-react"

/**
 * Rating component - Interactive rating input
 * Provides accessible rating with keyboard navigation
 * 
 * @param value - Current rating value
 * @param onChange - Callback when rating changes
 * @param max - Maximum rating value
 * @param size - Rating size: 'sm' | 'md' | 'lg'
 * @param icon - Icon type: 'star' | 'heart' | 'thumbs-up'
 * @ readonly - Whether rating is read-only
 * @param showValue - Whether to show numeric value
 * @param allowHalf - Whether to allow half-star ratings
 * @param className - Additional CSS classes
 * @returns JSX.Element - Rating component
 * 
 * @example
 * <Rating value={3.5} onChange={setRating} max={5} allowHalf showValue />
 */
interface RatingProps {
  value?: number
  onChange?: (value: number) => void
  max?: number
  size?: 'sm' | 'md' | 'lg'
  icon?: 'star' | 'heart' | 'thumbs-up'
  readonly?: boolean
  showValue?: boolean
  allowHalf?: boolean
  className?: string
}

const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  ({ 
    value = 0, 
    onChange, 
    max = 5, 
    size = 'md', 
    icon = 'star', 
    readonly = false, 
    showValue = false, 
    allowHalf = false, 
    className, 
    ...props 
  }, ref) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null)
    const [focusedIndex, setFocusedIndex] = React.useState(-1)

    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }

    const iconComponents = {
      star: Star,
      heart: Heart,
      'thumbs-up': ThumbsUp
    }

    const IconComponent = iconComponents[icon]

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (readonly) return

      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const width = rect.width
      const percentage = x / width
      const newValue = percentage * max

      if (allowHalf) {
        setHoverValue(Math.round(newValue * 2) / 2)
      } else {
        setHoverValue(Math.ceil(newValue))
      }
    }

    const handleMouseLeave = () => {
      setHoverValue(null)
    }

    const handleClick = () => {
      if (readonly) return
      if (hoverValue !== null) {
        onChange?.(hoverValue)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (readonly) return

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          e.preventDefault()
          const newValue = Math.max(0, (value || 0) - (allowHalf ? 0.5 : 1))
          onChange?.(newValue)
          break
        case 'ArrowRight':
        case 'ArrowUp':
          e.preventDefault()
          const newValue2 = Math.min(max, (value || 0) + (allowHalf ? 0.5 : 1))
          onChange?.(newValue2)
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          // Toggle between current value and 0
          onChange?.((value || 0) > 0 ? 0 : 1)
          break
      }
    }

    const renderIcon = (index: number, isHalf: boolean = false) => {
      const ratingValue = isHalf ? index + 0.5 : index + 1
      const displayValue = hoverValue !== null ? hoverValue : (value || 0)
      const isActive = displayValue >= ratingValue
      const isHalfActive = allowHalf && displayValue >= ratingValue - 0.5 && displayValue < ratingValue

      return (
        <div
          key={index}
          className={cn(
            "relative inline-flex items-center justify-center",
            readonly ? "cursor-default" : "cursor-pointer",
            "transition-colors"
          )}
        >
          <IconComponent
            className={cn(
              sizeClasses[size],
              isActive ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300",
              "transition-colors"
            )}
          />
          
          {allowHalf && isHalfActive && (
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <IconComponent
                className={cn(
                  sizeClasses[size],
                  "text-yellow-400 fill-yellow-400"
                )}
              />
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center space-x-1", className)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={`Rating: ${value} out of ${max}`}
        tabIndex={readonly ? -1 : 0}
        {...props}
      >
        {Array.from({ length: max }, (_, index) => renderIcon(index))}
        
        {showValue && (
          <span className="ml-2 text-sm text-muted-foreground">
            {allowHalf ? value?.toFixed(1) : value}/{max}
          </span>
        )}
      </div>
    )
  }
)
Rating.displayName = "Rating"

/**
 * RatingDisplay component - Non-interactive rating display
 * 
 * @param value - Rating value
 * @param max - Maximum rating value
 * @param size - Rating size: 'sm' | 'md' | 'lg'
 * @param icon - Icon type: 'star' | 'heart' | 'thumbs-up'
 * @param showValue - Whether to show numeric value
 * @param allowHalf - Whether to display half ratings
 * @param className - Additional CSS classes
 * @returns JSX.Element - Rating display
 * 
 * @example
 * <RatingDisplay value={4.5} max={5} size="lg" showValue />
 */
export const RatingDisplay: React.FC<{
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  icon?: 'star' | 'heart' | 'thumbs-up'
  showValue?: boolean
  allowHalf?: boolean
  className?: string
}> = ({
  value,
  max = 5,
  size = 'md',
  icon = 'star',
  showValue = false,
  allowHalf = false,
  className
}) => {
  return (
    <Rating
      value={value}
      max={max}
      size={size}
      icon={icon}
      readonly
      showValue={showValue}
      allowHalf={allowHalf}
      className={className}
    />
  )
}

/**
 * RatingGroup component - Group of related ratings
 * 
 * @param ratings - Array of rating items
 * @param size - Rating size: 'sm' | 'md' | 'lg'
 * @param className - Additional CSS classes
 * @returns JSX.Element - Rating group
 * 
 * @example
 * <RatingGroup 
 *   ratings={[
 *     { label: "Quality", value: 4.5 },
 *     { label: "Service", value: 4 },
 *     { label: "Value", value: 3.5 }
 *   ]}
 * />
 */
export const RatingGroup: React.FC<{
  ratings: Array<{
    label: string
    value: number
    onChange?: (value: number) => void
    readonly?: boolean
  }>
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({
  ratings,
  size = 'md',
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {ratings.map((rating, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            {rating.label}
          </span>
          <Rating
            value={rating.value}
            onChange={rating.onChange}
            size={size}
            readonly={rating.readonly}
            showValue
          />
        </div>
      ))}
    </div>
  )
}

/**
 * RatingSummary component - Summary of ratings with statistics
 * 
 * @param ratings - Array of rating values
 * @param max - Maximum rating value
 * @param showDistribution - Whether to show rating distribution
 * @param className - Additional CSS classes
 * @returns JSX.Element - Rating summary
 * 
 * @example
 * <RatingSummary 
 *   ratings={[5, 4, 4, 5, 3, 5, 4, 5, 5, 4]} 
 *   showDistribution 
 * />
 */
export const RatingSummary: React.FC<{
  ratings: number[]
  max?: number
  showDistribution?: boolean
  className?: string
}> = ({
  ratings,
  max = 5,
  showDistribution = false,
  className
}) => {
  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
  const distribution = Array.from({ length: max }, (_, index) => {
    const rating = index + 1
    const count = ratings.filter(r => r === rating).length
    const percentage = (count / ratings.length) * 100
    return { rating, count, percentage }
  })

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <div className="text-3xl font-bold">
          {average.toFixed(1)}
        </div>
        <div className="space-y-1">
          <RatingDisplay value={average} max={max} size="md" />
          <div className="text-sm text-muted-foreground">
            {ratings.length} {ratings.length === 1 ? 'rating' : 'ratings'}
          </div>
        </div>
      </div>

      {showDistribution && (
        <div className="space-y-2">
          {distribution.reverse().map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground w-4">
                {rating}
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-8 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { Rating }
