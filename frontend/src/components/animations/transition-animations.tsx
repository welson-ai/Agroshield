'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

/**
 * FadeIn component - Fade in animation on mount
 * Provides smooth fade-in effect for component appearance
 * 
 * @param children - Child components
 * @param className - Additional CSS classes for styling
 * @param duration - Animation duration in milliseconds
 * @param delay - Animation delay in milliseconds
 * @param direction - Fade direction: 'up' | 'down' | 'left' | 'right' | 'none'
 * @returns JSX.Element - Fade in wrapper
 * 
 * @example
 * <FadeIn duration={500} delay={100} direction="up">
 *   <div>Fading content</div>
 * </FadeIn>
 */
export interface FadeInProps {
  children: React.ReactNode
  className?: string
  duration?: number
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export function FadeIn({ 
  children, 
  className, 
  duration = 500, 
  delay = 0, 
  direction = 'none' 
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const directionClasses = {
    up: 'translate-y-4',
    down: '-translate-y-4',
    left: 'translate-x-4',
    right: '-translate-x-4',
    none: ''
  }

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${directionClasses[direction]}`,
        className
      )}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

/**
 * SlideIn component - Slide in animation on mount
 * Provides smooth slide-in effect for component appearance
 * 
 * @param children - Child components
 * @param className - Additional CSS classes for styling
 * @param duration - Animation duration in milliseconds
 * @param delay - Animation delay in milliseconds
 * @param direction - Slide direction: 'up' | 'down' | 'left' | 'right'
 * @returns JSX.Element - Slide in wrapper
 * 
 * @example
 * <SlideIn direction="left" duration={600} delay={200}>
 *   <div>Sliding content</div>
 * </SlideIn>
 */
export interface SlideInProps {
  children: React.ReactNode
  className?: string
  duration?: number
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function SlideIn({ 
  children, 
  className, 
  duration = 600, 
  delay = 0, 
  direction = 'right' 
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const initialPositions = {
    up: 'translate-y-full',
    down: '-translate-y-full',
    left: 'translate-x-full',
    right: '-translate-x-full'
  }

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'translate-x-0 translate-y-0' : initialPositions[direction],
        className
      )}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

/**
 * ScaleIn component - Scale in animation on mount
 * Provides smooth scale-in effect for component appearance
 * 
 * @param children - Child components
 * @param className - Additional CSS classes for styling
 * @param duration - Animation duration in milliseconds
 * @param delay - Animation delay in milliseconds
 * @param initialScale - Initial scale factor: 'sm' | 'md' | 'lg'
 * @returns JSX.Element - Scale in wrapper
 * 
 * @example
 * <ScaleIn initialScale="md" duration={400} delay={100}>
 *   <div>Scaling content</div>
 * </ScaleIn>
 */
export interface ScaleInProps {
  children: React.ReactNode
  className?: string
  duration?: number
  delay?: number
  initialScale?: 'sm' | 'md' | 'lg'
}

export function ScaleIn({ 
  children, 
  className, 
  duration = 400, 
  delay = 0, 
  initialScale = 'md' 
}: ScaleInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const scaleClasses = {
    sm: 'scale-95',
    md: 'scale-75',
    lg: 'scale-50'
  }

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'scale-100 opacity-100' : `${scaleClasses[initialScale]} opacity-0`,
        className
      )}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

/**
 * RotateIn component - Rotate in animation on mount
 * Provides smooth rotate-in effect for component appearance
 * 
 * @param children - Child components
 * @param className - Additional CSS classes for styling
 * @param duration - Animation duration in milliseconds
 * @param delay - Animation delay in milliseconds
 * @param direction - Rotation direction: 'clockwise' | 'counterclockwise'
 * @param angle - Rotation angle: 'sm' | 'md' | 'lg'
 * @returns JSX.Element - Rotate in wrapper
 * 
 * @example
 * <RotateIn direction="clockwise" angle="md" duration={500}>
 *   <div>Rotating content</div>
 * </RotateIn>
 */
export interface RotateInProps {
  children: React.ReactNode
  className?: string
  duration?: number
  delay?: number
  direction?: 'clockwise' | 'counterclockwise'
  angle?: 'sm' | 'md' | 'lg'
}

export function RotateIn({ 
  children, 
  className, 
  duration = 500, 
  delay = 0, 
  direction = 'clockwise', 
  angle = 'md' 
}: RotateInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const angleClasses = {
    sm: direction === 'clockwise' ? 'rotate-12' : '-rotate-12',
    md: direction === 'clockwise' ? 'rotate-45' : '-rotate-45',
    lg: direction === 'clockwise' ? 'rotate-90' : '-rotate-90'
  }

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'rotate-0 opacity-100' : `${angleClasses[angle]} opacity-0`,
        className
      )}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}

/**
 * BounceIn component - Bounce in animation on mount
 * Provides bouncy entrance effect for component appearance
 * 
 * @param children - Child components
 * @param className - Additional CSS classes for styling
 * @param duration - Animation duration in milliseconds
 * @param delay - Animation delay in milliseconds
 * @returns JSX.Element - Bounce in wrapper
 * 
 * @example
 * <BounceIn duration={800} delay={200}>
 *   <div>Bouncing content</div>
 * </BounceIn>
 */
export interface BounceInProps {
  children: React.ReactNode
  className?: string
  duration?: number
  delay?: number
}

export function BounceIn({ 
  children, 
  className, 
  duration = 800, 
  delay = 0 
}: BounceInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible 
          ? 'scale-100 opacity-100' 
          : 'scale-0 opacity-0',
        className
      )}
      style={{ 
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      }}
    >
      {children}
    </div>
  )
}

/**
 * StaggeredAnimation component - Staggered animations for multiple items
 * Provides sequential animation for list items or grid items
 * 
 * @param children - Child components (should be an array)
 * @param className - Additional CSS classes for styling
 * @param staggerDelay - Delay between each item in milliseconds
 * @param animationType - Animation type: 'fadeIn' | 'slideIn' | 'scaleIn'
 * @param direction - Animation direction (for slideIn)
 * @returns JSX.Element - Staggered animation wrapper
 * 
 * @example
 * <StaggeredAnimation staggerDelay={100} animationType="fadeIn">
 *   {items.map((item, index) => (
 *     <div key={index}>{item}</div>
 *   ))}
 * </StaggeredAnimation>
 */
export interface StaggeredAnimationProps {
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number
  animationType?: 'fadeIn' | 'slideIn' | 'scaleIn'
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function StaggeredAnimation({ 
  children, 
  className, 
  staggerDelay = 100, 
  animationType = 'fadeIn', 
  direction = 'up' 
}: StaggeredAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  const getAnimatedChild = (child: React.ReactNode, index: number) => {
    const delay = index * staggerDelay

    switch (animationType) {
      case 'fadeIn':
        return (
          <FadeIn key={index} delay={delay} direction={direction}>
            {child}
          </FadeIn>
        )
      case 'slideIn':
        return (
          <SlideIn key={index} delay={delay} direction={direction}>
            {child}
          </SlideIn>
        )
      case 'scaleIn':
        return (
          <ScaleIn key={index} delay={delay}>
            {child}
          </ScaleIn>
        )
      default:
        return child
    }
  }

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => 
        getAnimatedChild(child, index)
      )}
    </div>
  )
}

/**
 * AnimatedCounter component - Animated number counting
 * Provides smooth number counting animation
 * 
 * @param value - Target value
 * @param duration - Animation duration in milliseconds
 * @param delay - Animation delay in milliseconds
 * @param className - Additional CSS classes for styling
 * @param prefix - Text prefix
 * @param suffix - Text suffix
 * @returns JSX.Element - Animated counter
 * 
 * @example
 * <AnimatedCounter value={1000} duration={2000} prefix="$" suffix=".00">
 *   0
 * </AnimatedCounter>
 */
interface AnimatedCounterProps {
  value: number
  duration?: number
  delay?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({ 
  value, 
  duration = 2000, 
  delay = 0, 
  className, 
  prefix = '', 
  suffix = '' 
}: AnimatedCounterProps) {
  const [currentValue, setCurrentValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!isVisible) return

    const startTime = Date.now()
    const endTime = startTime + duration

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const newValue = Math.floor(value * easeOutQuart)
      
      setCurrentValue(newValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, value, duration])

  return (
    <span className={className}>
      {prefix}{currentValue.toLocaleString()}{suffix}
    </span>
  )
}

export default FadeIn
