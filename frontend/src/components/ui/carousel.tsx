'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

/**
 * Carousel component - Image/content slider
 * Provides accessible carousel with keyboard navigation
 * 
 * @param children - Carousel items
 * @param className - Additional CSS classes
 * @param autoPlay - Whether to auto-play slides
 * @param interval - Auto-play interval in milliseconds
 * @param showIndicators - Whether to show slide indicators
 * @param showArrows - Whether to show navigation arrows
 * @returns JSX.Element - Carousel component
 * 
 * @example
 * <Carousel autoPlay interval={3000} showIndicators>
 *   <CarouselItem>Slide 1</CarouselItem>
 *   <CarouselItem>Slide 2</CarouselItem>
 *   <CarouselItem>Slide 3</CarouselItem>
 * </Carousel>
 */
interface CarouselProps {
  children: React.ReactNode
  className?: string
  autoPlay?: boolean
  interval?: number
  showIndicators?: boolean
  showArrows?: boolean
}

const CarouselContext = React.createContext<{
  currentIndex: number
  totalItems: number
  goToSlide: (index: number) => void
  nextSlide: () => void
  prevSlide: () => void
}>({
  currentIndex: 0,
  totalItems: 0,
  goToSlide: () => {},
  nextSlide: () => {},
  prevSlide: () => {}
})

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ 
    children, 
    className, 
    autoPlay = false, 
    interval = 3000, 
    showIndicators = true, 
    showArrows = true,
    ...props 
  }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [isPlaying, setIsPlaying] = React.useState(autoPlay)
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

    const items = React.Children.toArray(children)
    const totalItems = items.length

    const goToSlide = React.useCallback((index: number) => {
      if (index < 0) {
        setCurrentIndex(totalItems - 1)
      } else if (index >= totalItems) {
        setCurrentIndex(0)
      } else {
        setCurrentIndex(index)
      }
    }, [totalItems])

    const nextSlide = React.useCallback(() => {
      goToSlide(currentIndex + 1)
    }, [currentIndex, goToSlide])

    const prevSlide = React.useCallback(() => {
      goToSlide(currentIndex - 1)
    }, [currentIndex, goToSlide])

    // Auto-play functionality
    React.useEffect(() => {
      if (isPlaying && autoPlay) {
        intervalRef.current = setInterval(nextSlide, interval)
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }, [isPlaying, autoPlay, interval, nextSlide])

    // Keyboard navigation
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowLeft':
            prevSlide()
            break
          case 'ArrowRight':
            nextSlide()
            break
          case 'Home':
            goToSlide(0)
            break
          case 'End':
            goToSlide(totalItems - 1)
            break
          case ' ':
            e.preventDefault()
            setIsPlaying(!isPlaying)
            break
        }
      }

      const carousel = ref?.current
      if (carousel) {
        carousel.addEventListener('keydown', handleKeyDown)
        return () => carousel.removeEventListener('keydown', handleKeyDown)
      }
    }, [currentIndex, totalItems, nextSlide, prevSlide, goToSlide, isPlaying, ref])

    const contextValue = React.useMemo(() => ({
      currentIndex,
      totalItems,
      goToSlide,
      nextSlide,
      prevSlide
    }), [currentIndex, totalItems, goToSlide, nextSlide, prevSlide])

    return (
      <CarouselContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("relative w-full", className)}
          role="region"
          aria-roledescription="carousel"
          aria-label="Image carousel"
          {...props}
        >
          {/* Carousel track */}
          <div className="overflow-hidden rounded-lg">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {items.map((item, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${totalItems}`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          {showArrows && totalItems > 1 && (
            <>
              <button
                type="button"
                className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border",
                  "flex items-center justify-center",
                  "hover:bg-background hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border",
                  "flex items-center justify-center",
                  "hover:bg-background hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Slide indicators */}
          {showIndicators && totalItems > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {Array.from({ length: totalItems }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn(
                    "h-2 w-2 rounded-full transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    index === currentIndex 
                      ? "bg-primary" 
                      : "bg-primary/50 hover:bg-primary/75"
                  )}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentIndex}
                />
              ))}
            </div>
          )}

          {/* Play/pause button for auto-play */}
          {autoPlay && (
            <button
              type="button"
              className={cn(
                "absolute top-4 right-4 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border",
                "flex items-center justify-center",
                "hover:bg-background hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pause" : "Play"}
              aria-pressed={isPlaying}
            >
              {isPlaying ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </CarouselContext.Provider>
    )
  }
)
Carousel.displayName = "Carousel"

/**
 * CarouselItem component - Individual carousel slide
 * 
 * @param children - Slide content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Carousel item
 * 
 * @example
 * <CarouselItem>
 *   <img src="/slide1.jpg" alt="Slide 1" />
 * </CarouselItem>
 */
interface CarouselItemProps {
  children: React.ReactNode
  className?: string
}

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full h-full flex items-center justify-center", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
CarouselItem.displayName = "CarouselItem"

/**
 * CarouselNavigation component - Custom navigation
 * 
 * @param className - Additional CSS classes
 * @returns JSX.Element - Custom navigation
 * 
 * @example
 * <CarouselNavigation />
 */
export const CarouselNavigation: React.FC<{ className?: string }> = ({ className }) => {
  const { currentIndex, totalItems, goToSlide, nextSlide, prevSlide } = React.useContext(CarouselContext)

  return (
    <div className={cn("flex items-center justify-between space-x-4", className)}>
      <button
        type="button"
        className={cn(
          "px-3 py-1 text-sm bg-background border rounded-md",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        onClick={prevSlide}
        disabled={totalItems <= 1}
      >
        Previous
      </button>
      
      <div className="text-sm text-muted-foreground">
        {currentIndex + 1} / {totalItems}
      </div>
      
      <button
        type="button"
        className={cn(
          "px-3 py-1 text-sm bg-background border rounded-md",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        onClick={nextSlide}
        disabled={totalItems <= 1}
      >
        Next
      </button>
    </div>
  )
}

/**
 * CarouselProgress component - Progress bar for carousel
 * 
 * @param className - Additional CSS classes
 * @returns JSX.Element - Progress bar
 * 
 * @example
 * <CarouselProgress />
 */
export const CarouselProgress: React.FC<{ className?: string }> = ({ className }) => {
  const { currentIndex, totalItems } = React.useContext(CarouselContext)
  const progress = totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0

  return (
    <div className={cn("w-full bg-muted rounded-full h-1", className)}>
      <div 
        className="bg-primary h-1 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export { Carousel, CarouselItem }
