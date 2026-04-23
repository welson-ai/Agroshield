'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

/**
 * HoverScale component - Scale animation on hover
 * Provides smooth scale transition for hover effects
 * 
 * @param children - Child components
 * @param className - Additional CSS classes for styling
 * @param scale - Scale factor: 'sm' | 'md' | 'lg' | 'xl'
 * @param duration - Animation duration in milliseconds
 * @returns JSX.Element - Hover scale wrapper
 * 
 * @example
 * <HoverScale scale="md" duration={200}>
 *   <Button>Hover me</Button>
 * </HoverScale>
 */
export interface HoverScaleProps {
  children: React.ReactNode
  className?: string
  scale?: 'sm' | 'md' | 'lg' | 'xl'
  duration?: number
}

export function HoverScale({ 
  children, 
  className, 
  scale = 'md', 
  duration = 200 
}: HoverScaleProps) {
  const scaleClasses = {
    sm: 'hover:scale-105',
    md: 'hover:scale-110',
    lg: 'hover:scale-115',
    xl: 'hover:scale-125'
  }

  return (
    <div 
      className={cn(
        'transition-transform duration-200 ease-out',
        scaleClasses[scale],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

/**
 * HoverGlow component - Glow effect on hover
 * Provides smooth glow animation for hover effects
 * 
 * @param children - Child components
 * @param className - Additional CSS classes for styling
 * @param glowColor - Glow color: 'primary' | 'secondary' | 'destructive' | 'success'
 * @param intensity - Glow intensity: 'sm' | 'md' | 'lg'
 * @returns JSX.Element - Hover glow wrapper
 * 
 * @example
 * <HoverGlow glowColor="primary" intensity="md">
 *   <Card>Glowing card</Card>
 * </HoverGlow>
 */
export interface HoverGlowProps {
  children: React.ReactNode
  className?: string
  glowColor?: 'primary' | 'secondary' | 'destructive' | 'success' | 'warning'
  intensity?: 'sm' | 'md' | 'lg'
}

export function HoverGlow({ 
  children, 
  className, 
  glowColor = 'primary', 
  intensity = 'md' 
}: HoverGlowProps) {
  const glowClasses = {
    primary: {
      sm: 'hover:shadow-primary/20 hover:shadow-lg',
      md: 'hover:shadow-primary/30 hover:shadow-xl',
      lg: 'hover:shadow-primary/40 hover:shadow-2xl'
    },
    secondary: {
      sm: 'hover:shadow-secondary/20 hover:shadow-lg',
      md: 'hover:shadow-secondary/30 hover:shadow-xl',
      lg: 'hover:shadow-secondary/40 hover:shadow-2xl'
    },
    destructive: {
      sm: 'hover:shadow-destructive/20 hover:shadow-lg',
      md: 'hover:shadow-destructive/30 hover:shadow-xl',
      lg: 'hover:shadow-destructive/40 hover:shadow-2xl'
    },
    success: {
      sm: 'hover:shadow-green-500/20 hover:shadow-lg',
      md: 'hover:shadow-green-500/30 hover:shadow-xl',
      lg: 'hover:shadow-green-500/40 hover:shadow-2xl'
    },
    warning: {
      sm: 'hover:shadow-yellow-500/20 hover:shadow-lg',
      md: 'hover:shadow-yellow-500/30 hover:shadow-xl',
      lg: 'hover:shadow-yellow-500/40 hover:shadow-2xl'
    }
  }

  return (
    <div 
      className={cn(
        'transition-all duration-300 ease-out',
        glowClasses[glowColor][intensity],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * HoverFloat component - Floating animation on hover
 * Provides smooth lift effect for hover interactions
 * 
 * @param children - Child components
 * @param className - Additional CSS classes for styling
 * @param distance - Float distance: 'sm' | 'md' | 'lg'
 * @param duration - Animation duration in milliseconds
 * @returns JSX.Element - Hover float wrapper
 * 
 * @example
 * <HoverFloat distance="md" duration={300}>
 *   <Card>Floating card</Card>
 * </HoverFloat>
 */
export interface HoverFloatProps {
  children: React.ReactNode
  className?: string
  distance?: 'sm' | 'md' | 'lg'
  duration?: number
}

export function HoverFloat({ 
  children, 
  className, 
  distance = 'md', 
  duration = 300 
}: HoverFloatProps) {
  const distanceClasses = {
    sm: 'hover:-translate-y-1',
    md: 'hover:-translate-y-2',
    lg: 'hover:-translate-y-4'
  }

  return (
    <div 
      className={cn(
        'transition-all duration-300 ease-out hover:shadow-xl',
        distanceClasses[distance],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

/**
 * HoverRotate component - Rotation animation on hover
 * Provides smooth rotation effect for hover interactions
 * 
 * @param children - Child components
 * @param className - Additional CSS classes for styling
 * @param angle - Rotation angle: 'sm' | 'md' | 'lg' | 'xl'
 * @param duration - Animation duration in milliseconds
 * @returns JSX.Element - Hover rotate wrapper
 * 
 * @example
 * <HoverRotate angle="md" duration={250}>
 *   <div>Rotating element</div>
 * </HoverRotate>
 */
export interface HoverRotateProps {
  children: React.ReactNode
  className?: string
  angle?: 'sm' | 'md' | 'lg' | 'xl'
  duration?: number
}

export function HoverRotate({ 
  children, 
  className, 
  angle = 'md', 
  duration = 250 
}: HoverRotateProps) {
  const angleClasses = {
    sm: 'hover:rotate-3',
    md: 'hover:rotate-6',
    lg: 'hover:rotate-12',
    xl: 'hover:rotate-45'
  }

  return (
    <div 
      className={cn(
        'transition-transform duration-300 ease-out',
        angleClasses[angle],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

/**
 * HoverShake component - Shake animation on hover
 * Provides shake effect for hover interactions
 * 
 * @param children - Child components
 * @param className - Additional CSS classes for styling
 * @param intensity - Shake intensity: 'sm' | 'md' | 'lg'
 * @returns JSX.Element - Hover shake wrapper
 * 
 * @example
 * <HoverShake intensity="md">
 *   <Button>Shake on hover</Button>
 * </HoverShake>
 */
export interface HoverShakeProps {
  children: React.ReactNode
  className?: string
  intensity?: 'sm' | 'md' | 'lg'
}

export function HoverShake({ 
  children, 
  className, 
  intensity = 'md' 
}: HoverShakeProps) {
  const shakeKeyframes = {
    sm: 'hover:animate-pulse',
    md: 'hover:animate-bounce',
    lg: 'hover:animate-spin'
  }

  return (
    <div 
      className={cn(
        'transition-all duration-200',
        shakeKeyframes[intensity],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * HoverSlide component - Slide animation on hover
 * Provides slide effect for hover interactions
 * 
 * @param children - Child components
 * @param className - Additional CSS classes for styling
 * @param direction - Slide direction: 'up' | 'down' | 'left' | 'right'
 * @param distance - Slide distance: 'sm' | 'md' | 'lg'
 * @returns JSX.Element - Hover slide wrapper
 * 
 * @example
 * <HoverSlide direction="up" distance="md">
 *   <Card>Sliding card</Card>
 * </HoverSlide>
 */
export interface HoverSlideProps {
  children: React.ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: 'sm' | 'md' | 'lg'
}

export function HoverSlide({ 
  children, 
  className, 
  direction = 'up', 
  distance = 'md' 
}: HoverSlideProps) {
  const slideClasses = {
    up: {
      sm: 'hover:-translate-y-1',
      md: 'hover:-translate-y-2',
      lg: 'hover:-translate-y-4'
    },
    down: {
      sm: 'hover:translate-y-1',
      md: 'hover:translate-y-2',
      lg: 'hover:translate-y-4'
    },
    left: {
      sm: 'hover:-translate-x-1',
      md: 'hover:-translate-x-2',
      lg: 'hover:-translate-x-4'
    },
    right: {
      sm: 'hover:translate-x-1',
      md: 'hover:translate-x-2',
      lg: 'hover:translate-x-4'
    }
  }

  return (
    <div 
      className={cn(
        'transition-all duration-300 ease-out',
        slideClasses[direction][distance],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * HoverBorder component - Animated border on hover
 * Provides animated border effect for hover interactions
 * 
 * @param children - Child components
 * @param className - Additional CSS classes for styling
 * @param borderColor - Border color: 'primary' | 'secondary' | 'destructive' | 'success'
 * @param borderWidth - Border width: 'sm' | 'md' | 'lg'
 * @returns JSX.Element - Hover border wrapper
 * 
 * @example
 * <HoverBorder borderColor="primary" borderWidth="md">
 *   <Card>Bordered card</Card>
 * </HoverBorder>
 */
interface HoverBorderProps {
  children: React.ReactNode
  className?: string
  borderColor?: 'primary' | 'secondary' | 'destructive' | 'success' | 'warning'
  borderWidth?: 'sm' | 'md' | 'lg'
}

export function HoverBorder({ 
  children, 
  className, 
  borderColor = 'primary', 
  borderWidth = 'md' 
}: HoverBorderProps) {
  const borderClasses = {
    primary: {
      sm: 'hover:border-2 hover:border-primary',
      md: 'hover:border-4 hover:border-primary',
      lg: 'hover:border-8 hover:border-primary'
    },
    secondary: {
      sm: 'hover:border-2 hover:border-secondary',
      md: 'hover:border-4 hover:border-secondary',
      lg: 'hover:border-8 hover:border-secondary'
    },
    destructive: {
      sm: 'hover:border-2 hover:border-destructive',
      md: 'hover:border-4 hover:border-destructive',
      lg: 'hover:border-8 hover:border-destructive'
    },
    success: {
      sm: 'hover:border-2 hover:border-green-500',
      md: 'hover:border-4 hover:border-green-500',
      lg: 'hover:border-8 hover:border-green-500'
    },
    warning: {
      sm: 'hover:border-2 hover:border-yellow-500',
      md: 'hover:border-4 hover:border-yellow-500',
      lg: 'hover:border-8 hover:border-yellow-500'
    }
  }

  return (
    <div 
      className={cn(
        'transition-all duration-300 ease-out border border-transparent',
        borderClasses[borderColor][borderWidth],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * HoverGradient component - Gradient overlay on hover
 * Provides gradient overlay effect for hover interactions
 * 
 * @param children - Child components
 * @param className - Additional CSS classes for styling
 * @param gradient - Gradient type: 'primary' | 'secondary' | 'rainbow' | 'sunset'
 * @param opacity - Overlay opacity: 'sm' | 'md' | 'lg'
 * @returns JSX.Element - Hover gradient wrapper
 * 
 * @example
 * <HoverGradient gradient="primary" opacity="md">
 *   <Card>Gradient card</Card>
 * </HoverGradient>
 */
interface HoverGradientProps {
  children: React.ReactNode
  className?: string
  gradient?: 'primary' | 'secondary' | 'rainbow' | 'sunset'
  opacity?: 'sm' | 'md' | 'lg'
}

export function HoverGradient({ 
  children, 
  className, 
  gradient = 'primary', 
  opacity = 'md' 
}: HoverGradientProps) {
  const gradientClasses = {
    primary: {
      sm: 'hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/20',
      md: 'hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/30',
      lg: 'hover:bg-gradient-to-r hover:from-primary/30 hover:to-primary/40'
    },
    secondary: {
      sm: 'hover:bg-gradient-to-r hover:from-secondary/10 hover:to-secondary/20',
      md: 'hover:bg-gradient-to-r hover:from-secondary/20 hover:to-secondary/30',
      lg: 'hover:bg-gradient-to-r hover:from-secondary/30 hover:to-secondary/40'
    },
    rainbow: {
      sm: 'hover:bg-gradient-to-r hover:from-red-500/10 hover:via-yellow-500/10 hover:to-blue-500/10',
      md: 'hover:bg-gradient-to-r hover:from-red-500/20 hover:via-yellow-500/20 hover:to-blue-500/20',
      lg: 'hover:bg-gradient-to-r hover:from-red-500/30 hover:via-yellow-500/30 hover:to-blue-500/30'
    },
    sunset: {
      sm: 'hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-pink-500/10',
      md: 'hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-pink-500/20',
      lg: 'hover:bg-gradient-to-r hover:from-orange-500/30 hover:to-pink-500/30'
    }
  }

  return (
    <div 
      className={cn(
        'transition-all duration-500 ease-out',
        gradientClasses[gradient][opacity],
        className
      )}
    >
      {children}
    </div>
  )
}

export default HoverScale
