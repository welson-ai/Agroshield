'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Masonry component - Pinterest-style masonry layout
 * Provides responsive masonry grid with variable height items
 * 
 * @param children - Masonry items
 * @param columns - Number of columns or responsive configuration
 * @param gap - Gap between items
 * @param className - Additional CSS classes
 * @returns JSX.Element - Masonry component
 * 
 * @example
 * <Masonry columns={3} gap={16}>
 *   {items.map(item => (
 *     <MasonryItem key={item.id} height={item.height}>
 *       <img src={item.image} alt={item.title} />
 *     </MasonryItem>
 *   ))}
 * </Masonry>
 */
interface MasonryProps {
  children: React.ReactNode
  columns?: number | { sm: number; md: number; lg: number; xl: number }
  gap?: number
  className?: string
}

const Masonry = React.forwardRef<HTMLDivElement, MasonryProps>(
  ({ children, columns = 3, gap = 16, className, ...props }, ref) => {
    const [columnHeights, setColumnHeights] = React.useState<number[]>([])
    const [itemPositions, setItemPositions] = React.useState<Array<{x: number; y: number; width: number}>>([])
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [containerWidth, setContainerWidth] = React.useState(0)

    // Get column count based on container width
    const getColumnCount = React.useCallback((width: number) => {
      if (typeof columns === 'number') return columns
      
      if (width < 640) return columns.sm || 1
      if (width < 768) return columns.md || 2
      if (width < 1024) return columns.lg || 3
      return columns.xl || 4
    }, [columns])

    // Calculate item positions
    React.useEffect(() => {
      const container = containerRef.current
      if (!container) return

      const items = Array.from(container.children).filter(child => 
        child instanceof HTMLElement && child.dataset.masonryItem !== 'false'
      )
      
      const columnCount = getColumnCount(containerWidth)
      const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount
      const heights = new Array(columnCount).fill(0)
      const positions: Array<{x: number; y: number; width: number}> = []

      items.forEach((item, index) => {
        const element = item as HTMLElement
        const height = element.offsetHeight
        
        // Find the shortest column
        const shortestColumnIndex = heights.indexOf(Math.min(...heights))
        
        // Calculate position
        const x = shortestColumnIndex * (columnWidth + gap)
        const y = heights[shortestColumnIndex]
        
        positions.push({ x, y, width: columnWidth })
        
        // Update column height
        heights[shortestColumnIndex] += height + gap
      })

      setColumnHeights(heights)
      setItemPositions(positions)
    }, [containerWidth, gap, getColumnCount])

    // Handle container resize
    React.useEffect(() => {
      const container = containerRef.current
      if (!container) return

      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (entry) {
          setContainerWidth(entry.contentRect.width)
        }
      })

      resizeObserver.observe(container)
      return () => resizeObserver.disconnect()
    }, [])

    const totalHeight = columnHeights.length > 0 ? Math.max(...columnHeights) : 0

    return (
      <div
        ref={containerRef}
        className={cn("relative", className)}
        style={{ height: totalHeight }}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (!React.isValidElement(child)) return child
          
          const position = itemPositions[index]
          if (!position) return child

          return React.cloneElement(child, {
            style: {
              position: 'absolute',
              left: position.x,
              top: position.y,
              width: position.width,
              ...child.props.style
            }
          })
        })}
      </div>
    )
  }
)
Masonry.displayName = "Masonry"

/**
 * MasonryItem component - Individual masonry item
 * 
 * @param children - Item content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Masonry item
 * 
 * @example
 * <MasonryItem className="bg-white rounded-lg shadow-md">
 *   <img src="/image.jpg" alt="Item" />
 *   <div className="p-4">
 *     <h3>Item Title</h3>
 *     <p>Item description</p>
 *   </div>
 * </MasonryItem>
 */
interface MasonryItemProps {
  children: React.ReactNode
  className?: string
}

const MasonryItem = React.forwardRef<HTMLDivElement, MasonryItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-masonry-item="true"
        className={cn("transition-all duration-300", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MasonryItem.displayName = "MasonryItem"

/**
 * MasonryGrid component - Enhanced masonry with loading states
 * 
 * @param items - Array of items to render
 * @param renderItem - Function to render each item
 * @param loading - Whether items are loading
 * @onLoadMore - Callback to load more items
 * @hasMore - Whether there are more items to load
 * @columns - Number of columns
 * @gap - Gap between items
 * @className - Additional CSS classes
 * @returns JSX.Element - Masonry grid
 * 
 * @example
 * <MasonryGrid 
 *   items={masonryItems}
 *   renderItem={(item) => <div>{item.content}</div>}
 *   loading={isLoading}
 *   onLoadMore={loadMore}
 *   hasMore={hasMore}
 *   columns={3}
 * />
 */
export const MasonryGrid: React.FC<{
  items: any[]
  renderItem: (item: any, index: number) => React.ReactNode
  loading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  columns?: number | { sm: number; md: number; lg: number; xl: number }
  gap?: number
  className?: string
}> = ({
  items,
  renderItem,
  loading = false,
  onLoadMore,
  hasMore = false,
  columns = 3,
  gap = 16,
  className
}) => {
  const [visibleItems, setVisibleItems] = React.useState(items)
  const sentinelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setVisibleItems(items)
  }, [items])

  // Infinite scroll logic
  React.useEffect(() => {
    if (!onLoadMore || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        const sentinel = entries[0]
        if (sentinel.isIntersecting && !loading) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    const sentinel = sentinelRef.current
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel)
      }
    }
  }, [onLoadMore, hasMore, loading])

  return (
    <div className={cn("space-y-4", className)}>
      <Masonry columns={columns} gap={gap}>
        {visibleItems.map((item, index) => (
          <MasonryItem key={item.id || index}>
            {renderItem(item, index)}
          </MasonryItem>
        ))}
      </Masonry>

      {/* Loading sentinel */}
      {hasMore && (
        <div ref={sentinelRef} className="h-1" />
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading more...</span>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * MasonryGallery component - Image gallery with masonry layout
 * 
 * @param images - Array of image objects
 * @param onImageClick - Callback when image is clicked
 * @param columns - Number of columns
 * @param gap - Gap between images
 * @param showOverlay - Whether to show overlay on hover
 * @param className - Additional CSS classes
 * @returns JSX.Element - Masonry gallery
 * 
 * @example
 * <MasonryGallery 
 *   images={galleryImages}
 *   onImageClick={handleImageClick}
 *   columns={3}
 *   showOverlay
 * />
 */
export const MasonryGallery: React.FC<{
  images: Array<{
    id: string
    src: string
    alt: string
    title?: string
    description?: string
  }>
  onImageClick?: (image: any, index: number) => void
  columns?: number
  gap?: number
  showOverlay?: boolean
  className?: string
}> = ({
  images,
  onImageClick,
  columns = 3,
  gap = 16,
  showOverlay = true,
  className
}) => {
  return (
    <Masonry columns={columns} gap={gap} className={className}>
      {images.map((image, index) => (
        <MasonryItem key={image.id}>
          <div
            className="relative group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => onImageClick?.(image, index)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {showOverlay && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-4 text-white">
                  {image.title && (
                    <h3 className="font-semibold">{image.title}</h3>
                  )}
                  {image.description && (
                    <p className="text-sm opacity-90">{image.description}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </MasonryItem>
      ))}
    </Masonry>
  )
}

/**
 * MasonryCard component - Card with masonry layout support
 * 
 * @param children - Card content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Masonry card
 * 
 * @example
 * <MasonryCard className="bg-white rounded-lg shadow-md p-4">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </MasonryCard>
 */
export const MasonryCard: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({
  children,
  className
}) => {
  return (
    <MasonryItem className={className}>
      {children}
    </MasonryItem>
  )
}

export { Masonry, MasonryItem }
