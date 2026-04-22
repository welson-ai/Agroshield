'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, Clock, AlertCircle } from "lucide-react"

/**
 * Timeline component - Vertical timeline display
 * Provides interactive timeline with status indicators
 * 
 * @param items - Timeline items data
 * @param orientation - Timeline orientation: 'vertical' | 'horizontal'
 * @variant - Timeline variant: 'default' | 'alternate' | 'compact'
 * @param showConnector - Whether to show connecting lines
 * @param className - Additional CSS classes
 * @returns JSX.Element - Timeline component
 * 
 * @example
 * <Timeline 
 *   items={timelineData}
 *   orientation="vertical"
 *   variant="default"
 * />
 */
interface TimelineItem {
  id: string
  title: string
  description?: string
  date?: string
  status?: 'completed' | 'active' | 'pending' | 'error'
  icon?: React.ReactNode
  content?: React.ReactNode
}

interface TimelineProps {
  items: TimelineItem[]
  orientation?: 'vertical' | 'horizontal'
  variant?: 'default' | 'alternate' | 'compact'
  showConnector?: boolean
  className?: string
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ 
    items, 
    orientation = 'vertical', 
    variant = 'default', 
    showConnector = true, 
    className, 
    ...props 
  }, ref) => {
    const renderIcon = (item: TimelineItem) => {
      if (item.icon) return item.icon

      switch (item.status) {
        case 'completed':
          return <Check className="w-4 h-4" />
        case 'active':
          return <Clock className="w-4 h-4" />
        case 'error':
          return <AlertCircle className="w-4 h-4" />
        default:
          return <div className="w-2 h-2 rounded-full bg-muted-foreground" />
      }
    }

    const getStatusClasses = (status?: TimelineItem['status']) => {
      switch (status) {
        case 'completed':
          return 'bg-green-500 text-white border-green-500'
        case 'active':
          return 'bg-blue-500 text-white border-blue-500'
        case 'error':
          return 'bg-destructive text-white border-destructive'
        default:
          return 'bg-muted text-muted-foreground border-muted-foreground'
      }
    }

    const isAlternate = variant === 'alternate'
    const isCompact = variant === 'compact'

    if (orientation === 'horizontal') {
      return (
        <div
          ref={ref}
          className={cn("relative w-full", className)}
          {...props}
        >
          {/* Connector line */}
          {showConnector && (
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted-foreground/20" />
          )}

          <div className="flex items-center justify-between relative">
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col items-center relative">
                {/* Timeline dot */}
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center z-10",
                  getStatusClasses(item.status)
                )}>
                  {renderIcon(item)}
                </div>

                {/* Content */}
                <div className={cn(
                  "mt-3 text-center",
                  isCompact ? "max-w-[100px]" : "max-w-[150px]"
                )}>
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  {!isCompact && item.description && (
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  )}
                  {item.date && (
                    <p className="text-xs text-muted-foreground mt-1">{item.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        {...props}
      >
        {/* Connector line */}
        {showConnector && (
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted-foreground/20" />
        )}

        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={item.id} className={cn(
              "flex items-start space-x-4",
              isAlternate && index % 2 === 1 && "flex-row-reverse space-x-reverse"
            )}>
              {/* Timeline dot */}
              <div className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 flex-shrink-0",
                getStatusClasses(item.status)
              )}>
                {renderIcon(item)}
              </div>

              {/* Content */}
              <div className={cn(
                "flex-1",
                isAlternate && index % 2 === 1 && "text-right"
              )}>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                  {item.date && (
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  )}
                </div>

                {item.content && (
                  <div className="mt-2">
                    {item.content}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
Timeline.displayName = "Timeline"

export { Timeline }
