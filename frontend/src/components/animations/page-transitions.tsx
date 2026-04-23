'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

/**
 * PageTransition component - Smooth page transition animations
 * Provides animated transitions between pages or routes
 * 
 * @param children - Page content
 * @param className - Additional CSS classes for styling
 * @param type - Transition type: 'fade' | 'slide' | 'scale' | 'flip'
 * @param direction - Transition direction: 'up' | 'down' | 'left' | 'right'
 * @param duration - Animation duration in milliseconds
 * @returns JSX.Element - Page transition wrapper
 * 
 * @example
 * <PageTransition type="slide" direction="left" duration={500}>
 *   <PageContent />
 * </PageTransition>
 */
export interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  type?: 'fade' | 'slide' | 'scale' | 'flip'
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
}

export function PageTransition({ 
  children, 
  className, 
  type = 'fade', 
  direction = 'right', 
  duration = 500 
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => {
      setIsExiting(true)
    }
  }, [])

  const getTransitionClasses = () => {
    const baseClasses = 'transition-all ease-in-out'
    
    if (isExiting) {
      switch (type) {
        case 'fade':
          return cn(baseClasses, 'opacity-0')
        case 'slide':
          const exitSlides = {
            up: 'translate-y-full',
            down: '-translate-y-full',
            left: 'translate-x-full',
            right: '-translate-x-full'
          }
          return cn(baseClasses, exitSlides[direction])
        case 'scale':
          return cn(baseClasses, 'scale-95 opacity-0')
        case 'flip':
          return cn(baseClasses, 'rotate-180 opacity-0')
        default:
          return cn(baseClasses, 'opacity-0')
      }
    }

    switch (type) {
      case 'fade':
        return isVisible ? cn(baseClasses, 'opacity-100') : cn(baseClasses, 'opacity-0')
      case 'slide':
        const entrySlides = {
          up: '-translate-y-full',
          down: 'translate-y-full',
          left: '-translate-x-full',
          right: 'translate-x-full'
        }
        return isVisible 
          ? cn(baseClasses, 'translate-x-0 translate-y-0')
          : cn(baseClasses, entrySlides[direction])
      case 'scale':
        return isVisible 
          ? cn(baseClasses, 'scale-100 opacity-100')
          : cn(baseClasses, 'scale-95 opacity-0')
      case 'flip':
        return isVisible 
          ? cn(baseClasses, 'rotate-0 opacity-100')
          : cn(baseClasses, '-rotate-180 opacity-0')
      default:
        return isVisible ? cn(baseClasses, 'opacity-100') : cn(baseClasses, 'opacity-0')
    }
  }

  return (
    <div
      className={cn(getTransitionClasses(), className)}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

/**
 * RouteTransition component - Route-specific transitions
 * Provides different animations based on route changes
 * 
 * @param children - Route content
 * @param className - Additional CSS classes for styling
 * @param routeName - Current route name for specific animations
 * @param duration - Animation duration in milliseconds
 * @returns JSX.Element - Route transition wrapper
 * 
 * @example
 * <RouteTransition routeName="dashboard" duration={600}>
 *   <DashboardPage />
 * </RouteTransition>
 */
interface RouteTransitionProps {
  children: React.ReactNode
  className?: string
  routeName?: string
  duration?: number
}

export function RouteTransition({ 
  children, 
  className, 
  routeName = 'default', 
  duration = 600 
}: RouteTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [routeName])

  const getRouteAnimation = () => {
    const animations: Record<string, { enter: string; exit: string }> = {
      dashboard: {
        enter: 'scale-100 opacity-100 translate-x-0',
        exit: 'scale-95 opacity-0 -translate-x-4'
      },
      profile: {
        enter: 'scale-100 opacity-100 translate-y-0',
        exit: 'scale-95 opacity-0 -translate-y-4'
      },
      settings: {
        enter: 'rotate-0 opacity-100 scale-100',
        exit: 'rotate-12 opacity-0 scale-95'
      },
      login: {
        enter: 'translate-y-0 opacity-100',
        exit: '-translate-y-8 opacity-0'
      },
      default: {
        enter: 'opacity-100 translate-x-0',
        exit: 'opacity-0 translate-x-4'
      }
    }

    const animation = animations[routeName] || animations.default
    return isVisible ? animation.enter : animation.exit
  }

  return (
    <div
      className={cn(
        'transition-all ease-out',
        getRouteAnimation(),
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

/**
 * TabTransition component - Tab content transitions
 * Provides smooth animations when switching between tabs
 * 
 * @param children - Tab content
 * @param isActive - Whether this tab is active
 * @param className - Additional CSS classes for styling
 * @param direction - Animation direction: 'horizontal' | 'vertical' | 'fade'
 * @param duration - Animation duration in milliseconds
 * @returns JSX.Element - Tab transition wrapper
 * 
 * @example
 * <TabTransition isActive={activeTab === 'profile'} direction="horizontal">
 *   <ProfileContent />
 * </TabTransition>
 */
interface TabTransitionProps {
  children: React.ReactNode
  isActive: boolean
  className?: string
  direction?: 'horizontal' | 'vertical' | 'fade'
  duration?: number
}

export function TabTransition({ 
  children, 
  isActive, 
  className, 
  direction = 'horizontal', 
  duration = 300 
}: TabTransitionProps) {
  const getTransitionClasses = () => {
    const baseClasses = 'transition-all ease-in-out'
    
    if (isActive) {
      switch (direction) {
        case 'horizontal':
          return cn(baseClasses, 'opacity-100 translate-x-0')
        case 'vertical':
          return cn(baseClasses, 'opacity-100 translate-y-0')
        case 'fade':
          return cn(baseClasses, 'opacity-100')
        default:
          return cn(baseClasses, 'opacity-100 translate-x-0')
      }
    }

    switch (direction) {
      case 'horizontal':
        return cn(baseClasses, 'opacity-0 -translate-x-4')
      case 'vertical':
        return cn(baseClasses, 'opacity-0 -translate-y-4')
      case 'fade':
        return cn(baseClasses, 'opacity-0')
      default:
        return cn(baseClasses, 'opacity-0 -translate-x-4')
    }
  }

  return (
    <div
      className={cn(getTransitionClasses(), className)}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {isActive && children}
    </div>
  )
}

/**
 * ModalTransition component - Modal open/close animations
 * Provides smooth animations for modal appearance
 * 
 * @param children - Modal content
 * @param isOpen - Whether modal is open
 * @param className - Additional CSS classes for styling
 * @param type - Animation type: 'fade' | 'slide' | 'scale' | 'bounce'
 * @param duration - Animation duration in milliseconds
 * @returns JSX.Element - Modal transition wrapper
 * 
 * @example
 * <ModalTransition isOpen={isModalOpen} type="scale" duration={400}>
 *   <ModalContent />
 * </ModalTransition>
 */
interface ModalTransitionProps {
  children: React.ReactNode
  isOpen: boolean
  className?: string
  type?: 'fade' | 'slide' | 'scale' | 'bounce'
  duration?: number
}

export function ModalTransition({ 
  children, 
  isOpen, 
  className, 
  type = 'scale', 
  duration = 400 
}: ModalTransitionProps) {
  const getTransitionClasses = () => {
    const baseClasses = 'transition-all ease-out'
    
    if (isOpen) {
      switch (type) {
        case 'fade':
          return cn(baseClasses, 'opacity-100')
        case 'slide':
          return cn(baseClasses, 'opacity-100 translate-y-0')
        case 'scale':
          return cn(baseClasses, 'opacity-100 scale-100')
        case 'bounce':
          return cn(baseClasses, 'opacity-100 scale-100')
        default:
          return cn(baseClasses, 'opacity-100 scale-100')
      }
    }

    switch (type) {
      case 'fade':
        return cn(baseClasses, 'opacity-0')
      case 'slide':
        return cn(baseClasses, 'opacity-0 -translate-y-8')
      case 'scale':
        return cn(baseClasses, 'opacity-0 scale-95')
      case 'bounce':
        return cn(baseClasses, 'opacity-0 scale-0')
      default:
        return cn(baseClasses, 'opacity-0 scale-95')
    }
  }

  const getTransitionTiming = () => {
    return type === 'bounce' ? 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'ease-out'
  }

  return (
    <div
      className={cn(getTransitionClasses(), className)}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: getTransitionTiming()
      }}
    >
      {isOpen && children}
    </div>
  )
}

/**
 * ListTransition component - Animated list item transitions
 * Provides smooth animations for list items appearing/disappearing
 * 
 * @param children - List items
 * @param className - Additional CSS classes for styling
 * @param staggerDelay - Delay between items in milliseconds
 * @param direction - Animation direction: 'up' | 'down' | 'left' | 'right'
 * @param duration - Animation duration in milliseconds
 * @returns JSX.Element - List transition wrapper
 * 
 * @example
 * <ListTransition staggerDelay={50} direction="up">
 *   {items.map((item, index) => (
 *     <ListItem key={index} item={item} />
 *   ))}
 * </ListTransition>
 */
interface ListTransitionProps {
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
}

export function ListTransition({ 
  children, 
  className, 
  staggerDelay = 50, 
  direction = 'up', 
  duration = 400 
}: ListTransitionProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const getDirectionClasses = () => {
    const directions = {
      up: 'translate-y-4',
      down: '-translate-y-4',
      left: 'translate-x-4',
      right: '-translate-x-4'
    }
    return directions[direction]
  }

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className={cn(
            'transition-all ease-out',
            isVisible 
              ? 'opacity-100 translate-x-0 translate-y-0' 
              : `opacity-0 ${getDirectionClasses()}`
          )}
          style={{ 
            transitionDuration: `${duration}ms`,
            transitionDelay: `${index * staggerDelay}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}

export default PageTransition
