'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Resizable component - Resizable panel with handles
 * Provides resizable functionality for panels and containers
 * 
 * @param children - Resizable content
 * @param defaultSize - Default size { width, height }
 * @param minWidth - Minimum width
 * @param maxWidth - Maximum width
 * @param minHeight - Minimum height
 * @param maxHeight - Maximum height
 * @param resizableEdges - Which edges are resizable
 * @param onResize - Callback when size changes
 * @param onResizeStart - Callback when resize starts
 * @param onResizeEnd - Callback when resize ends
 * @param className - Additional CSS classes
 * @returns JSX.Element - Resizable component
 * 
 * @example
 * <Resizable 
 *   defaultSize={{ width: 300, height: 200 }}
 *   minWidth={200}
 *   maxWidth={600}
 *   resizableEdges={{ right: true, bottom: true }}
 *   onResize={handleResize}
 * >
 *   <div>Resizable content</div>
 * </Resizable>
 */
interface ResizableProps {
  children: React.ReactNode
  defaultSize?: { width: number; height: number }
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  resizableEdges?: {
    top?: boolean
    right?: boolean
    bottom?: boolean
    left?: boolean
  }
  onResize?: (size: { width: number; height: number }) => void
  onResizeStart?: (size: { width: number; height: number }) => void
  onResizeEnd?: (size: { width: number; height: number }) => void
  className?: string
}

const Resizable = React.forwardRef<HTMLDivElement, ResizableProps>(
  ({ 
    children, 
    defaultSize = { width: 300, height: 200 }, 
    minWidth = 100, 
    maxWidth = 1000, 
    minHeight = 100, 
    maxHeight = 1000, 
    resizableEdges = { right: true, bottom: true }, 
    onResize, 
    onResizeStart, 
    onResizeEnd, 
    className, 
    ...props 
  }, ref) => {
    const [size, setSize] = React.useState(defaultSize)
    const [isResizing, setIsResizing] = React.useState(false)
    const [activeEdge, setActiveEdge] = React.useState<string | null>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const startPos = React.useRef({ x: 0, y: 0 })
    const startSize = React.useRef({ width: 0, height: 0 })

    const handleMouseDown = React.useCallback((e: React.MouseEvent, edge: string) => {
      e.preventDefault()
      e.stopPropagation()
      
      setIsResizing(true)
      setActiveEdge(edge)
      startPos.current = { x: e.clientX, y: e.clientY }
      startSize.current = { ...size }
      
      onResizeStart?.(size)
      
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }, [size, onResizeStart])

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
      if (!isResizing || !activeEdge) return

      const deltaX = e.clientX - startPos.current.x
      const deltaY = e.clientY - startPos.current.y
      
      let newWidth = startSize.current.width
      let newHeight = startSize.current.height

      if (activeEdge.includes('right')) {
        newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.current.width + deltaX))
      }
      if (activeEdge.includes('left')) {
        newWidth = Math.max(minWidth, Math.min(maxWidth, startSize.current.width - deltaX))
      }
      if (activeEdge.includes('bottom')) {
        newHeight = Math.max(minHeight, Math.min(maxHeight, startSize.current.height + deltaY))
      }
      if (activeEdge.includes('top')) {
        newHeight = Math.max(minHeight, Math.min(maxHeight, startSize.current.height - deltaY))
      }

      const newSize = { width: newWidth, height: newHeight }
      setSize(newSize)
      onResize?.(newSize)
    }, [isResizing, activeEdge, minWidth, maxWidth, minHeight, maxHeight, onResize])

    const handleMouseUp = React.useCallback(() => {
      setIsResizing(false)
      setActiveEdge(null)
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      
      onResizeEnd?.(size)
    }, [size, onResizeEnd])

    React.useEffect(() => {
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }, [handleMouseMove, handleMouseUp])

    return (
      <div
        ref={containerRef}
        className={cn("relative", className)}
        style={{ width: size.width, height: size.height }}
        {...props}
      >
        {children}
        
        {/* Resize handles */}
        {resizableEdges.top && (
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-2 cursor-ns-resize",
              "hover:bg-primary/20 transition-colors"
            )}
            onMouseDown={(e) => handleMouseDown(e, 'top')}
          />
        )}
        
        {resizableEdges.right && (
          <div
            className={cn(
              "absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize",
              "hover:bg-primary/20 transition-colors"
            )}
            onMouseDown={(e) => handleMouseDown(e, 'right')}
          />
        )}
        
        {resizableEdges.bottom && (
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize",
              "hover:bg-primary/20 transition-colors"
            )}
            onMouseDown={(e) => handleMouseDown(e, 'bottom')}
          />
        )}
        
        {resizableEdges.left && (
          <div
            className={cn(
              "absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize",
              "hover:bg-primary/20 transition-colors"
            )}
            onMouseDown={(e) => handleMouseDown(e, 'left')}
          />
        )}
        
        {/* Corner handles */}
        {resizableEdges.top && resizableEdges.left && (
          <div
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize hover:bg-primary/20 transition-colors"
            onMouseDown={(e) => handleMouseDown(e, 'top-left')}
          />
        )}
        
        {resizableEdges.top && resizableEdges.right && (
          <div
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize hover:bg-primary/20 transition-colors"
            onMouseDown={(e) => handleMouseDown(e, 'top-right')}
          />
        )}
        
        {resizableEdges.bottom && resizableEdges.left && (
          <div
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize hover:bg-primary/20 transition-colors"
            onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}
          />
        )}
        
        {resizableEdges.bottom && resizableEdges.right && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize hover:bg-primary/20 transition-colors"
            onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}
          />
        )}
      </div>
    )
  }
)
Resizable.displayName = "Resizable"

/**
 * ResizablePanel component - Resizable panel with split view
 * 
 * @param children - Panel content
 * @param defaultSize - Default panel size
 * @param minSize - Minimum panel size
 * @param maxSize - Maximum panel size
 * @param direction - Resize direction: 'horizontal' | 'vertical'
 * @param onResize - Callback when panel size changes
 * @param className - Additional CSS classes
 * @returns JSX.Element - Resizable panel
 * 
 * @example
 * <ResizablePanel 
 *   defaultSize={300}
 *   minSize={200}
 *   maxSize={500}
 *   direction="horizontal"
 *   onResize={handleResize}
 * >
 *   <div>Panel content</div>
 * </ResizablePanel>
 */
export const ResizablePanel: React.FC<{
  children: React.ReactNode
  defaultSize?: number
  minSize?: number
  maxSize?: number
  direction?: 'horizontal' | 'vertical'
  onResize?: (size: number) => void
  className?: string
}> = ({
  children,
  defaultSize = 300,
  minSize = 100,
  maxSize = 800,
  direction = 'horizontal',
  onResize,
  className
}) => {
  const [size, setSize] = React.useState(defaultSize)
  const [isResizing, setIsResizing] = React.useState(false)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const startPos = React.useRef(0)
  const startSize = React.useRef(0)

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    setIsResizing(true)
    startPos.current = direction === 'horizontal' ? e.clientX : e.clientY
    startSize.current = size
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [direction, size])

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isResizing) return

    const delta = direction === 'horizontal' ? e.clientX - startPos.current : e.clientY - startPos.current
    const newSize = Math.max(minSize, Math.min(maxSize, startSize.current + delta))
    
    setSize(newSize)
    onResize?.(newSize)
  }, [isResizing, direction, minSize, maxSize, onResize])

  const handleMouseUp = React.useCallback(() => {
    setIsResizing(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove])

  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div
      ref={panelRef}
      className={cn("relative flex", className)}
      style={{
        [direction === 'horizontal' ? 'width' : 'height']: `${size}px`,
        flexDirection: direction === 'horizontal' ? 'row' : 'column'
      }}
    >
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      
      {/* Resize handle */}
      <div
        className={cn(
          "flex-shrink-0",
          direction === 'horizontal' 
            ? "w-1 cursor-ew-resize hover:bg-primary/20" 
            : "h-1 cursor-ns-resize hover:bg-primary/20",
          "transition-colors"
        )}
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}

/**
 * SplitPane component - Split pane with resizable divider
 * 
 * @param children - Two children: left/top and right/bottom
 * @param defaultSplit - Default split position (percentage)
 * @param minSize - Minimum size for each pane
 * @param direction - Split direction: 'horizontal' | 'vertical'
 * @onSplitChange - Callback when split position changes
 * @param className - Additional CSS classes
 * @returns JSX.Element - Split pane
 * 
 * @example
 * <SplitPane 
 *   defaultSplit={30}
 *   direction="horizontal"
 *   onSplitChange={handleSplitChange}
 * >
 *   <div>Left pane</div>
 *   <div>Right pane</div>
 * </SplitPane>
 */
export const SplitPane: React.FC<{
  children: [React.ReactNode, React.ReactNode]
  defaultSplit?: number
  minSize?: number
  direction?: 'horizontal' | 'vertical'
  onSplitChange?: (split: number) => void
  className?: string
}> = ({
  children: [firstChild, secondChild],
  defaultSplit = 50,
  minSize = 10,
  direction = 'horizontal',
  onSplitChange,
  className
}) => {
  const [split, setSplit] = React.useState(defaultSplit)
  const [isResizing, setIsResizing] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const startPos = React.useRef(0)
  const startSplit = React.useRef(0)

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    setIsResizing(true)
    startPos.current = direction === 'horizontal' ? e.clientX : e.clientY
    startSplit.current = split
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [direction, split])

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return

    const containerSize = direction === 'horizontal' 
      ? containerRef.current.clientWidth 
      : containerRef.current.clientHeight
    
    const delta = direction === 'horizontal' ? e.clientX - startPos.current : e.clientY - startPos.current
    const newSplit = Math.max(minSize, Math.min(100 - minSize, startSplit.current + (delta / containerSize) * 100))
    
    setSplit(newSplit)
    onSplitChange?.(newSplit)
  }, [isResizing, direction, minSize, onSplitChange])

  const handleMouseUp = React.useCallback(() => {
    setIsResizing(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove])

  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex",
        direction === 'horizontal' ? "flex-row" : "flex-col",
        className
      )}
    >
      <div 
        className="overflow-hidden"
        style={{ 
          [direction === 'horizontal' ? 'width' : 'height']: `${split}%` 
        }}
      >
        {firstChild}
      </div>
      
      {/* Divider */}
      <div
        className={cn(
          "flex-shrink-0 bg-border",
          direction === 'horizontal' 
            ? "w-1 cursor-ew-resize hover:bg-primary/20" 
            : "h-1 cursor-ns-resize hover:bg-primary/20",
          "transition-colors"
        )}
        onMouseDown={handleMouseDown}
      />
      
      <div 
        className="flex-1 overflow-hidden"
        style={{ 
          [direction === 'horizontal' ? 'width' : 'height']: `${100 - split}%` 
        }}
      >
        {secondChild}
      </div>
    </div>
  )
}

export { Resizable }
