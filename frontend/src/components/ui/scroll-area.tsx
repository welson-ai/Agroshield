'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * ScrollArea component - Custom scrollbar with styling
 * Provides customizable scrollbars with smooth scrolling
 * 
 * @param children - Scrollable content
 * @param orientation - Scroll orientation: 'vertical' | 'horizontal' | 'both'
 * @type - Scrollbar type: 'auto' | 'scroll' | 'hover'
 * @hideDelay - Delay before hiding scrollbar (ms)
 * @showDelay - Delay before showing scrollbar (ms)
 * @className - Additional CSS classes
 * @returns JSX.Element - Scroll area component
 * 
 * @example
 * <ScrollArea orientation="vertical" type="auto" className="h-96">
 *   <div>Scrollable content here</div>
 * </ScrollArea>
 */
interface ScrollAreaProps {
  children: React.ReactNode
  orientation?: 'vertical' | 'horizontal' | 'both'
  type?: 'auto' | 'scroll' | 'hover'
  hideDelay?: number
  showDelay?: number
  className?: string
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ 
    children, 
    orientation = 'vertical', 
    type = 'auto', 
    hideDelay = 1000, 
    showDelay = 0, 
    className, 
    ...props 
  }, ref) => {
    const [isScrolling, setIsScrolling] = React.useState(false)
    const [isHovering, setIsHovering] = React.useState(false)
    const [scrollPosition, setScrollPosition] = React.useState({ x: 0, y: 0 })
    const [contentSize, setContentSize] = React.useState({ width: 0, height: 0 })
    const [viewportSize, setViewportSize] = React.useState({ width: 0, height: 0 })
    
    const scrollAreaRef = React.useRef<HTMLDivElement>(null)
    const viewportRef = React.useRef<HTMLDivElement>(null)
    const contentRef = React.useRef<HTMLDivElement>(null)
    const scrollbarXRef = React.useRef<HTMLDivElement>(null)
    const scrollbarYRef = React.useRef<HTMLDivElement>(null)
    const thumbXRef = React.useRef<HTMLDivElement>(null)
    const thumbYRef = React.useRef<HTMLDivElement>(null)
    
    const hideTimeoutRef = React.useRef<NodeJS.Timeout>()
    const showTimeoutRef = React.useRef<NodeJS.Timeout>()

    // Calculate scrollbar dimensions
    const scrollXEnabled = orientation === 'horizontal' || orientation === 'both'
    const scrollYEnabled = orientation === 'vertical' || orientation === 'both'
    
    const scrollXSize = contentSize.width > 0 ? viewportSize.width / contentSize.width : 0
    const scrollYSize = contentSize.height > 0 ? viewportSize.height / contentSize.height : 0
    
    const thumbXWidth = scrollXSize > 0 ? Math.max(20, scrollXSize * viewportSize.width) : 0
    const thumbYHeight = scrollYSize > 0 ? Math.max(20, scrollYSize * viewportSize.height) : 0
    
    const thumbXPosition = scrollPosition.x * (viewportSize.width - thumbXWidth) / (contentSize.width - viewportSize.width)
    const thumbYPosition = scrollPosition.y * (viewportSize.height - thumbYHeight) / (contentSize.height - viewportSize.height)

    // Handle scroll events
    const handleScroll = React.useCallback(() => {
      if (!viewportRef.current) return
      
      const newScrollPosition = {
        x: viewportRef.current.scrollLeft,
        y: viewportRef.current.scrollTop
      }
      
      setScrollPosition(newScrollPosition)
      setIsScrolling(true)
      
      // Clear existing timeouts
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current)
      
      // Show scrollbar immediately when scrolling
      if (type === 'hover') {
        showTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false)
        }, hideDelay)
      }
    }, [type, hideDelay])

    // Handle mouse enter/leave for hover type
    const handleMouseEnter = React.useCallback(() => {
      if (type === 'hover') {
        setIsHovering(true)
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
      }
    }, [type])

    const handleMouseLeave = React.useCallback(() => {
      if (type === 'hover') {
        setIsHovering(false)
        if (!isScrolling) {
          hideTimeoutRef.current = setTimeout(() => {
            setIsHovering(false)
          }, hideDelay)
        }
      }
    }, [type, isScrolling, hideDelay])

    // Handle thumb drag
    const handleThumbDrag = React.useCallback((axis: 'x' | 'y') => {
      const thumb = axis === 'x' ? thumbXRef.current : thumbYRef.current
      const viewport = viewportRef.current
      
      if (!thumb || !viewport) return
      
      const startScrollPosition = axis === 'x' ? viewport.scrollLeft : viewport.scrollTop
      const startClientPosition = axis === 'x' ? 'clientX' : 'clientY'
      const contentSizeValue = axis === 'x' ? contentSize.width : contentSize.height
      const viewportSizeValue = axis === 'x' ? viewportSize.width : viewportSize.height
      const thumbSizeValue = axis === 'x' ? thumbXWidth : thumbYHeight
      
      const handleMouseMove = (e: MouseEvent) => {
        const delta = e[startClientPosition] - (e as any).startClientPosition
        const scrollDelta = (delta / viewportSizeValue) * contentSizeValue
        const newScrollPosition = Math.max(0, Math.min(startScrollPosition + scrollDelta, contentSizeValue - viewportSizeValue))
        
        if (axis === 'x') {
          viewport.scrollLeft = newScrollPosition
        } else {
          viewport.scrollTop = newScrollPosition
        }
      }
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }, [contentSize, viewportSize, thumbXWidth, thumbYHeight])

    // Update content and viewport sizes
    React.useEffect(() => {
      const updateSizes = () => {
        if (contentRef.current && viewportRef.current) {
          setContentSize({
            width: contentRef.current.scrollWidth,
            height: contentRef.current.scrollHeight
          })
          setViewportSize({
            width: viewportRef.current.clientWidth,
            height: viewportRef.current.clientHeight
          })
        }
      }
      
      updateSizes()
      
      const resizeObserver = new ResizeObserver(updateSizes)
      if (contentRef.current) resizeObserver.observe(contentRef.current)
      if (viewportRef.current) resizeObserver.observe(viewportRef.current)
      
      return () => {
        resizeObserver.disconnect()
      }
    }, [])

    // Determine if scrollbars should be visible
    const showScrollbarX = scrollXEnabled && contentSize.width > viewportSize.width && (
      type === 'scroll' || 
      type === 'auto' || 
      (type === 'hover' && (isHovering || isScrolling))
    )
    
    const showScrollbarY = scrollYEnabled && contentSize.height > viewportSize.height && (
      type === 'scroll' || 
      type === 'auto' || 
      (type === 'hover' && (isHovering || isScrolling))
    )

    return (
      <div
        ref={scrollAreaRef}
        className={cn("relative overflow-hidden", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Viewport */}
        <div
          ref={viewportRef}
          className={cn(
            "h-full w-full overflow-auto",
            "scrollbar-hide" // Hide native scrollbars
          )}
          onScroll={handleScroll}
        >
          {/* Content */}
          <div ref={contentRef}>
            {children}
          </div>
        </div>

        {/* Custom scrollbars */}
        {showScrollbarY && (
          <div
            ref={scrollbarYRef}
            className="absolute top-0 right-0 w-2 h-full bg-transparent"
          >
            <div
              ref={thumbYRef}
              className="absolute bg-muted-foreground/50 hover:bg-muted-foreground/70 rounded-full transition-colors cursor-pointer"
              style={{
                height: `${thumbYHeight}px`,
                top: `${thumbYPosition}px`,
                right: '0'
              }}
              onMouseDown={() => handleThumbDrag('y')}
            />
          </div>
        )}

        {showScrollbarX && (
          <div
            ref={scrollbarXRef}
            className="absolute bottom-0 left-0 h-2 w-full bg-transparent"
          >
            <div
              ref={thumbXRef}
              className="absolute bg-muted-foreground/50 hover:bg-muted-foreground/70 rounded-full transition-colors cursor-pointer"
              style={{
                width: `${thumbXWidth}px`,
                left: `${thumbXPosition}px`,
                bottom: '0'
              }}
              onMouseDown={() => handleThumbDrag('x')}
            />
          </div>
        )}
      </div>
    )
  }
)
ScrollArea.displayName = "ScrollArea"

/**
 * ScrollAreaCorner component - Corner where scrollbars meet
 * 
 * @param className - Additional CSS classes
 * @returns JSX.Element - Scroll area corner
 * 
 * @example
 * <ScrollAreaCorner className="bg-muted" />
 */
export const ScrollAreaCorner: React.FC<{
  className?: string
}> = ({ className }) => {
  return (
    <div className={cn("absolute bottom-0 right-0 w-2 h-2 bg-muted", className)} />
  )
}

/**
 * ScrollAreaScrollbar component - Individual scrollbar
 * 
 * @param orientation - Scrollbar orientation
 * @param size - Scrollbar size
 * @param position - Scrollbar position
 * @param onDrag - Callback when thumb is dragged
 * @param className - Additional CSS classes
 * @returns JSX.Element - Scrollbar
 * 
 * @example
 * <ScrollAreaScrollbar 
 *   orientation="vertical" 
 *   size={100} 
 *   position={50} 
 *   onDrag={handleDrag}
 * />
 */
export const ScrollAreaScrollbar: React.FC<{
  orientation: 'vertical' | 'horizontal'
  size: number
  position: number
  onDrag: (delta: number) => void
  className?: string
}> = ({
  orientation,
  size,
  position,
  onDrag,
  className
}) => {
  const isVertical = orientation === 'vertical'
  
  return (
    <div
      className={cn(
        "absolute bg-muted-foreground/50 hover:bg-muted-foreground/70 rounded-full transition-colors cursor-pointer",
        isVertical ? "w-2" : "h-2",
        className
      )}
      style={{
        [isVertical ? 'height' : 'width']: `${size}px`,
        [isVertical ? 'top' : 'left']: `${position}px`,
        [isVertical ? 'right' : 'bottom']: '0'
      }}
    />
  )
}

/**
 * ScrollAreaThumb component - Scrollbar thumb
 * 
 * @param orientation - Thumb orientation
 * @param size - Thumb size
 * @param position - Thumb position
 * @param onDrag - Callback when thumb is dragged
 * @param className - Additional CSS classes
 * @returns JSX.Element - Scrollbar thumb
 * 
 * @example
 * <ScrollAreaThumb 
 *   orientation="vertical" 
 *   size={50} 
 *   position={25} 
 *   onDrag={handleDrag}
 * />
 */
export const ScrollAreaThumb: React.FC<{
  orientation: 'vertical' | 'horizontal'
  size: number
  position: number
  onDrag: (delta: number) => void
  className?: string
}> = ({
  orientation,
  size,
  position,
  onDrag,
  className
}) => {
  const isVertical = orientation === 'vertical'
  
  return (
    <div
      className={cn(
        "absolute bg-muted-foreground/50 hover:bg-muted-foreground/70 rounded-full transition-colors cursor-pointer",
        isVertical ? "w-2" : "h-2",
        className
      )}
      style={{
        [isVertical ? 'height' : 'width']: `${size}px`,
        [isVertical ? 'top' : 'left']: `${position}px`,
        [isVertical ? 'right' : 'bottom']: '0'
      }}
    />
  )
}

/**
 * ScrollAreaViewport component - Viewport for scrollable content
 * 
 * @param children - Viewport content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Scroll area viewport
 * 
 * @example
 * <ScrollAreaViewport className="h-96">
 *   <div>Scrollable content</div>
 * </ScrollAreaViewport>
 */
export const ScrollAreaViewport: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({
  children,
  className
}) => {
  return (
    <div className={cn("overflow-auto scrollbar-hide", className)}>
      {children}
    </div>
  )
}

export { ScrollArea }
