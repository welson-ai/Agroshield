'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronRight } from "lucide-react"

/**
 * AccordionGroup component - Group of accordion items
 * Provides coordinated accordion management
 * 
 * @param children - AccordionItem components
 * @param type - Accordion behavior: 'single' | 'multiple'
 * @param defaultValue - Default open items
 * @param value - Currently open items
 * @param onValueChange - Callback when open items change
 * @param collapsible - Whether items can be collapsed
 * @param className - Additional CSS classes
 * @returns JSX.Element - Accordion group
 * 
 * @example
 * <AccordionGroup type="single" defaultValue="item1">
 *   <AccordionItem value="item1" title="Item 1">
 *     Content 1
 *   </AccordionItem>
 *   <AccordionItem value="item2" title="Item 2">
 *     Content 2
 *   </AccordionItem>
 * </AccordionGroup>
 */
interface AccordionGroupProps {
  children: React.ReactNode
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
  className?: string
}

const AccordionGroupContext = React.createContext<{
  type: 'single' | 'multiple'
  value: string | string[]
  onValueChange: (value: string | string[]) => void
  collapsible: boolean
}>({
  type: 'single',
  value: '',
  onValueChange: () => {},
  collapsible: true
})

const AccordionGroup = React.forwardRef<HTMLDivElement, AccordionGroupProps>(
  ({ 
    children, 
    type = 'single', 
    defaultValue, 
    value, 
    onValueChange, 
    collapsible = true, 
    className, 
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string | string[]>(
      type === 'single' ? (defaultValue as string || '') : (defaultValue as string[] || [])
    )

    const currentValue = value !== undefined ? value : internalValue

    const handleValueChange = React.useCallback((newValue: string | string[]) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }, [value, onValueChange])

    const contextValue = React.useMemo(() => ({
      type,
      value: currentValue,
      onValueChange: handleValueChange,
      collapsible
    }), [type, currentValue, handleValueChange, collapsible])

    return (
      <AccordionGroupContext.Provider value={contextValue}>
        <div ref={ref} className={cn("space-y-1", className)} {...props}>
          {children}
        </div>
      </AccordionGroupContext.Provider>
    )
  }
)
AccordionGroup.displayName = "AccordionGroup"

/**
 * AccordionItem component - Individual accordion item
 * 
 * @param value - Unique value for the item
 * @param title - Item title
 * @param children - Item content
 * @param disabled - Whether item is disabled
 * @param icon - Custom icon for the trigger
 * @param className - Additional CSS classes
 * @returns JSX.Element - Accordion item
 * 
 * @example
 * <AccordionItem value="item1" title="Item 1" disabled>
 *   <p>Item content</p>
 * </AccordionItem>
 */
interface AccordionItemProps {
  value: string
  title: React.ReactNode
  children: React.ReactNode
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, title, children, disabled = false, icon, className, ...props }, ref) => {
    const { type, currentValue, onValueChange, collapsible } = React.useContext(AccordionGroupContext)
    
    const isOpen = type === 'single' 
      ? currentValue === value 
      : Array.isArray(currentValue) && currentValue.includes(value)

    const toggleOpen = () => {
      if (disabled) return

      if (type === 'single') {
        const newValue = isOpen && collapsible ? '' : value
        onValueChange(newValue)
      } else {
        const currentArray = Array.isArray(currentValue) ? currentValue : []
        const newArray = isOpen 
          ? currentArray.filter(v => v !== value)
          : [...currentArray, value]
        onValueChange(newArray)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "border rounded-lg overflow-hidden",
          isOpen && "border-primary",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {/* Trigger */}
        <button
          type="button"
          className={cn(
            "w-full px-4 py-3 text-left flex items-center justify-between",
            "hover:bg-accent/50 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            disabled && "cursor-not-allowed"
          )}
          onClick={toggleOpen}
          disabled={disabled}
          aria-expanded={isOpen}
          aria-controls={`accordion-content-${value}`}
        >
          <div className="flex items-center space-x-3">
            {icon}
            <span className="font-medium">{title}</span>
          </div>
          
          <div className={cn(
            "transition-transform duration-200",
            isOpen && "rotate-180"
          )}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>

        {/* Content */}
        <div
          id={`accordion-content-${value}`}
          className={cn(
            "overflow-hidden transition-all duration-200",
            isOpen ? "max-h-96" : "max-h-0"
          )}
          aria-hidden={!isOpen}
        >
          <div className="px-4 py-3 border-t">
            {children}
          </div>
        </div>
      </div>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

/**
 * AccordionSection component - Section with accordion items
 * 
 * @param title - Section title
 * @param children - AccordionItem components
 * @param description - Section description
 * @param className - Additional CSS classes
 * @returns JSX.Element - Accordion section
 * 
 * @example
 * <AccordionSection title="Settings" description="Manage your settings">
 *   <AccordionItem value="profile" title="Profile">
 *     Profile settings
 *   </AccordionItem>
 *   <AccordionItem value="notifications" title="Notifications">
 *     Notification settings
 *   </AccordionItem>
 * </AccordionSection>
 */
export const AccordionSection: React.FC<{
  title: string
  children: React.ReactNode
  description?: string
  className?: string
}> = ({
  title,
  children,
  description,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      
      <AccordionGroup type="multiple">
        {children}
      </AccordionGroup>
    </div>
  )
}

/**
 * AccordionSidebar component - Sidebar with accordion navigation
 * 
 * @param items - Navigation items with accordion structure
 * @param activeItem - Currently active item
 * @param onItemClick - Callback when item is clicked
 * @param className - Additional CSS classes
 * @returns JSX.Element - Accordion sidebar
 * 
 * @example
 * <AccordionSidebar 
 *   items={navigationItems}
 *   activeItem="dashboard"
 *   onItemClick={handleNavigation}
 * />
 */
export const AccordionSidebar: React.FC<{
  items: Array<{
    id: string
    title: string
    icon?: React.ReactNode
    children?: Array<{
      id: string
      title: string
      icon?: React.ReactNode
    }>
  }>
  activeItem?: string
  onItemClick?: (itemId: string) => void
  className?: string
}> = ({
  items,
  activeItem,
  onItemClick,
  className
}) => {
  const [openItems, setOpenItems] = React.useState<string[]>([])

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  return (
    <div className={cn("w-64 border-r bg-background", className)}>
      <div className="p-4">
        <AccordionGroup type="multiple" value={openItems} onValueChange={setOpenItems}>
          {items.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              title={
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
              }
              icon={null}
            >
              <div className="space-y-1">
                {item.children?.map((child) => (
                  <button
                    key={child.id}
                    className={cn(
                      "w-full px-3 py-2 text-left rounded-md flex items-center space-x-3",
                      "hover:bg-accent hover:text-accent-foreground transition-colors",
                      activeItem === child.id && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => onItemClick?.(child.id)}
                  >
                    {child.icon}
                    <span className="text-sm">{child.title}</span>
                  </button>
                ))}
              </div>
            </AccordionItem>
          ))}
        </AccordionGroup>
      </div>
    </div>
  )
}

/**
 * AccordionFAQ component - FAQ accordion section
 * 
 * @param faqs - Array of FAQ items
 * @param className - Additional CSS classes
 * @returns JSX.Element - FAQ accordion
 * 
 * @example
 * <AccordionFAQ 
 *   faqs={[
 *     { question: "How do I get started?", answer: "Simply sign up..." },
 *     { question: "What features are included?", answer: "We offer..." }
 *   ]}
 * />
 */
export const AccordionFAQ: React.FC<{
  faqs: Array<{
    question: string
    answer: string
  }>
  className?: string
}> = ({
  faqs,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
        <p className="text-muted-foreground">Find answers to common questions</p>
      </div>
      
      <AccordionGroup type="multiple">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            value={`faq-${index}`}
            title={faq.question}
            icon={<ChevronRight className="w-4 h-4" />}
          >
            <p className="text-muted-foreground">{faq.answer}</p>
          </AccordionItem>
        ))}
      </AccordionGroup>
    </div>
  )
}

export { AccordionGroup, AccordionItem, AccordionGroupContext }
