'use client'

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Accordion component - Collapsible content sections
 * Provides accessible accordion with smooth animations
 * 
 * @param children - Accordion items
 * @param className - Additional CSS classes
 * @param type - Accordion type: 'single' | 'multiple'
 * @param collapsible - Whether items can be collapsed
 * @returns JSX.Element - Accordion component
 * 
 * @example
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Section 1</AccordionTrigger>
 *     <AccordionContent>Content 1</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */
interface AccordionProps {
  children: React.ReactNode
  className?: string
  type?: 'single' | 'multiple'
  collapsible?: boolean
  defaultValue?: string | string[]
}

const Accordion = React.forwardRef<
  HTMLDivElement,
  AccordionProps
>(({ className, type = 'single', collapsible = true, defaultValue, ...props }, ref) => {
  const [openItems, setOpenItems] = React.useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []
  )

  React.useEffect(() => {
    const newDefaultValue = Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []
    setOpenItems(newDefaultValue)
  }, [defaultValue])

  const handleToggle = (value: string) => {
    setOpenItems(prev => {
      if (type === 'single') {
        return prev.includes(value) ? [] : [value]
      } else {
        return prev.includes(value) 
          ? prev.filter(item => item !== value)
          : [...prev, value]
      }
    })
  }

  return (
    <div
      ref={ref}
      className={cn("w-full", className)}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen: openItems.includes(child.props.value),
            onToggle: () => handleToggle(child.props.value),
            type,
            collapsible
          })
        }
        return child
      })}
    </div>
  )
})
Accordion.displayName = "Accordion"

/**
 * AccordionItem component - Individual accordion section
 * 
 * @param children - Trigger and content elements
 * @param value - Unique identifier for the item
 * @param className - Additional CSS classes
 * @returns JSX.Element - Accordion item
 */
interface AccordionItemProps {
  children: React.ReactNode
  value: string
  className?: string
  isOpen?: boolean
  onToggle?: () => void
  type?: 'single' | 'multiple'
  collapsible?: boolean
}

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  AccordionItemProps
>(({ className, value, isOpen, onToggle, type, collapsible, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("border-b border-border", className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value,
            isOpen,
            onToggle,
            type,
            collapsible
          })
        }
        return child
      })}
    </div>
  )
})
AccordionItem.displayName = "AccordionItem"

/**
 * AccordionTrigger component - Clickable header for accordion sections
 * 
 * @param children - Trigger content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Accordion trigger
 */
interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  value?: string
  isOpen?: boolean
  onToggle?: () => void
  type?: 'single' | 'multiple'
  collapsible?: boolean
}

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ className, children, isOpen, onToggle, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between py-4 text-sm font-medium transition-all hover:underline",
        className
      )}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={`accordion-content-${props.value}`}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

/**
 * AccordionContent component - Collapsible content area
 * 
 * @param children - Content to display when expanded
 * @param className - Additional CSS classes
 * @returns JSX.Element - Accordion content
 */
interface AccordionContentProps {
  children: React.ReactNode
  className?: string
  value?: string
  isOpen?: boolean
  type?: 'single' | 'multiple'
  collapsible?: boolean
}

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ className, children, isOpen, value, ...props }, ref) => {
  return (
    <div
      ref={ref}
      id={`accordion-content-${value}`}
      className={cn(
        "overflow-hidden text-sm",
        isOpen ? "animate-in slide-in-from-top-2" : "animate-out slide-out-to-top-2"
      )}
      style={{
        gridTemplateRows: isOpen ? "1fr" : "0fr",
      }}
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>
        {children}
      </div>
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
