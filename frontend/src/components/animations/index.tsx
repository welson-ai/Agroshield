'use client'

// Export all animation components
export { default as HoverScale, HoverGlow, HoverFloat, HoverRotate, HoverShake, HoverSlide, HoverBorder, HoverGradient } from './hover-effects'
export { default as FadeIn, SlideIn, ScaleIn, RotateIn, BounceIn, StaggeredAnimation, AnimatedCounter } from './transition-animations'
export { default as PageTransition, RouteTransition, TabTransition, ModalTransition, ListTransition } from './page-transitions'
export { default as LoadingSpinner, SkeletonLoader, ProgressBar, PulseLoader, WaveLoader } from './loading-animations'
export { default as useAnimation, useIntersectionAnimation, useSpringAnimation, AnimatedNumber, AnimatedProgress, AnimationController } from './animation-utils'

// Re-export types for TypeScript users
export type { 
  HoverScaleProps,
  HoverGlowProps,
  HoverFloatProps,
  HoverRotateProps,
  HoverShakeProps,
  HoverSlideProps,
  HoverBorderProps,
  HoverGradientProps
} from './hover-effects'

export type {
  FadeInProps,
  SlideInProps,
  ScaleInProps,
  RotateInProps,
  BounceInProps,
  StaggeredAnimationProps,
  AnimatedCounterProps
} from './transition-animations'

export type {
  PageTransitionProps,
  RouteTransitionProps,
  TabTransitionProps,
  ModalTransitionProps,
  ListTransitionProps
} from './page-transitions'

export type {
  LoadingSpinnerProps,
  SkeletonLoaderProps,
  ProgressBarProps,
  PulseLoaderProps,
  WaveLoaderProps
} from './loading-animations'

export type {
  UseAnimationProps,
  UseIntersectionAnimationOptions,
  SpringConfig,
  AnimatedNumberProps,
  AnimatedProgressProps,
  AnimationConfig,
  AnimationControllerProps
} from './animation-utils'

/**
 * AnimationLibrary component - Complete animation system
 * Provides access to all animation components and utilities
 * 
 * @example
 * import { HoverScale, FadeIn, LoadingSpinner } from '@/components/animations'
 * 
 * <HoverScale>
 *   <FadeIn>
 *     <LoadingSpinner />
 *   </FadeIn>
 * </HoverScale>
 */
export const AnimationLibrary = {
  // Hover Effects
  HoverScale,
  HoverGlow,
  HoverFloat,
  HoverRotate,
  HoverShake,
  HoverSlide,
  HoverBorder,
  HoverGradient,
  
  // Transition Animations
  FadeIn,
  SlideIn,
  ScaleIn,
  RotateIn,
  BounceIn,
  StaggeredAnimation,
  AnimatedCounter,
  
  // Page Transitions
  PageTransition,
  RouteTransition,
  TabTransition,
  ModalTransition,
  ListTransition,
  
  // Loading Animations
  LoadingSpinner,
  SkeletonLoader,
  ProgressBar,
  PulseLoader,
  WaveLoader,
  
  // Animation Utils
  useAnimation,
  useIntersectionAnimation,
  useSpringAnimation,
  AnimatedNumber,
  AnimatedProgress,
  AnimationController
}

/**
 * AnimationPresets component - Predefined animation combinations
 * Provides common animation presets for quick implementation
 * 
 * @example
 * <AnimationPresets.CardEntrance>
 *   <CardContent>Card with entrance animation</CardContent>
 * </AnimationPresets.CardEntrance>
 */
export const AnimationPresets = {
  /**
   * CardEntrance - Combined scale and fade animation for cards
   */
  CardEntrance: ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <ScaleIn delay={delay} duration={400} initialScale="md">
      <FadeIn delay={delay} duration={400}>
        {children}
      </FadeIn>
    </ScaleIn>
  ),
  
  /**
   * ListEntrance - Staggered fade-in animation for lists
   */
  ListEntrance: ({ children, staggerDelay = 100 }: { 
    children: React.ReactNode[]; 
    staggerDelay?: number 
  }) => (
    <StaggeredAnimation 
      staggerDelay={staggerDelay} 
      animationType="fadeIn" 
      direction="up"
    >
      {children}
    </StaggeredAnimation>
  ),
  
  /**
   * ModalEntrance - Scale and fade animation for modals
   */
  ModalEntrance: ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <ScaleIn delay={delay} duration={300} initialScale="sm">
      <FadeIn delay={delay} duration={300}>
        {children}
      </FadeIn>
    </ScaleIn>
  ),
  
  /**
   * ButtonHover - Combined scale and glow hover effect
   */
  ButtonHover: ({ children }: { children: React.ReactNode }) => (
    <HoverScale scale="sm" duration={200}>
      <HoverGlow glowColor="primary" intensity="sm">
        {children}
      </HoverGlow>
    </HoverScale>
  ),
  
  /**
   * PageLoad - Staggered entrance for page content
   */
  PageLoad: ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-4">
      {React.Children.map(children, (child, index) => (
        <FadeIn key={index} delay={index * 100} direction="up" duration={500}>
          {child}
        </FadeIn>
      ))}
    </div>
  )
}

/**
 * AnimationConfig component - Global animation configuration
 * Provides centralized animation settings
 * 
 * @param children - Child components
 * @param config - Animation configuration
 * @returns JSX.Element - Animation config provider
 * 
 * @example
 * <AnimationConfig config={{ duration: 300, easing: 'ease-out' }}>
 *   <App />
 * </AnimationConfig>
 */
interface AnimationConfigProps {
  children: React.ReactNode
  config?: {
    duration?: number
    easing?: string
    staggerDelay?: number
    reducedMotion?: boolean
  }
}

export function AnimationConfig({ children, config }: AnimationConfigProps) {
  const defaultConfig = {
    duration: 300,
    easing: 'ease-out',
    staggerDelay: 100,
    reducedMotion: false,
    ...config
  }

  // Set CSS custom properties for global animation settings
  React.useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--animation-duration', `${defaultConfig.duration}ms`)
    root.style.setProperty('--animation-easing', defaultConfig.easing)
    root.style.setProperty('--stagger-delay', `${defaultConfig.staggerDelay}ms`)
    
    if (defaultConfig.reducedMotion) {
      root.style.setProperty('--animation-reduced-motion', 'reduce')
    }
  }, [defaultConfig])

  return <>{children}</>
}

/**
 * useAnimationConfig hook - Access global animation configuration
 * Provides access to animation settings throughout the app
 * 
 * @returns Animation configuration object
 * 
 * @example
 * const { duration, easing, reducedMotion } = useAnimationConfig()
 */
export function useAnimationConfig() {
  return React.useMemo(() => ({
    duration: parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--animation-duration') || '300'),
    easing: getComputedStyle(document.documentElement)
      .getPropertyValue('--animation-easing') || 'ease-out',
    staggerDelay: parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--stagger-delay') || '100'),
    reducedMotion: getComputedStyle(document.documentElement)
      .getPropertyValue('--animation-reduced-motion') === 'reduce'
  }), [])
}

/**
 * AnimationDebugger component - Development tool for animation debugging
 * Shows animation states and performance metrics in development
 * 
 * @example
 * <AnimationDebugger />
 */
export function AnimationDebugger() {
  const [animations, setAnimations] = React.useState<string[]>([])
  const [fps, setFps] = React.useState(60)

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    // Monitor animation performance
    let frameCount = 0
    let lastTime = performance.now()

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime >= lastTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)))
        frameCount = 0
        lastTime = currentTime
      }
      
      requestAnimationFrame(measureFPS)
    }

    measureFPS()

    // Monitor active animations
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const target = mutation.target as HTMLElement
        const animationData = target.getAttribute('data-animations')
        if (animationData) {
          setAnimations(prev => [...new Set([...prev, ...animationData.split(',')])])
        }
      })
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-animations'],
      subtree: true
    })

    return () => observer.disconnect()
  }, [])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 bg-background border border-border rounded-lg p-4 text-xs font-mono z-50">
      <div className="space-y-2">
        <div>FPS: {fps}</div>
        <div>Active Animations: {animations.length}</div>
        <div className="max-w-48 truncate">
          {animations.join(', ')}
        </div>
      </div>
    </div>
  )
}

export default AnimationLibrary
