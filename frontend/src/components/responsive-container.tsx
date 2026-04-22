'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/**
 * ResponsiveContainer component - Responsive layout container
 * Provides responsive breakpoints and spacing for different screen sizes
 * 
 * @param children - Child components to wrap
 * @param className - Additional CSS classes for styling
 * @param size - Container size: 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param padding - Padding size: 'none' | 'sm' | 'md' | 'lg'
 * @returns JSX.Element - Responsive container with breakpoint handling
 * 
 * @example
 * <ResponsiveContainer size="lg" padding="md">
 *   <Content />
 * </ResponsiveContainer>
 */
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function ResponsiveContainer({ 
  children, 
  className, 
  size = 'lg', 
  padding = 'md' 
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full'
  }

  const paddingClasses = {
    none: '',
    sm: 'p-2 sm:p-4',
    md: 'p-4 sm:p-6 lg:p-8',
    lg: 'p-6 sm:p-8 lg:p-12'
  }

  return (
    <div 
      className={cn(
        'mx-auto w-full',
        sizeClasses[size],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * ResponsiveGrid component - Responsive grid layout
 * Provides responsive grid with customizable columns and gaps
 * 
 * @param children - Child components to arrange in grid
 * @param className - Additional CSS classes for styling
 * @param cols - Number of columns: 1-12 or responsive object
 * @param gap - Gap size: 'none' | 'sm' | 'md' | 'lg'
 * @returns JSX.Element - Responsive grid layout
 * 
 * @example
 * <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }} gap="md">
 *   <Card /><Card /><Card />
 * </ResponsiveGrid>
 */
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: number | { sm?: number; md?: number; lg?: number; xl?: number }
  gap?: 'none' | 'sm' | 'md' | 'lg'
}

export function ResponsiveGrid({ 
  children, 
  className, 
  cols = 1, 
  gap = 'md' 
}: ResponsiveGridProps) {
  const gapClasses = {
    none: '',
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  }

  let gridCols = ''

  if (typeof cols === 'number') {
    gridCols = `grid-cols-${cols}`
  } else {
    const { sm: smCols = 1, md: mdCols = 2, lg: lgCols = 3, xl: xlCols = 4 } = cols
    gridCols = `grid-cols-${smCols} md:grid-cols-${mdCols} lg:grid-cols-${lgCols} xl:grid-cols-${xlCols}`
  }

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
 * ResponsiveFlex component - Responsive flexbox layout
 * Provides responsive flexbox with customizable direction and alignment
 * 
 * @param children - Child components to arrange in flex
 * @param className - Additional CSS classes for styling
 * @param direction - Flex direction: 'row' | 'col' | 'responsive'
 * @param wrap - Whether to wrap items: 'wrap' | 'nowrap' | 'responsive'
 * @param justify - Justify content: 'start' | 'center' | 'end' | 'between' | 'around'
 * @param align - Align items: 'start' | 'center' | 'end' | 'stretch'
 * @returns JSX.Element - Responsive flexbox layout
 * 
 * @example
 * <ResponsiveFlex direction="responsive" justify="center" wrap="responsive">
 *   <Item /><Item /><Item />
 * </ResponsiveFlex>
 */
interface ResponsiveFlexProps {
  children: React.ReactNode
  className?: string
  direction?: 'row' | 'col' | 'responsive'
  wrap?: 'wrap' | 'nowrap' | 'responsive'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  align?: 'start' | 'center' | 'end' | 'stretch'
}

export function ResponsiveFlex({ 
  children, 
  className, 
  direction = 'row', 
  wrap = 'nowrap', 
  justify = 'start', 
  align = 'start' 
}: ResponsiveFlexProps) {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    responsive: 'flex-col sm:flex-row'
  }

  const wrapClasses = {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    responsive: 'flex-wrap sm:flex-nowrap'
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  return (
    <div 
      className={cn(
        'flex',
        directionClasses[direction],
        wrapClasses[wrap],
        justifyClasses[justify],
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * ResponsiveStack component - Responsive stack layout
 * Provides responsive vertical/horizontal stacking with spacing
 * 
 * @param children - Child components to stack
 * @param className - Additional CSS classes for styling
 * @param direction - Stack direction: 'vertical' | 'horizontal' | 'responsive'
 * @param spacing - Spacing between items: 'none' | 'sm' | 'md' | 'lg'
 * @returns JSX.Element - Responsive stack layout
 * 
 * @example
 * <ResponsiveStack direction="responsive" spacing="md">
 *   <Item /><Item /><Item />
 * </ResponsiveStack>
 */
interface ResponsiveStackProps {
  children: React.ReactNode
  className?: string
  direction?: 'vertical' | 'horizontal' | 'responsive'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

export function ResponsiveStack({ 
  children, 
  className, 
  direction = 'vertical', 
  spacing = 'md' 
}: ResponsiveStackProps) {
  const directionClasses = {
    vertical: 'flex-col',
    horizontal: 'flex-row',
    responsive: 'flex-col sm:flex-row'
  }

  const spacingClasses = {
    none: '',
    sm: 'space-y-2 sm:space-y-0 sm:space-x-2',
    md: 'space-y-4 sm:space-y-0 sm:space-x-4',
    lg: 'space-y-6 sm:space-y-0 sm:space-x-6'
  }

  return (
    <div 
      className={cn(
        'flex',
        directionClasses[direction],
        spacingClasses[spacing],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * ResponsiveHidden component - Conditionally hide/show elements by breakpoint
 * Provides responsive visibility control
 * 
 * @param children - Child components to conditionally render
 * @param className - Additional CSS classes for styling
 * @param below - Hide below this breakpoint: 'sm' | 'md' | 'lg' | 'xl'
 * @param above - Hide above this breakpoint: 'sm' | 'md' | 'lg' | 'xl'
 * @param only - Show only at this breakpoint: 'sm' | 'md' | 'lg' | 'xl'
 * @returns JSX.Element - Conditionally rendered responsive element
 * 
 * @example
 * <ResponsiveHidden below="md">
 *   <DesktopOnlyComponent />
 * </ResponsiveHidden>
 * 
 * <ResponsiveHidden above="sm">
 *   <MobileOnlyComponent />
 * </ResponsiveHidden>
 */
interface ResponsiveHiddenProps {
  children: React.ReactNode
  className?: string
  below?: 'sm' | 'md' | 'lg' | 'xl'
  above?: 'sm' | 'md' | 'lg' | 'xl'
  only?: 'sm' | 'md' | 'lg' | 'xl'
}

export function ResponsiveHidden({ 
  children, 
  className, 
  below, 
  above, 
  only 
}: ResponsiveHiddenProps) {
  let responsiveClasses = ''

  if (only) {
    responsiveClasses = {
      sm: 'block sm:hidden',
      md: 'hidden sm:block md:hidden',
      lg: 'hidden md:block lg:hidden',
      xl: 'hidden lg:block xl:hidden'
    }[only]
  } else {
    if (below) {
      responsiveClasses += ` ${{
        sm: 'hidden sm:block',
        md: 'hidden md:block',
        lg: 'hidden lg:block',
        xl: 'hidden xl:block'
      }[below]}`
    }

    if (above) {
      responsiveClasses += ` ${{
        sm: 'block sm:hidden',
        md: 'block md:hidden',
        lg: 'block lg:hidden',
        xl: 'block xl:hidden'
      }[above]}`
    }
  }

  return (
    <div 
      className={cn(
        responsiveClasses || 'block',
        className
      )}
    >
      {children}
    </div>
  )
}

export default ResponsiveContainer
