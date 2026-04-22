'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight, MoreHorizontal } from "lucide-react"

/**
 * Breadcrumb component - Navigation breadcrumb trail
 * Provides accessible breadcrumb navigation
 * 
 * @param children - Breadcrumb items
 * @param separator - Custom separator component
 * @param maxItems - Maximum items to show before truncating
 * @param showHome - Whether to show home icon
 * @param className - Additional CSS classes
 * @returns JSX.Element - Breadcrumb component
 * 
 * @example
 * <Breadcrumb maxItems={3} showHome>
 *   <BreadcrumbItem href="/">Home</BreadcrumbItem>
 *   <BreadcrumbItem href="/products">Products</BreadcrumbItem>
 *   <BreadcrumbItem>Current Page</BreadcrumbItem>
 * </Breadcrumb>
 */
interface BreadcrumbProps {
  children: React.ReactNode
  separator?: React.ReactNode
  maxItems?: number
  showHome?: boolean
  className?: string
}

const BreadcrumbContext = React.createContext<{
  separator: React.ReactNode
}>({
  separator: <ChevronRight className="w-4 h-4" />
})

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ 
    children, 
    separator = <ChevronRight className="w-4 h-4" />, 
    maxItems, 
    showHome = false, 
    className, 
    ...props 
  }, ref) => {
    const items = React.Children.toArray(children)
    const itemCount = items.length

    // Handle truncation if maxItems is specified
    let displayItems = items
    if (maxItems && itemCount > maxItems) {
      const firstItem = items[0]
      const lastItems = items.slice(-(maxItems - 1))
      displayItems = [
        firstItem,
        <BreadcrumbItem key="more" disabled>
          <MoreHorizontal className="w-4 h-4" />
        </BreadcrumbItem>,
        ...lastItems
      ]
    }

    const contextValue = React.useMemo(() => ({
      separator
    }), [separator])

    return (
      <BreadcrumbContext.Provider value={contextValue}>
        <nav
          ref={ref}
          className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
          aria-label="Breadcrumb"
          {...props}
        >
          {showHome && (
            <BreadcrumbItem href="/" aria-label="Home">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </BreadcrumbItem>
          )}
          
          {displayItems.map((item, index) => {
            if (!React.isValidElement(item)) return null
            
            const isLast = index === displayItems.length - 1
            
            return (
              <React.Fragment key={React.isValidElement(item) ? item.props.key || index : index}>
                {item}
                {!isLast && (
                  <span className="flex items-center" aria-hidden="true">
                    {separator}
                  </span>
                )}
              </React.Fragment>
            )
          })}
        </nav>
      </BreadcrumbContext.Provider>
    )
  }
)
Breadcrumb.displayName = "Breadcrumb"

/**
 * BreadcrumbItem component - Individual breadcrumb item
 * 
 * @param children - Item content
 * @param href - Link URL (optional)
 * @param active - Whether this is the current page
 * @param disabled - Whether item is disabled
 * @param className - Additional CSS classes
 * @returns JSX.Element - Breadcrumb item
 * 
 * @example
 * <BreadcrumbItem href="/products" active={false}>
 *   Products
 * </BreadcrumbItem>
 */
interface BreadcrumbItemProps {
  children: React.ReactNode
  href?: string
  active?: boolean
  disabled?: boolean
  className?: string
}

const BreadcrumbItem = React.forwardRef<HTMLAnchorElement | HTMLSpanElement, BreadcrumbItemProps>(
  ({ children, href, active = false, disabled = false, className, ...props }, ref) => {
    const Component = href && !disabled ? 'a' : 'span'
    
    return (
      <Component
        ref={ref as any}
        href={href}
        className={cn(
          "transition-colors",
          href && !disabled && !active && "hover:text-foreground",
          active && "text-foreground font-medium",
          disabled && "text-muted-foreground/50 cursor-not-allowed",
          !href && !disabled && "text-foreground",
          className
        )}
        aria-current={active ? 'page' : undefined}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
BreadcrumbItem.displayName = "BreadcrumbItem"

/**
 * BreadcrumbLink component - Link breadcrumb item
 * 
 * @param children - Link content
 * @param href - Link URL
 * @param active - Whether this is the current page
 * @param className - Additional CSS classes
 * @returns JSX.Element - Breadcrumb link
 * 
 * @example
 * <BreadcrumbLink href="/products" active={false}>
 *   Products
 * </BreadcrumbLink>
 */
export const BreadcrumbLink: React.FC<{
  children: React.ReactNode
  href: string
  active?: boolean
  className?: string
}> = ({
  children,
  href,
  active = false,
  className
}) => {
  return (
    <BreadcrumbItem href={href} active={active} className={className}>
      {children}
    </BreadcrumbItem>
  )
}

/**
 * BreadcrumbPage component - Current page breadcrumb item
 * 
 * @param children - Page title
 * @param className - Additional CSS classes
 * @returns JSX.Element - Breadcrumb page
 * 
 * @example
 * <BreadcrumbPage>Current Page</BreadcrumbPage>
 */
export const BreadcrumbPage: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({
  children,
  className
}) => {
  return (
    <BreadcrumbItem active className={className}>
      {children}
    </BreadcrumbItem>
  )
}

/**
 * BreadcrumbSeparator component - Custom separator
 * 
 * @param children - Separator content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Breadcrumb separator
 * 
 * @example
 * <BreadcrumbSeparator>/</BreadcrumbSeparator>
 */
export const BreadcrumbSeparator: React.FC<{
  children?: React.ReactNode
  className?: string
}> = ({
  children = <ChevronRight className="w-4 h-4" />,
  className
}) => {
  return (
    <span className={cn("flex items-center", className)} aria-hidden="true">
      {children}
    </span>
  )
}

/**
 * BreadcrumbEllipsis component - Ellipsis for truncated breadcrumbs
 * 
 * @param className - Additional CSS classes
 * @returns JSX.Element - Breadcrumb ellipsis
 * 
 * @example
 * <BreadcrumbEllipsis />
 */
export const BreadcrumbEllipsis: React.FC<{
  className?: string
}> = ({ className }) => {
  return (
    <BreadcrumbItem disabled className={className}>
      <MoreHorizontal className="w-4 h-4" />
    </BreadcrumbItem>
  )
}

/**
 * BreadcrumbList component - Structured list for breadcrumbs
 * 
 * @param children - Breadcrumb items
 * @param className - Additional CSS classes
 * @returns JSX.Element - Breadcrumb list
 * 
 * @example
 * <BreadcrumbList>
 *   <BreadcrumbLink href="/">Home</BreadcrumbLink>
 *   <BreadcrumbLink href="/products">Products</BreadcrumbLink>
 *   <BreadcrumbPage>Product Detail</BreadcrumbPage>
 * </BreadcrumbList>
 */
export const BreadcrumbList: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({
  children,
  className
}) => {
  return (
    <ol className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null
        
        return (
          <li key={index} className="flex items-center">
            {child}
            {index < React.Children.count(children) - 1 && (
              <BreadcrumbSeparator />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/**
 * BreadcrumbItem component - Structured list item
 * 
 * @param children - Item content
 * @param href - Link URL (optional)
 * @param active - Whether this is the current page
 * @param className - Additional CSS classes
 * @returns JSX.Element - Breadcrumb list item
 * 
 * @example
 * <BreadcrumbListItem href="/products" active={false}>
 *   Products
 * </BreadcrumbListItem>
 */
export const BreadcrumbListItem: React.FC<{
  children: React.ReactNode
  href?: string
  active?: boolean
  className?: string
}> = ({
  children,
  href,
  active = false,
  className
}) => {
  return (
    <BreadcrumbItem href={href} active={active} className={className}>
      {children}
    </BreadcrumbItem>
  )
}

export { Breadcrumb, BreadcrumbItem, BreadcrumbContext }
