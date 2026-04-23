'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { 
  Menu, 
  X, 
  Home, 
  Shield, 
  TrendingUp, 
  User, 
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

/**
 * MobileNavigation component - Responsive mobile navigation menu
 * Provides hamburger menu and mobile-optimized navigation
 * 
 * @param className - Additional CSS classes for styling
 * @param items - Navigation items array
 * @param activeItem - Currently active navigation item
 * @param onItemClick - Callback when navigation item is clicked
 * @returns JSX.Element - Mobile navigation with hamburger menu
 * 
 * @example
 * <MobileNavigation 
 *   items={navItems} 
 *   activeItem="dashboard" 
 *   onItemClick={handleNavClick} 
 * />
 */
interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  badge?: string
  children?: NavItem[]
}

interface MobileNavigationProps {
  className?: string
  items: NavItem[]
  activeItem?: string
  onItemClick?: (item: NavItem) => void
}

export function MobileNavigation({ 
  className, 
  items, 
  activeItem, 
  onItemClick 
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleMenu = () => setIsOpen(!isOpen)

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleItemClick = (item: NavItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.id)
    } else {
      onItemClick?.(item)
      setIsOpen(false)
    }
  }

  return (
    <div className={cn('md:hidden', className)}>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        className="h-10 w-10 p-0"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="fixed top-0 left-0 right-0 bg-background border-b">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="h-8 w-8 p-0"
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="fixed top-16 left-0 right-0 bottom-0 overflow-y-auto">
            <div className="p-4 space-y-2">
              {items.map((item) => (
                <MobileNavItem
                  key={item.id}
                  item={item}
                  isActive={activeItem === item.id}
                  isExpanded={expandedItems.has(item.id)}
                  onClick={() => handleItemClick(item)}
                  onToggleExpanded={() => toggleExpanded(item.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * MobileNavItem component - Individual mobile navigation item
 * Handles nested navigation items and expandable menus
 * 
 * @param item - Navigation item data
 * @param isActive - Whether the item is currently active
 * @param isExpanded - Whether the item is expanded (for nested items)
 * @param onClick - Callback when item is clicked
 * @param onToggleExpanded - Callback when expand/collapse is toggled
 * @returns JSX.Element - Mobile navigation item
 */
interface MobileNavItemProps {
  item: NavItem
  isActive?: boolean
  isExpanded?: boolean
  onClick?: () => void
  onToggleExpanded?: () => void
}

function MobileNavItem({ 
  item, 
  isActive, 
  isExpanded, 
  onClick, 
  onToggleExpanded 
}: MobileNavItemProps) {
  const hasChildren = item.children && item.children.length > 0

  return (
    <div className="space-y-1">
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          'w-full justify-start h-12 px-4',
          isActive && 'bg-primary/10 text-primary border-l-4 border-primary'
        )}
        onClick={hasChildren ? onToggleExpanded : onClick}
        aria-expanded={isExpanded}
        aria-haspopup={hasChildren}
      >
        <div className="flex items-center flex-1">
          <span className="mr-3">{item.icon}</span>
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <span className="mr-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          )}
        </div>
      </Button>

      {/* Nested Items */}
      {hasChildren && isExpanded && (
        <div className="ml-4 space-y-1">
          {item.children?.map((child) => (
            <Button
              key={child.id}
              variant={activeItem === child.id ? "secondary" : "ghost"}
              className={cn(
                'w-full justify-start h-10 px-4',
                activeItem === child.id && 'bg-primary/10 text-primary border-l-2 border-primary'
              )}
              onClick={() => onItemClick?.(child)}
            >
              <div className="flex items-center flex-1">
                <span className="mr-3">{child.icon}</span>
                <span className="flex-1 text-left">{child.label}</span>
                {child.badge && (
                  <span className="mr-2 px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                    {child.badge}
                  </span>
                )}
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * MobileTabBar component - Bottom tab bar for mobile
 * Provides quick access to main navigation items
 * 
 * @param className - Additional CSS classes for styling
 * @param items - Tab items array
 * @param activeItem - Currently active tab
 * @param onItemClick - Callback when tab is clicked
 * @returns JSX.Element - Mobile bottom tab bar
 * 
 * @example
 * <MobileTabBar 
 *   items={tabItems} 
 *   activeItem="home" 
 *   onItemClick={handleTabClick} 
 * />
 */
interface MobileTabBarProps {
  className?: string
  items: NavItem[]
  activeItem?: string
  onItemClick?: (item: NavItem) => void
}

export function MobileTabBar({ 
  className, 
  items, 
  activeItem, 
  onItemClick 
}: MobileTabBarProps) {
  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 bg-background border-t md:hidden',
      className
    )}>
      <div className="grid grid-cols-5 gap-1 p-2">
        {items.slice(0, 5).map((item) => (
          <Button
            key={item.id}
            variant={activeItem === item.id ? "default" : "ghost"}
            className="flex-col h-16 p-2"
            onClick={() => onItemClick?.(item)}
            aria-label={item.label}
            aria-current={activeItem === item.id ? 'page' : undefined}
          >
            <div className="flex flex-col items-center space-y-1">
              <span className={cn(
                'h-5 w-5',
                activeItem === item.id ? 'text-primary-foreground' : 'text-muted-foreground'
              )}>
                {item.icon}
              </span>
              <span className={cn(
                'text-xs',
                activeItem === item.id ? 'text-primary-foreground' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
              {item.badge && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
              )}
            </div>
          </Button>
        ))}
      </div>
    </div>
  )
}

/**
 * MobileBreadcrumb component - Mobile-optimized breadcrumb navigation
 * Provides hierarchical navigation with mobile-friendly layout
 * 
 * @param className - Additional CSS classes for styling
 * @param items - Breadcrumb items array
 * @returns JSX.Element - Mobile breadcrumb navigation
 * 
 * @example
 * <MobileBreadcrumb 
 *   items={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Policies', href: '/policies' },
 *     { label: 'Create Policy' }
 *   ]} 
 * />
 */
interface BreadcrumbItem {
  label: string
  href?: string
}

interface MobileBreadcrumbProps {
  className?: string
  items: BreadcrumbItem[]
}

export function MobileBreadcrumb({ className, items }: MobileBreadcrumbProps) {
  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)} aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground flex-shrink-0" />
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

export default MobileNavigation
