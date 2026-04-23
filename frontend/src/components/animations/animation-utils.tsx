'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

/**
 * useAnimation hook - Custom hook for managing animations
 * Provides animation state control and utilities
 * 
 * @param trigger - Animation trigger condition
 * @param duration - Animation duration in milliseconds
 * @param delay - Animation delay in milliseconds
 * @returns Animation state and controls
 * 
 * @example
 * const { isAnimating, startAnimation, stopAnimation } = useAnimation(true, 500)
 */
interface UseAnimationProps {
  trigger?: boolean
  duration?: number
  delay?: number
}

export function useAnimation({ 
  trigger = true, 
  duration = 300, 
  delay = 0 
}: UseAnimationProps = {}) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startAnimation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setIsAnimating(true)
    
    timeoutRef.current = setTimeout(() => {
      setIsAnimating(false)
      setHasAnimated(true)
    }, duration + delay)
  }, [duration, delay])

  const stopAnimation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsAnimating(false)
  }, [])

  useEffect(() => {
    if (trigger && !hasAnimated) {
      startAnimation()
    }
  }, [trigger, hasAnimated, startAnimation])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    isAnimating,
    hasAnimated,
    startAnimation,
    stopAnimation
  }
}

/**
 * useIntersectionAnimation hook - Animation on scroll intersection
 * Triggers animations when elements come into view
 * 
 * @param options - Intersection observer options
 * @returns Animation state and ref
 * 
 * @example
 * const { isIntersecting, ref } = useIntersectionAnimation({ threshold: 0.1 })
 */
interface UseIntersectionAnimationOptions {
  threshold?: number | number[]
  rootMargin?: string
  triggerOnce?: boolean
}

export function useIntersectionAnimation({
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true
}: UseIntersectionAnimationOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting
        
        setIsIntersecting(isVisible)
        
        if (isVisible && !hasIntersected) {
          setHasIntersected(true)
        }
        
        if (triggerOnce && isVisible) {
          observer.unobserve(element)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce, hasIntersected])

  return {
    isIntersecting: triggerOnce ? hasIntersected : isIntersecting,
    hasIntersected,
    ref
  }
}

/**
 * useSpringAnimation hook - Spring physics animations
 * Provides spring-based animations with customizable physics
 * 
 * @param config - Spring animation configuration
 * @returns Animation value and controls
 * 
 * @example
 * const { value, animateTo } = useSpringAnimation({ tension: 300, friction: 10 })
 */
interface SpringConfig {
  tension?: number
  friction?: number
  mass?: number
}

export function useSpringAnimation(config: SpringConfig = {}) {
  const {
    tension = 170,
    friction = 26,
    mass = 1
  } = config

  const [value, setValue] = useState(0)
  const [targetValue, setTargetValue] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  const animateTo = useCallback((newTarget: number) => {
    setTargetValue(newTarget)
  }, [])

  useEffect(() => {
    const animate = (currentTime: number) => {
      if (lastTimeRef.current === undefined) {
        lastTimeRef.current = currentTime
      }

      const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1)
      lastTimeRef.current = currentTime

      const displacement = targetValue - value
      const springForce = tension * displacement
      const dampingForce = friction * velocity
      const acceleration = (springForce - dampingForce) / mass

      const newVelocity = velocity + acceleration * deltaTime
      const newValue = value + newVelocity * deltaTime

      setValue(newValue)
      setVelocity(newVelocity)

      // Continue animation if not at rest
      if (Math.abs(newVelocity) > 0.01 || Math.abs(displacement) > 0.01) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setValue(targetValue)
        setVelocity(0)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, targetValue, velocity, tension, friction, mass])

  return {
    value,
    animateTo
  }
}

/**
 * AnimatedNumber component - Animated number counter
 * Provides smooth number animation with easing
 * 
 * @param value - Target number value
 * @param duration - Animation duration in milliseconds
 * @param delay - Animation delay in milliseconds
 * @param prefix - Text prefix
 * @param suffix - Text suffix
 * @param decimals - Number of decimal places
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Animated number
 * 
 * @example
 * <AnimatedNumber value={1000} duration={2000} prefix="$" decimals={2} />
 */
interface AnimatedNumberProps {
  value: number
  duration?: number
  delay?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function AnimatedNumber({
  value,
  duration = 1000,
  delay = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  className
}: AnimatedNumberProps) {
  const [currentValue, setCurrentValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true)
      const startTime = Date.now()
      const startValue = currentValue

      const animate = () => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / duration, 1)
        
        // Easing function (ease-out-cubic)
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        const newValue = startValue + (value - startValue) * easeOutCubic
        
        setCurrentValue(newValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
        }
      }

      requestAnimationFrame(animate)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, duration, delay, currentValue])

  const displayValue = currentValue.toFixed(decimals)

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}

/**
 * AnimatedProgress component - Animated progress bar
 * Provides smooth progress animation with customizable styling
 * 
 * @param value - Progress value (0-100)
 * @param duration - Animation duration in milliseconds
 * @param delay - Animation delay in milliseconds
 * @param showLabel - Whether to show percentage label
 * @param color - Progress bar color
 * @param size - Progress bar size
 * @param className - Additional CSS classes for styling
 * @returns JSX.Element - Animated progress bar
 * 
 * @example
 * <AnimatedProgress value={75} duration={1500} showLabel color="primary" />
 */
interface AnimatedProgressProps {
  value: number
  duration?: number
  delay?: number
  showLabel?: boolean
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AnimatedProgress({
  value,
  duration = 1000,
  delay = 0,
  showLabel = false,
  color = 'primary',
  size = 'md',
  className
}: AnimatedProgressProps) {
  const [currentValue, setCurrentValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const startTime = Date.now()
      const startValue = currentValue

      const animate = () => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / duration, 1)
        
        // Easing function (ease-out-quart)
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)
        const newValue = startValue + (value - startValue) * easeOutQuart
        
        setCurrentValue(newValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, duration, delay, currentValue])

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6'
  }

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    destructive: 'bg-destructive'
  }

  return (
    <div className={cn('w-full bg-muted rounded-full overflow-hidden', sizeClasses[size], className)}>
      <div
        className={cn(
          'h-full transition-all ease-out',
          colorClasses[color]
        )}
        style={{ 
          width: `${Math.min(100, Math.max(0, currentValue))}%`,
          transitionDuration: `${duration}ms`,
          transitionDelay: `${delay}ms`
        }}
      >
        {showLabel && (
          <span className="flex items-center justify-center h-full text-xs text-white font-medium">
            {Math.round(currentValue)}%
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * AnimationController component - Controls multiple animations
 * Provides centralized animation management
 * 
 * @param children - Child components
 * @param animations - Animation configurations
 * @param trigger - Global animation trigger
 * @returns JSX.Element - Animation controller
 * 
 * @example
 * <AnimationController 
 *   animations={[
 *     { name: 'fadeIn', duration: 500, delay: 0 },
 *     { name: 'slideUp', duration: 600, delay: 200 }
 *   ]}
 *   trigger={shouldAnimate}
 * >
 *   <AnimatedContent />
 * </AnimationController>
 */
interface AnimationConfig {
  name: string
  duration: number
  delay: number
  onComplete?: () => void
}

interface AnimationControllerProps {
  children: React.ReactNode
  animations: AnimationConfig[]
  trigger?: boolean
}

export function AnimationController({
  children,
  animations,
  trigger = true
}: AnimationControllerProps) {
  const [activeAnimations, setActiveAnimations] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!trigger) {
      setActiveAnimations(new Set())
      return
    }

    const newActiveAnimations = new Set<string>()
    
    animations.forEach((animation) => {
      const timer = setTimeout(() => {
        setActiveAnimations(prev => new Set([...prev, animation.name]))
        
        const completeTimer = setTimeout(() => {
          setActiveAnimations(prev => {
            const next = new Set(prev)
            next.delete(animation.name)
            return next
          })
          animation.onComplete?.()
        }, animation.duration)

        return () => clearTimeout(completeTimer)
      }, animation.delay)

      return () => clearTimeout(timer)
    })
  }, [trigger, animations])

  return (
    <div data-animations={Array.from(activeAnimations).join(',')}>
      {children}
    </div>
  )
}

export default useAnimation
