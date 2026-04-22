'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * DragDropContext component - Drag and drop context provider
 * Provides drag and drop functionality for components
 * 
 * @param children - Child components
 * @param onDragStart - Callback when drag starts
 * @param onDragEnd - Callback when drag ends
 * @param onDrop - Callback when item is dropped
 * @param className - Additional CSS classes
 * @returns JSX.Element - Drag drop context
 * 
 * @example
 * <DragDropContext onDrop={handleDrop}>
 *   <DraggableItem id="item1">Drag me</DraggableItem>
 *   <DroppableZone id="zone1">Drop here</DroppableZone>
 * </DragDropContext>
 */
interface DragDropContextProps {
  children: React.ReactNode
  onDragStart?: (itemId: string) => void
  onDragEnd?: (itemId: string) => void
  onDrop?: (itemId: string, zoneId: string) => void
  className?: string
}

const DragDropContext = React.forwardRef<HTMLDivElement, DragDropContextProps>(
  ({ children, onDragStart, onDragEnd, onDrop, className, ...props }, ref) => {
    const [draggedItem, setDraggedItem] = React.useState<string | null>(null)
    const [dragOverZone, setDragOverZone] = React.useState<string | null>(null)

    const handleDragStart = (itemId: string) => {
      setDraggedItem(itemId)
      onDragStart?.(itemId)
    }

    const handleDragEnd = (itemId: string) => {
      setDraggedItem(null)
      setDragOverZone(null)
      onDragEnd?.(itemId)
    }

    const handleDrop = (zoneId: string) => {
      if (draggedItem) {
        onDrop?.(draggedItem, zoneId)
        handleDragEnd(draggedItem)
      }
    }

    const handleDragOver = (zoneId: string) => {
      setDragOverZone(zoneId)
    }

    const handleDragLeave = () => {
      setDragOverZone(null)
    }

    const contextValue = React.useMemo(() => ({
      draggedItem,
      dragOverZone,
      handleDragStart,
      handleDragEnd,
      handleDrop,
      handleDragOver,
      handleDragLeave
    }), [draggedItem, dragOverZone])

    return (
      <DragDropContextValue.Provider value={contextValue}>
        <div ref={ref} className={cn("relative", className)} {...props}>
          {children}
        </div>
      </DragDropContextValue.Provider>
    )
  }
)
DragDropContext.displayName = "DragDropContext"

const DragDropContextValue = React.createContext<{
  draggedItem: string | null
  dragOverZone: string | null
  handleDragStart: (itemId: string) => void
  handleDragEnd: (itemId: string) => void
  handleDrop: (zoneId: string) => void
  handleDragOver: (zoneId: string) => void
  handleDragLeave: () => void
}>({
  draggedItem: null,
  dragOverZone: null,
  handleDragStart: () => {},
  handleDragEnd: () => {},
  handleDrop: () => {},
  handleDragOver: () => {},
  handleDragLeave: () => {}
})

/**
 * DraggableItem component - Item that can be dragged
 * 
 * @param id - Unique identifier for the item
 * @param children - Item content
 * @param disabled - Whether dragging is disabled
 * @param dragHandle - Whether to show drag handle
 * @param className - Additional CSS classes
 * @returns JSX.Element - Draggable item
 * 
 * @example
 * <DraggableItem id="item1" dragHandle>
 *   <div>Drag me by the handle</div>
 * </DraggableItem>
 */
interface DraggableItemProps {
  id: string
  children: React.ReactNode
  disabled?: boolean
  dragHandle?: boolean
  className?: string
}

const DraggableItem = React.forwardRef<HTMLDivElement, DraggableItemProps>(
  ({ id, children, disabled = false, dragHandle = false, className, ...props }, ref) => {
    const { handleDragStart, handleDragEnd, draggedItem } = React.useContext(DragDropContextValue)
    const [isDragging, setIsDragging] = React.useState(false)

    const handleDragStartInternal = (e: React.DragEvent) => {
      if (disabled) return
      
      setIsDragging(true)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', id)
      handleDragStart(id)
    }

    const handleDragEndInternal = () => {
      setIsDragging(false)
      handleDragEnd(id)
    }

    const isBeingDragged = draggedItem === id

    return (
      <div
        ref={ref}
        draggable={!disabled && !dragHandle}
        onDragStart={handleDragStartInternal}
        onDragEnd={handleDragEndInternal}
        className={cn(
          "relative transition-all duration-200",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && !dragHandle && "cursor-move",
          isBeingDragged && "opacity-50 scale-95",
          isDragging && "scale-105 shadow-lg",
          className
        )}
        {...props}
      >
        {dragHandle && (
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-muted/50 cursor-move flex items-center justify-center">
            <div className="w-1 h-4 bg-muted-foreground/30 rounded-full" />
          </div>
        )}
        
        <div className={dragHandle ? "ml-4" : ""}>
          {children}
        </div>
      </div>
    )
  }
)
DraggableItem.displayName = "DraggableItem"

/**
 * DroppableZone component - Zone where items can be dropped
 * 
 * @param id - Unique identifier for the zone
 * @param children - Zone content
 * @param disabled - Whether dropping is disabled
 * @param acceptTypes - Array of accepted item types
 * @param className - Additional CSS classes
 * @returns JSX.Element - Droppable zone
 * 
 * @example
 * <DroppableZone id="zone1" disabled={false}>
 *   <div>Drop items here</div>
 * </DroppableZone>
 */
interface DroppableZoneProps {
  id: string
  children: React.ReactNode
  disabled?: boolean
  acceptTypes?: string[]
  className?: string
}

const DroppableZone = React.forwardRef<HTMLDivElement, DroppableZoneProps>(
  ({ id, children, disabled = false, acceptTypes, className, ...props }, ref) => {
    const { 
      handleDrop, 
      handleDragOver, 
      handleDragLeave, 
      draggedItem, 
      dragOverZone 
    } = React.useContext(DragDropContextValue)

    const isDragOver = dragOverZone === id
    const canDrop = !disabled && draggedItem && (!acceptTypes || acceptTypes.includes(draggedItem))

    const handleDragOverInternal = (e: React.DragEvent) => {
      if (!canDrop) return
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      handleDragOver(id)
    }

    const handleDropInternal = (e: React.DragEvent) => {
      if (!canDrop) return
      e.preventDefault()
      handleDrop(id)
    }

    const handleDragLeaveInternal = (e: React.DragEvent) => {
      // Only handle drag leave if leaving the zone itself
      if (e.currentTarget === e.target) {
        handleDragLeave()
      }
    }

    return (
      <div
        ref={ref}
        onDragOver={handleDragOverInternal}
        onDrop={handleDropInternal}
        onDragLeave={handleDragLeaveInternal}
        className={cn(
          "relative transition-all duration-200",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "min-h-[100px]",
          isDragOver && canDrop && "bg-accent/50 border-2 border-dashed border-primary",
          !isDragOver && canDrop && "border-2 border-dashed border-muted-foreground/30",
          className
        )}
        {...props}
      >
        {children}
        
        {isDragOver && canDrop && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm font-medium">
              Drop here
            </div>
          </div>
        )}
      </div>
    )
  }
)
DroppableZone.displayName = "DroppableZone"

/**
 * SortableList component - List with sortable items
 * 
 * @param items - Array of items
 * @param onReorder - Callback when items are reordered
 * @param renderItem - Function to render each item
 * @param disabled - Whether sorting is disabled
 * @param className - Additional CSS classes
 * @returns JSX.Element - Sortable list
 * 
 * @example
 * <SortableList 
 *   items={listItems}
 *   onReorder={setItems}
 *   renderItem={(item, index) => <div>{item.name}</div>}
 * />
 */
export const SortableList: React.FC<{
  items: any[]
  onReorder: (items: any[]) => void
  renderItem: (item: any, index: number) => React.ReactNode
  disabled?: boolean
  className?: string
}> = ({
  items,
  onReorder,
  renderItem,
  disabled = false,
  className
}) => {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  const handleDragStart = (index: number) => {
    if (disabled) return
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    if (disabled) return
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (index: number) => {
    if (disabled || draggedIndex === null) return
    setDragOverIndex(index)
  }

  const handleDrop = (index: number) => {
    if (disabled || draggedIndex === null || draggedIndex === index) return
    
    const newItems = [...items]
    const draggedItem = newItems[draggedIndex]
    newItems.splice(draggedIndex, 1)
    newItems.splice(index, 0, draggedItem)
    
    onReorder(newItems)
    handleDragEnd()
  }

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <div
          key={item.id || index}
          className={cn(
            "transition-all duration-200",
            draggedIndex === index && "opacity-50 scale-95",
            dragOverIndex === index && "border-t-2 border-primary pt-2"
          )}
        >
          <div
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
            onDragOver={() => handleDragOver(index)}
            onDrop={() => handleDrop(index)}
            className={cn(
              "cursor-move",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {renderItem(item, index)}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * FileDropZone component - Drop zone for files
 * 
 * @param onFilesDrop - Callback when files are dropped
 * @param accept - Accepted file types
 * @param multiple - Whether multiple files are allowed
 * @param disabled - Whether dropping is disabled
 * @param className - Additional CSS classes
 * @returns JSX.Element - File drop zone
 * 
 * @example
 * <FileDropZone 
 *   onFilesDrop={handleFiles}
 *   accept=".jpg,.png,.pdf"
 *   multiple
 * />
 */
export const FileDropZone: React.FC<{
  onFilesDrop: (files: File[]) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
  className?: string
}> = ({
  onFilesDrop,
  accept,
  multiple = true,
  disabled = false,
  className
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (!multiple) {
      files.length = 1
    }
    
    onFilesDrop(files)
  }

  const handleClick = () => {
    if (disabled) return
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const files = Array.from(e.target.files || [])
    onFilesDrop(files)
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "hover:border-primary hover:bg-accent/50",
        isDragOver && !disabled && "border-primary bg-accent/50",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <div className="space-y-2">
        <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        <div>
          <p className="text-sm font-medium">
            {isDragOver ? 'Drop files here' : 'Drop files here or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {accept ? `Accepted: ${accept}` : 'All files accepted'}
          </p>
        </div>
      </div>
    </div>
  )
}

export { DragDropContext, DraggableItem, DroppableZone }
