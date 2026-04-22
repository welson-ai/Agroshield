'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * VirtualList component - High-performance virtual scrolling list
 * Provides efficient rendering of large datasets
 * 
 * @param items - Array of items to render
 * @param itemHeight - Height of each item (fixed) or function for dynamic height
 * @param renderItem - Function to render each item
 * @param estimatedItemHeight - Estimated height for dynamic items
 * @param overscan - Number of items to render outside viewport
 * @onScroll - Callback when scroll position changes
 * @onItemClick - Callback when item is clicked
 * @className - Additional CSS classes
 * @returns JSX.Element - Virtual list component
 * 
 * @example
 * <VirtualList 
 *   items={largeDataSet}
 *   itemHeight={50}
 *   renderItem={(item, index) => <div>{item.name}</div>}
 *   overscan={5}
 * />
 */
interface VirtualListProps<T> {
  items: T[]
  itemHeight: number | ((index: number) => number)
  renderItem: (item: T, index: number) => React.ReactNode
  estimatedItemHeight?: number
  overscan?: number
  onScroll?: (scrollTop: number) => void
  onItemClick?: (item: T, index: number) => void
  className?: string
}

const VirtualList = React.forwardRef<HTMLDivElement, VirtualListProps<any>>(
  ({ 
    items, 
    itemHeight, 
    renderItem, 
    estimatedItemHeight = 50, 
    overscan = 5, 
    onScroll, 
    onItemClick, 
    className, 
    ...props 
  }, ref) => {
    const [scrollTop, setScrollTop] = React.useState(0)
    const [containerHeight, setContainerHeight] = React.useState(0)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const scrollElementRef = React.useRef<HTMLDivElement>(null)

    // Calculate item positions and total height
    const itemPositions = React.useMemo(() => {
      const positions: number[] = [0]
      let currentHeight = 0
      
      for (let i = 0; i < items.length; i++) {
        const height = typeof itemHeight === 'function' ? itemHeight(i) : itemHeight
        currentHeight += height
        positions.push(currentHeight)
      }
      
      return positions
    }, [items.length, itemHeight])

    const totalHeight = itemPositions[itemPositions.length - 1]

    // Calculate visible range
    const visibleRange = React.useMemo(() => {
      let startIndex = 0
      let endIndex = items.length - 1

      // Binary search for start index
      let left = 0
      let right = itemPositions.length - 1
      
      while (left <= right) {
        const mid = Math.floor((left + right) / 2)
        if (itemPositions[mid] <= scrollTop) {
          startIndex = mid
          left = mid + 1
        } else {
          right = mid - 1
        }
      }

      // Find end index
      for (let i = startIndex; i < itemPositions.length - 1; i++) {
        if (itemPositions[i] > scrollTop + containerHeight) {
          endIndex = i - 1
          break
        }
      }

      // Apply overscan
      startIndex = Math.max(0, startIndex - overscan)
      endIndex = Math.min(items.length - 1, endIndex + overscan)

      return { startIndex, endIndex }
    }, [scrollTop, containerHeight, itemPositions, items.length, overscan])

    // Handle scroll
    const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop
      setScrollTop(newScrollTop)
      onScroll?.(newScrollTop)
    }, [onScroll])

    // Handle container resize
    React.useEffect(() => {
      const container = containerRef.current
      if (!container) return

      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (entry) {
          setContainerHeight(entry.contentRect.height)
        }
      })

      resizeObserver.observe(container)
      return () => resizeObserver.disconnect()
    }, [])

    // Initial container height
    React.useEffect(() => {
      const container = containerRef.current
      if (container) {
        setContainerHeight(container.clientHeight)
      }
    }, [])

    return (
      <div
        ref={containerRef}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        <div
          ref={scrollElementRef}
          className="overflow-auto h-full"
          onScroll={handleScroll}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            {visibleRange.startIndex <= visibleRange.endIndex && (
              <div
                style={{
                  position: 'absolute',
                  top: itemPositions[visibleRange.startIndex],
                  left: 0,
                  right: 0
                }}
              >
                {Array.from(
                  { length: visibleRange.endIndex - visibleRange.startIndex + 1 },
                  (_, index) => {
                    const itemIndex = visibleRange.startIndex + index
                    const item = items[itemIndex]
                    const height = typeof itemHeight === 'function' ? itemHeight(itemIndex) : itemHeight
                    
                    return (
                      <div
                        key={itemIndex}
                        style={{ height }}
                        onClick={() => onItemClick?.(item, itemIndex)}
                        className="cursor-pointer"
                      >
                        {renderItem(item, itemIndex)}
                      </div>
                    )
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)
VirtualList.displayName = "VirtualList"

/**
 * VirtualGrid component - Virtual scrolling grid
 * 
 * @param items - Array of items to render
 * @param columns - Number of columns
 * @param itemHeight - Height of each item
 * @param itemWidth - Width of each item
 * @param renderItem - Function to render each item
 * @param gap - Gap between items
 * @param overscan - Number of items to render outside viewport
 * @param onScroll - Callback when scroll position changes
 * @param onItemClick - Callback when item is clicked
 * @param className - Additional CSS classes
 * @returns JSX.Element - Virtual grid component
 * 
 * @example
 * <VirtualGrid 
 *   items={gridItems}
 *   columns={3}
 *   itemHeight={200}
 *   itemWidth={300}
 *   renderItem={(item, index) => <div>{item.name}</div>}
 *   gap={16}
 * />
 */
export const VirtualGrid: React.FC<{
  items: any[]
  columns: number
  itemHeight: number
  itemWidth: number
  renderItem: (item: any, index: number) => React.ReactNode
  gap?: number
  overscan?: number
  onScroll?: (scrollTop: number) => void
  onItemClick?: (item: any, index: number) => void
  className?: string
}> = ({
  items,
  columns,
  itemHeight,
  itemWidth,
  renderItem,
  gap = 0,
  overscan = 5,
  onScroll,
  onItemClick,
  className
}) => {
  const [scrollTop, setScrollTop] = React.useState(0)
  const [containerHeight, setContainerHeight] = React.useState(0)
  const [containerWidth, setContainerWidth] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const scrollElementRef = React.useRef<HTMLDivElement>(null)

  const totalWidth = columns * itemWidth + (columns - 1) * gap
  const rows = Math.ceil(items.length / columns)
  const totalHeight = rows * itemHeight + (rows - 1) * gap

  // Calculate visible range
  const visibleRange = React.useMemo(() => {
    const startRow = Math.floor(scrollTop / (itemHeight + gap))
    const endRow = Math.min(
      rows - 1,
      Math.ceil((scrollTop + containerHeight) / (itemHeight + gap))
    )

    const startIndex = startRow * columns
    const endIndex = Math.min(items.length - 1, (endRow + 1) * columns - 1)

    return {
      startIndex: Math.max(0, startIndex - overscan * columns),
      endIndex: Math.min(items.length - 1, endIndex + overscan * columns)
    }
  }, [scrollTop, containerHeight, itemHeight, gap, rows, items.length, columns, overscan])

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop
    setScrollTop(newScrollTop)
    onScroll?.(newScrollTop)
  }, [onScroll])

  // Handle container resize
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerHeight(entry.contentRect.height)
        setContainerWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
    >
      <div
        ref={scrollElementRef}
        className="overflow-auto h-full"
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, width: totalWidth, position: 'relative' }}>
          {visibleRange.startIndex <= visibleRange.endIndex && (
            <div>
              {Array.from(
                { length: visibleRange.endIndex - visibleRange.startIndex + 1 },
                (_, index) => {
                  const itemIndex = visibleRange.startIndex + index
                  const item = items[itemIndex]
                  const row = Math.floor(itemIndex / columns)
                  const col = itemIndex % columns
                  
                  return (
                    <div
                      key={itemIndex}
                      style={{
                        position: 'absolute',
                        top: row * (itemHeight + gap),
                        left: col * (itemWidth + gap),
                        width: itemWidth,
                        height: itemHeight
                      }}
                      onClick={() => onItemClick?.(item, itemIndex)}
                      className="cursor-pointer"
                    >
                      {renderItem(item, itemIndex)}
                    </div>
                  )
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * VirtualTable component - Virtual scrolling table
 * 
 * @param data - Array of data objects
 * @param columns - Column configuration
 * @param rowHeight - Height of each row
 * @onScroll - Callback when scroll position changes
 * @onRowClick - Callback when row is clicked
 * @className - Additional CSS classes
 * @returns JSX.Element - Virtual table component
 * 
 * @example
 * <VirtualTable 
 *   data={tableData}
 *   columns={columns}
 *   rowHeight={40}
 *   onRowClick={handleRowClick}
 * />
 */
export const VirtualTable: React.FC<{
  data: any[]
  columns: Array<{
    id: string
    header: string
    width?: string
    render: (value: any, row: any) => React.ReactNode
  }>
  rowHeight: number
  onScroll?: (scrollTop: number) => void
  onRowClick?: (row: any, index: number) => void
  className?: string
}> = ({
  data,
  columns,
  rowHeight,
  onScroll,
  onRowClick,
  className
}) => {
  const headerRef = React.useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = React.useState(0)

  React.useEffect(() => {
    const header = headerRef.current
    if (header) {
      setHeaderHeight(header.clientHeight)
    }
  }, [])

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div ref={headerRef} className="bg-muted/50 border-b">
        <div className="flex">
          {columns.map((column) => (
            <div
              key={column.id}
              className="p-3 text-left font-medium text-sm"
              style={{ width: column.width }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Virtual body */}
      <div style={{ height: `calc(100% - ${headerHeight}px)` }}>
        <VirtualList
          items={data}
          itemHeight={rowHeight}
          renderItem={(item, index) => (
            <div className="flex border-b hover:bg-muted/50">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="p-3 text-sm"
                  style={{ width: column.width }}
                >
                  {column.render(item[column.id], item)}
                </div>
              ))}
            </div>
          )}
          onItemClick={onRowClick}
          onScroll={onScroll}
        />
      </div>
    </div>
  )
}

export { VirtualList }
