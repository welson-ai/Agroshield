'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Slider component - Range input with visual track
 * Provides accessible slider with keyboard navigation
 * 
 * @param value - Current slider value
 * @param onValueChange - Callback when value changes
 * @param min - Minimum value
 * @param max - Maximum value
 * @param step - Step increment
 * @param disabled - Whether slider is disabled
 * @param className - Additional CSS classes
 * @param id - Unique identifier
 * @param label - Accessible label
 * @param showValue - Whether to display current value
 * @returns JSX.Element - Slider component
 * 
 * @example
 * <Slider
 *   value={volume}
 *   onValueChange={setVolume}
 *   min={0}
 *   max={100}
 *   step={1}
 *   label="Volume"
 *   showValue
 * />
 */
interface SliderProps {
  value?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  id?: string
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({
    value = 0,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    className,
    id,
    label,
    showValue = false,
    size = 'md',
    ...props
  }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const [currentValue, setCurrentValue] = React.useState(value)
    const sliderRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const sliderId = id || `slider-${React.useId()}`

    React.useEffect(() => {
      setCurrentValue(value)
    }, [value])

    const sizeClasses = {
      sm: 'h-2',
      md: 'h-2',
      lg: 'h-3'
    }

    const thumbSizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    }

    const percentage = ((currentValue - min) / (max - min)) * 100

    const handleMouseDown = (e: React.MouseEvent) => {
      if (disabled) return
      setIsDragging(true)
      updateValue(e.clientX)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return
      
      let newValue = currentValue
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          newValue = Math.max(min, currentValue - step)
          break
        case 'ArrowRight':
        case 'ArrowUp':
          newValue = Math.min(max, currentValue + step)
          break
        case 'Home':
          newValue = min
          break
        case 'End':
          newValue = max
          break
        default:
          return
      }
      
      e.preventDefault()
      setCurrentValue(newValue)
      onValueChange?.(newValue)
    }
    }

    const handleTouchStart = (e: React.TouchEvent) => {
      if (disabled) return
      setIsDragging(true)
      updateValue(e.touches[0].clientX)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || disabled) return
      updateValue(e.clientX)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || disabled) return
      updateValue(e.touches[0].clientX)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return

      let newValue = currentValue
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          newValue = Math.max(min, currentValue - step)
          break
        case 'ArrowRight':
        case 'ArrowUp':
          newValue = Math.min(max, currentValue + step)
          break
        case 'Home':
          newValue = min
          break
        case 'End':
          newValue = max
          break
        case 'PageDown':
          newValue = Math.max(min, currentValue - step * 10)
          break
        case 'PageUp':
          newValue = Math.min(max, currentValue + step * 10)
          break
        default:
          return
      }

      setCurrentValue(newValue)
      onValueChange?.(newValue)
      e.preventDefault()
    }

    const updateValue = (clientX: number) => {
      if (!sliderRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = min + percentage * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))

      setCurrentValue(clampedValue)
      onValueChange?.(clampedValue)
    }

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        document.addEventListener('touchmove', handleTouchMove)
        document.addEventListener('touchend', handleTouchEnd)

        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
          document.removeEventListener('touchmove', handleTouchMove)
          document.removeEventListener('touchend', handleTouchEnd)
        }
      }
    }, [isDragging, disabled])

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={sliderId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <div
            ref={sliderRef}
            className={cn(
              "relative w-full cursor-pointer",
              disabled && "cursor-not-allowed opacity-50",
              className
            )}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onKeyDown={handleKeyDown}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={currentValue}
            aria-valuetext={`${currentValue}`}
            tabIndex={disabled ? -1 : 0}
            ref={ref}
            {...props}
          >
            {/* Track */}
            <div
              className={cn(
                "w-full rounded-full bg-muted",
                sizeClasses[size]
              )}
            >
              {/* Filled track */}
              <div
                className={cn(
                  "h-full rounded-full bg-primary transition-all duration-150",
                  sizeClasses[size]
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Thumb */}
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 rounded-full bg-primary border-2 border-primary-foreground shadow-lg transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                thumbSizeClasses[size],
                disabled && "bg-muted border-muted cursor-not-allowed"
              )}
              style={{ left: `calc(${percentage}% - ${thumbSizeClasses[size].split(' ')[1]})` }}
              tabIndex={-1}
            />
          </div>

          {/* Hidden input for form submission */}
          <input
            ref={inputRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onChange={(e) => {
              const newValue = Number(e.target.value)
              setCurrentValue(newValue)
              onValueChange?.(newValue)
            }}
            disabled={disabled}
            className="sr-only"
            id={sliderId}
            aria-label={label}
          />
        </div>

        {/* Value display */}
        {showValue && (
          <div className="text-sm text-muted-foreground min-w-[3rem] text-right tabular-nums">
            {currentValue}
          </div>
        )}
      </div>
    )
  }
)
Slider.displayName = "Slider"

/**
 * RangeSlider component - Dual-handle range slider
 * Provides range selection with two handles
 * 
 * @param value - Current range values [min, max]
 * @param onValueChange - Callback when range changes
 * @param min - Minimum possible value
 * @param max - Maximum possible value
 * @param step - Step increment
 * @param disabled - Whether slider is disabled
 * @param className - Additional CSS classes
 * @param showValues - Whether to display current values
 * @returns JSX.Element - Range slider component
 * 
 * @example
 * <RangeSlider
 *   value={priceRange}
 *   onValueChange={setPriceRange}
 *   min={0}
 *   max={1000}
 *   step={10}
 *   showValues
 * />
 */
interface RangeSliderProps {
  value?: [number, number]
  onValueChange?: (value: [number, number]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  showValues?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const RangeSlider = React.forwardRef<HTMLDivElement, RangeSliderProps>(
  ({
    value = [0, 100],
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
    className,
    showValues = false,
    size = 'md',
    ...props
  }, ref) => {
    const [isDragging, setIsDragging] = React.useState<'min' | 'max' | null>(null)
    const [currentValue, setCurrentValue] = React.useState(value)
    const sliderRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      setCurrentValue(value)
    }, [value])

    const sizeClasses = {
      sm: 'h-2',
      md: 'h-2',
      lg: 'h-3'
    }

    const thumbSizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    }

    const [minValue, maxValue] = currentValue
    const minPercentage = ((minValue - min) / (max - min)) * 100
    const maxPercentage = ((maxValue - min) / (max - min)) * 100

    const handleMouseDown = (e: React.MouseEvent, handle: 'min' | 'max') => {
      if (disabled) return
      setIsDragging(handle)
      updateValue(e.clientX, handle)
    }

    const updateValue = (clientX: number, handle: 'min' | 'max') => {
      if (!sliderRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = min + percentage * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))

      setCurrentValue(prev => {
        if (handle === 'min') {
          return [Math.min(clampedValue, prev[1]), prev[1]]
        } else {
          return [prev[0], Math.max(clampedValue, prev[0])]
        }
      })
    }

    React.useEffect(() => {
      if (isDragging) {
        const handleMouseMove = (e: MouseEvent) => {
          if (!isDragging || disabled) return
          updateValue(e.clientX, isDragging)
        }

        const handleMouseUp = () => {
          setIsDragging(null)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
        }
      }
    }, [isDragging, disabled])

    React.useEffect(() => {
      onValueChange?.(currentValue)
    }, [currentValue, onValueChange])

    return (
      <div className="space-y-2">
        <div className="relative">
          <div
            ref={sliderRef}
            className={cn(
              "relative w-full cursor-pointer",
              disabled && "cursor-not-allowed opacity-50",
              className
            )}
            ref={ref}
            {...props}
          >
            {/* Track */}
            <div
              className={cn(
                "w-full rounded-full bg-muted",
                sizeClasses[size]
              )}
            >
              {/* Filled track */}
              <div
                className={cn(
                  "h-full rounded-full bg-primary transition-all duration-150",
                  sizeClasses[size]
                )}
                style={{
                  left: `${minPercentage}%`,
                  width: `${maxPercentage - minPercentage}%`
                }}
              />
            </div>

            {/* Min handle */}
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 rounded-full bg-primary border-2 border-primary-foreground shadow-lg transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                thumbSizeClasses[size],
                disabled && "bg-muted border-muted cursor-not-allowed"
              )}
              style={{ left: `calc(${minPercentage}% - ${thumbSizeClasses[size].split(' ')[1]})` }}
              onMouseDown={(e) => handleMouseDown(e, 'min')}
              tabIndex={disabled ? -1 : 0}
            />

            {/* Max handle */}
            <div
              className={cn(
                "absolute top-1/2 -translate-y-1/2 rounded-full bg-primary border-2 border-primary-foreground shadow-lg transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                thumbSizeClasses[size],
                disabled && "bg-muted border-muted cursor-not-allowed"
              )}
              style={{ left: `calc(${maxPercentage}% - ${thumbSizeClasses[size].split(' ')[1]})` }}
              onMouseDown={(e) => handleMouseDown(e, 'max')}
              tabIndex={disabled ? -1 : 0}
            />
          </div>
        </div>

        {/* Value display */}
        {showValues && (
          <div className="flex justify-between text-sm text-muted-foreground tabular-nums">
            <span>{minValue}</span>
            <span>{maxValue}</span>
          </div>
        )}
      </div>
    )
  }
)
RangeSlider.displayName = "RangeSlider"

export { Slider, RangeSlider }
