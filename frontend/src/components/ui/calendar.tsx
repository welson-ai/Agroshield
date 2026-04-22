'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

/**
 * Calendar component - Accessible date picker
 * Provides calendar navigation with keyboard support
 * 
 * @param selected - Selected date
 * @param onSelect - Callback when date is selected
 * @param disabled - Disabled dates
 * @param minDate - Minimum selectable date
 * @param maxDate - Maximum selectable date
 * @param className - Additional CSS classes
 * @returns JSX.Element - Calendar component
 * 
 * @example
 * <Calendar 
 *   selected={selectedDate} 
 *   onSelect={setSelectedDate}
 *   minDate={new Date()}
 * />
 */
interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: Date[]
  minDate?: Date
  maxDate?: Date
  className?: string
}

const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
  ({ 
    selected, 
    onSelect, 
    disabled = [], 
    minDate, 
    maxDate, 
    className, 
    ...props 
  }, ref) => {
    const [currentMonth, setCurrentMonth] = React.useState(new Date())
    const [focusedDate, setFocusedDate] = React.useState<Date | null>(selected || new Date())

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()
    const weeks = Math.ceil((daysInMonth + firstDayOfMonth) / 7)

    const isDateDisabled = (date: Date) => {
      return disabled.some(disabledDate => 
        disabledDate.toDateString() === date.toDateString()
      ) || (
        minDate && date < minDate
      ) || (
        maxDate && date > maxDate
      )
    }

    const isDateSelected = (date: Date) => {
      return selected?.toDateString() === date.toDateString()
    }

    const isDateToday = (date: Date) => {
      return date.toDateString() === new Date().toDateString()
    }

    const handleDateSelect = (date: Date) => {
      if (!isDateDisabled(date)) {
        onSelect?.(date)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent, date: Date) => {
      if (isDateDisabled(date)) return

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault()
          handleDateSelect(date)
          break
        case 'ArrowUp':
          e.preventDefault()
          const weekBefore = new Date(date)
          weekBefore.setDate(date.getDate() - 7)
          setFocusedDate(weekBefore)
          break
        case 'ArrowDown':
          e.preventDefault()
          const weekAfter = new Date(date)
          weekAfter.setDate(date.getDate() + 7)
          setFocusedDate(weekAfter)
          break
        case 'ArrowLeft':
          e.preventDefault()
          const dayBefore = new Date(date)
          dayBefore.setDate(date.getDate() - 1)
          setFocusedDate(dayBefore)
          break
        case 'ArrowRight':
          e.preventDefault()
          const dayAfter = new Date(date)
          dayAfter.setDate(date.getDate() + 1)
          setFocusedDate(dayAfter)
          break
      }
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
      setCurrentMonth(prev => {
        const newMonth = new Date(prev)
        if (direction === 'prev') {
          newMonth.setMonth(prev.getMonth() - 1)
        } else {
          newMonth.setMonth(prev.getMonth() + 1)
        }
        return newMonth
      })
    }

    const renderCalendarDays = () => {
      const days = []
      let dayCounter = 1

      for (let week = 0; week < weeks; week++) {
        const weekDays = []
        
        for (let day = 0; day < 7; day++) {
          if (week === 0 && day < firstDayOfMonth) {
            // Empty cells before month starts
            weekDays.push(
              <div key={`empty-${week}-${day}`} className="h-9 w-9" />
            )
          } else if (dayCounter > daysInMonth) {
            // Empty cells after month ends
            weekDays.push(
              <div key={`empty-${week}-${day}`} className="h-9 w-9" />
            )
          } else {
            // Actual calendar days
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayCounter)
            const isDisabled = isDateDisabled(date)
            const isSelected = isDateSelected(date)
            const isToday = isDateToday(date)
            const isFocused = focusedDate?.toDateString() === date.toDateString()

            weekDays.push(
              <button
                key={dayCounter}
                type="button"
                className={cn(
                  "h-9 w-9 rounded-md text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isSelected && "bg-primary text-primary-foreground",
                  !isSelected && "hover:bg-accent hover:text-accent-foreground",
                  isToday && !isSelected && "bg-accent text-accent-foreground",
                  isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed",
                  isFocused && "ring-2 ring-ring ring-offset-2"
                )}
                disabled={isDisabled}
                onClick={() => handleDateSelect(date)}
                onKeyDown={(e) => handleKeyDown(e, date)}
                aria-pressed={isSelected}
                aria-disabled={isDisabled}
                aria-label={`Select ${date.toLocaleDateString()}`}
              >
                {dayCounter}
              </button>
            )
            dayCounter++
          }
        }
        
        days.push(
          <div key={week} className="grid grid-cols-7 gap-1">
            {weekDays}
          </div>
        )
      }

      return days
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
      <div
        ref={ref}
        className={cn("p-3", className)}
        role="grid"
        aria-label="Calendar"
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            className={cn(
              "h-7 w-7 rounded-md text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            onClick={() => navigateMonth('prev')}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="text-sm font-medium">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          
          <button
            type="button"
            className={cn(
              "h-7 w-7 rounded-md text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            onClick={() => navigateMonth('next')}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Week days */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div
              key={day}
              className="h-9 w-9 rounded-md text-xs font-medium text-muted-foreground flex items-center justify-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="space-y-1">
          {renderCalendarDays()}
        </div>
      </div>
    )
  }
)
Calendar.displayName = "Calendar"

/**
 * DatePicker component - Date input with calendar
 * 
 * @param value - Selected date
 * @param onChange - Callback when date changes
 * @param placeholder - Input placeholder
 * @param disabled - Whether input is disabled
 * @param className - Additional CSS classes
 * @returns JSX.Element - Date picker
 * 
 * @example
 * <DatePicker 
 *   value={selectedDate} 
 *   onChange={setSelectedDate}
 *   placeholder="Select a date"
 * />
 */
interface DatePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select a date",
  disabled = false,
  className
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState(value)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setSelectedDate(value)
  }, [value])

  const handleSelect = (date: Date) => {
    setSelectedDate(date)
    onChange?.(date)
    setIsOpen(false)
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          disabled && "pointer-events-none"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {selectedDate ? formatDate(selectedDate) : placeholder}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-background border border-input rounded-md shadow-lg">
          <Calendar
            selected={selectedDate}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  )
}

export { Calendar, DatePicker }
