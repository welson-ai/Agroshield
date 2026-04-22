'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * ResponsiveCard component - Mobile-optimized card component
 * Provides responsive card layouts with mobile-first design
 * 
 * @param children - Child components
 * @param className - Additional CSS classes for styling
 * @param size - Card size: 'sm' | 'md' | 'lg' | 'responsive'
 * @param variant - Card variant: 'default' | 'elevated' | 'outlined' | 'minimal'
 * @param padding - Padding size: 'none' | 'sm' | 'md' | 'lg' | 'responsive'
 * @returns JSX.Element - Responsive card component
 * 
 * @example
 * <ResponsiveCard size="responsive" variant="elevated" padding="responsive">
 *   <CardHeader><CardTitle>Title</CardTitle></CardHeader>
 *   <CardContent>Content</CardContent>
 * </ResponsiveCard>
 */
interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'responsive'
  variant?: 'default' | 'elevated' | 'outlined' | 'minimal'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'responsive'
}

export function ResponsiveCard({ 
  children, 
  className, 
  size = 'responsive', 
  variant = 'default', 
  padding = 'responsive' 
}: ResponsiveCardProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    responsive: 'w-full max-w-full sm:max-w-md lg:max-w-lg'
  }

  const variantClasses = {
    default: 'bg-card text-card-foreground ring-1 ring-foreground/10',
    elevated: 'bg-card text-card-foreground shadow-lg border-0',
    outlined: 'bg-card text-card-foreground border-2 border-border',
    minimal: 'bg-transparent text-foreground border-0 shadow-none'
  }

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    responsive: 'p-3 sm:p-4 lg:p-6'
  }

  return (
    <Card 
      className={cn(
        'w-full',
        sizeClasses[size],
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </Card>
  )
}

/**
 * ResponsiveCardGrid component - Responsive grid of cards
 * Provides mobile-optimized card grid layouts
 * 
 * @param children - Card components to display in grid
 * @param className - Additional CSS classes for styling
 * @param cols - Grid columns configuration
 * @param gap - Gap between cards: 'sm' | 'md' | 'lg' | 'responsive'
 * @returns JSX.Element - Responsive card grid
 * 
 * @example
 * <ResponsiveCardGrid cols={{ sm: 1, md: 2, lg: 3 }} gap="responsive">
 *   <ResponsiveCard><CardContent>Card 1</CardContent></ResponsiveCard>
 *   <ResponsiveCard><CardContent>Card 2</CardContent></ResponsiveCard>
 * </ResponsiveCardGrid>
 */
interface ResponsiveCardGridProps {
  children: React.ReactNode
  className?: string
  cols?: { sm?: number; md?: number; lg?: number; xl?: number }
  gap?: 'sm' | 'md' | 'lg' | 'responsive'
}

export function ResponsiveCardGrid({ 
  children, 
  className, 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 }, 
  gap = 'responsive' 
}: ResponsiveCardGridProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 lg:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8',
    responsive: 'gap-3 sm:gap-4 lg:gap-6'
  }

  const { sm = 1, md = 2, lg = 3, xl = 4 } = cols
  const gridCols = `grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg} xl:grid-cols-${xl}`

  return (
    <div 
      className={cn(
        'grid w-full',
        gridCols,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * MobileCardSwipe component - Swipeable card container for mobile
 * Provides touch-enabled card swiping functionality
 * 
 * @param children - Card components to make swipeable
 * @param className - Additional CSS classes for styling
 * @param onSwipeLeft - Callback when swiped left
 * @param onSwipeRight - Callback when swiped right
 * @param threshold - Swipe threshold in pixels (default: 50)
 * @returns JSX.Element - Swipeable card container
 * 
 * @example
 * <MobileCardSwipe onSwipeLeft={handleNext} onSwipeRight={handlePrev}>
 *   <ResponsiveCard>Swipeable content</ResponsiveCard>
 * </MobileCardSwipe>
 */
interface MobileCardSwipeProps {
  children: React.ReactNode
  className?: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export function MobileCardSwipe({ 
  children, 
  className, 
  onSwipeLeft, 
  onSwipeRight, 
  threshold = 50 
}: MobileCardSwipeProps) {
  const [touchStart, setTouchStart] = React.useState<number | null>(null)
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null)

  const minSwipeDistance = threshold

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }
  }

  return (
    <div
      className={cn('touch-pan-y', className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  )
}

/**
 * ResponsiveCardHeader component - Mobile-optimized card header
 * Provides responsive header with mobile-friendly typography
 * 
 * @param children - Header content
 * @param className - Additional CSS classes for styling
 * @param size - Header size: 'sm' | 'md' | 'lg' | 'responsive'
 * @returns JSX.Element - Responsive card header
 * 
 * @example
 * <ResponsiveCardHeader size="responsive">
 *   <CardTitle>Mobile Title</CardTitle>
 *   <CardDescription>Mobile description</CardDescription>
 * </ResponsiveCardHeader>
 */
interface ResponsiveCardHeaderProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'responsive'
}

export function ResponsiveCardHeader({ 
  children, 
  className, 
  size = 'responsive' 
}: ResponsiveCardHeaderProps) {
  const sizeClasses = {
    sm: 'space-y-1 pb-3',
    md: 'space-y-2 pb-4',
    lg: 'space-y-3 pb-6',
    responsive: 'space-y-1 sm:space-y-2 pb-3 sm:pb-4'
  }

  return (
    <CardHeader className={cn(sizeClasses[size], className)}>
      {children}
    </CardHeader>
  )
}

/**
 * ResponsiveCardTitle component - Mobile-optimized card title
 * Provides responsive typography for card titles
 * 
 * @param children - Title text
 * @param className - Additional CSS classes for styling
 * @param size - Title size: 'sm' | 'md' | 'lg' | 'responsive'
 * @returns JSX.Element - Responsive card title
 * 
 * @example
 * <ResponsiveCardTitle size="responsive">
 *   Mobile Optimized Title
 * </ResponsiveCardTitle>
 */
interface ResponsiveCardTitleProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'responsive'
}

export function ResponsiveCardTitle({ 
  children, 
  className, 
  size = 'responsive' 
}: ResponsiveCardTitleProps) {
  const sizeClasses = {
    sm: 'text-base font-semibold',
    md: 'text-lg font-semibold',
    lg: 'text-xl font-bold',
    responsive: 'text-base sm:text-lg font-semibold leading-tight'
  }

  return (
    <CardTitle className={cn(sizeClasses[size], className)}>
      {children}
    </CardTitle>
  )
}

/**
 * ResponsiveCardDescription component - Mobile-optimized card description
 * Provides responsive typography for card descriptions
 * 
 * @param children - Description text
 * @param className - Additional CSS classes for styling
 * @param size - Description size: 'sm' | 'md' | 'lg' | 'responsive'
 * @returns JSX.Element - Responsive card description
 * 
 * @example
 * <ResponsiveCardDescription size="responsive">
 *   Mobile optimized description text that adapts to screen size
 * </ResponsiveCardDescription>
 */
interface ResponsiveCardDescriptionProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'responsive'
}

export function ResponsiveCardDescription({ 
  children, 
  className, 
  size = 'responsive' 
}: ResponsiveCardDescriptionProps) {
  const sizeClasses = {
    sm: 'text-xs text-muted-foreground',
    md: 'text-sm text-muted-foreground',
    lg: 'text-base text-muted-foreground',
    responsive: 'text-xs sm:text-sm text-muted-foreground leading-relaxed'
  }

  return (
    <CardDescription className={cn(sizeClasses[size], className)}>
      {children}
    </CardDescription>
  )
}

/**
 * ResponsiveCardContent component - Mobile-optimized card content
 * Provides responsive content area with mobile-friendly spacing
 * 
 * @param children - Content components
 * @param className - Additional CSS classes for styling
 * @param size - Content size: 'sm' | 'md' | 'lg' | 'responsive'
 * @returns JSX.Element - Responsive card content
 * 
 * @example
 * <ResponsiveCardContent size="responsive">
 *   <p>Mobile optimized content</p>
 * </ResponsiveCardContent>
 */
interface ResponsiveCardContentProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'responsive'
}

export function ResponsiveCardContent({ 
  children, 
  className, 
  size = 'responsive' 
}: ResponsiveCardContentProps) {
  const sizeClasses = {
    sm: 'space-y-2',
    md: 'space-y-3',
    lg: 'space-y-4',
    responsive: 'space-y-2 sm:space-y-3'
  }

  return (
    <CardContent className={cn(sizeClasses[size], className)}>
      {children}
    </CardContent>
  )
}

export default ResponsiveCard
