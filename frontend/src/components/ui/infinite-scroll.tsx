'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Loader2 } from "lucide-react"

/**
 * InfiniteScroll component - Infinite scrolling list
 * Provides efficient infinite scrolling with loading states
 * 
 * @param children - List items or render function
 * @param hasMore - Whether there are more items to load
 * @param loadMore - Function to load more items
 * @param loading - Whether currently loading
 * @param loader - Custom loader component
 * @param endMessage - Message when all items are loaded
 * @param threshold - Scroll threshold in pixels
 * @param className - Additional CSS classes
 * @returns JSX.Element - Infinite scroll component
 * 
 * @example
 * <InfiniteScroll 
 *   hasMore={hasMore}
 *   loadMore={loadMoreItems}
 *   loading={isLoading}
 *   threshold={200}
 * >
 *   {items.map(item => (
 *     <div key={item.id}>{item.name}</div>
 *   ))}
 * </InfiniteScroll>
 */
interface InfiniteScrollProps {
  children: React.ReactNode | ((index: number) => React.ReactNode)
  hasMore: boolean
  loadMore: () => void | Promise<void>
  loading?: boolean
  loader?: React.ReactNode
  endMessage?: React.ReactNode
  threshold?: number
  className?: string
}

const InfiniteScroll = React.forwardRef<HTMLDivElement, InfiniteScrollProps>(
  ({ 
    children, 
    hasMore, 
    loadMore, 
    loading = false, 
    loader, 
    endMessage, 
    threshold = 200, 
    className, 
    ...props 
  }, ref) => {
    const [isClient, setIsClient] = React.useState(false)
    const sentinelRef = React.useRef<HTMLDivElement>(null)
    const loadingRef = React.useRef(false)

    React.useEffect(() => {
      setIsClient(true)
    }, [])

    const handleScroll = React.useCallback(() => {
      if (!hasMore || loading || loadingRef.current) return

      const sentinel = sentinelRef.current
      if (!sentinel) return

      const rect = sentinel.getBoundingClientRect()
      const isVisible = rect.top <= window.innerHeight + threshold

      if (isVisible) {
        loadingRef.current = true
        loadMore().finally(() => {
          loadingRef.current = false
        })
      }
    }, [hasMore, loading, loadMore, threshold])

    React.useEffect(() => {
      if (!isClient) return

      const handleScrollEvent = () => handleScroll()
      window.addEventListener('scroll', handleScrollEvent)
      window.addEventListener('resize', handleScrollEvent)

      // Initial check
      handleScrollEvent()

      return () => {
        window.removeEventListener('scroll', handleScrollEvent)
        window.removeEventListener('resize', handleScrollEvent)
      }
    }, [isClient, handleScroll])

    const renderChildren = () => {
      if (typeof children === 'function') {
        return Array.from({ length: 100 }, (_, index) => children(index))
      }
      return children
    }

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {renderChildren()}
        
        {/* Sentinel element for intersection detection */}
        <div ref={sentinelRef} className="h-1" />
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center py-4">
            {loader || (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading more...</span>
              </div>
            )}
          </div>
        )}
        
        {/* End message */}
        {!hasMore && !loading && endMessage && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {endMessage}
          </div>
        )}
      </div>
    )
  }
)
InfiniteScroll.displayName = "InfiniteScroll"

/**
 * InfiniteGrid component - Infinite scrolling grid
 * 
 * @param children - Grid items or render function
 * @param hasMore - Whether there are more items to load
 * @param loadMore - Function to load more items
 * @param loading - Whether currently loading
 * @param columns - Number of grid columns
 * @param gap - Gap between grid items
 * @param loader - Custom loader component
 * @param endMessage - Message when all items are loaded
 * @param threshold - Scroll threshold in pixels
 * @param className - Additional CSS classes
 * @returns JSX.Element - Infinite grid component
 * 
 * @example
 * <InfiniteGrid 
 *   hasMore={hasMore}
 *   loadMore={loadMoreItems}
 *   columns={3}
 *   gap={4}
 * >
 *   {items.map(item => (
 *     <div key={item.id}>{item.name}</div>
 *   ))}
 * </InfiniteGrid>
 */
export const InfiniteGrid: React.FC<{
  children: React.ReactNode | ((index: number) => React.ReactNode)
  hasMore: boolean
  loadMore: () => void | Promise<void>
  loading?: boolean
  columns?: number
  gap?: number
  loader?: React.ReactNode
  endMessage?: React.ReactNode
  threshold?: number
  className?: string
}> = ({
  children,
  hasMore,
  loadMore,
  loading = false,
  columns = 3,
  gap = 4,
  loader,
  endMessage,
  threshold = 200,
  className
}) => {
  return (
    <InfiniteScroll
      hasMore={hasMore}
      loadMore={loadMore}
      loading={loading}
      loader={loader}
      endMessage={endMessage}
      threshold={threshold}
      className={className}
    >
      <div 
        className={cn("grid", className)}
        style={{ 
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: `${gap * 4}px`
        }}
      >
        {typeof children === 'function' ? (
          Array.from({ length: 100 }, (_, index) => children(index))
        ) : (
          children
        )}
      </div>
    </InfiniteScroll>
  )
}

/**
 * InfiniteList component - Infinite scrolling list with manual load more
 * 
 * @param children - List items
 * @param hasMore - Whether there are more items to load
 * @param loadMore - Function to load more items
 * @param loading - Whether currently loading
 * @param loader - Custom loader component
 * @param loadMoreText - Text for load more button
 * @param loadingText - Text for loading state
 * @param endMessage - Message when all items are loaded
 * @param className - Additional CSS classes
 * @returns JSX.Element - Infinite list with manual load more
 * 
 * @example
 * <InfiniteList 
 *   hasMore={hasMore}
 *   loadMore={loadMoreItems}
 *   loading={isLoading}
 *   loadMoreText="Load More"
 *   loadingText="Loading..."
 * >
 *   {items.map(item => (
 *     <div key={item.id}>{item.name}</div>
 *   ))}
 * </InfiniteList>
 */
export const InfiniteList: React.FC<{
  children: React.ReactNode
  hasMore: boolean
  loadMore: () => void | Promise<void>
  loading?: boolean
  loader?: React.ReactNode
  loadMoreText?: string
  loadingText?: string
  endMessage?: React.ReactNode
  className?: string
}> = ({
  children,
  hasMore,
  loadMore,
  loading = false,
  loader,
  loadMoreText = "Load More",
  loadingText = "Loading...",
  endMessage = "No more items to load",
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
      
      {/* Load more button */}
      {hasMore && !loading && (
        <div className="flex justify-center">
          <Button
            onClick={loadMore}
            variant="outline"
            disabled={loading}
          >
            {loadMoreText}
          </Button>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center">
          {loader || (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{loadingText}</span>
            </div>
          )}
        </div>
      )}
      
      {/* End message */}
      {!hasMore && !loading && endMessage && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          {endMessage}
        </div>
      )}
    </div>
  )
}

/**
 * InfiniteScrollProvider component - Context provider for infinite scroll state
 * 
 * @param children - Child components
 * @param items - Current items
 * @param loadMore - Function to load more items
 * @param hasMore - Whether there are more items to load
 * @param loading - Whether currently loading
 * @param threshold - Scroll threshold in pixels
 * @returns JSX.Element - Infinite scroll provider
 * 
 * @example
 * <InfiniteScrollProvider 
 *   items={items}
 *   loadMore={loadMoreItems}
 *   hasMore={hasMore}
 * >
 *   <InfiniteScrollContent />
 * </InfiniteScrollProvider>
 */
export const InfiniteScrollProvider: React.FC<{
  children: React.ReactNode
  items: any[]
  loadMore: () => void | Promise<void>
  hasMore: boolean
  loading?: boolean
  threshold?: number
}> = ({
  children,
  items,
  loadMore,
  hasMore,
  loading = false,
  threshold = 200
}) => {
  const contextValue = React.useMemo(() => ({
    items,
    loadMore,
    hasMore,
    loading,
    threshold
  }), [items, loadMore, hasMore, loading, threshold])

  return (
    <InfiniteScrollContext.Provider value={contextValue}>
      {children}
    </InfiniteScrollContext.Provider>
  )
}

const InfiniteScrollContext = React.createContext<{
  items: any[]
  loadMore: () => void | Promise<void>
  hasMore: boolean
  loading: boolean
  threshold: number
}>({
  items: [],
  loadMore: async () => {},
  hasMore: false,
  loading: false,
  threshold: 200
})

/**
 * InfiniteScrollContent component - Content component for use with provider
 * 
 * @param renderItem - Function to render each item
 * @param loader - Custom loader component
 * @param endMessage - Message when all items are loaded
 * @param className - Additional CSS classes
 * @returns JSX.Element - Infinite scroll content
 * 
 * @example
 * <InfiniteScrollContent 
 *   renderItem={(item, index) => <div>{item.name}</div>}
 *   endMessage="All items loaded"
 * />
 */
export const InfiniteScrollContent: React.FC<{
  renderItem: (item: any, index: number) => React.ReactNode
  loader?: React.ReactNode
  endMessage?: React.ReactNode
  className?: string
}> = ({
  renderItem,
  loader,
  endMessage,
  className
}) => {
  const { items, loadMore, hasMore, loading, threshold } = React.useContext(InfiniteScrollContext)

  return (
    <InfiniteScroll
      hasMore={hasMore}
      loadMore={loadMore}
      loading={loading}
      loader={loader}
      endMessage={endMessage}
      threshold={threshold}
      className={className}
    >
      {items.map((item, index) => renderItem(item, index))}
    </InfiniteScroll>
  )
}

export { InfiniteScroll }
