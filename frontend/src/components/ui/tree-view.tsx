'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from "lucide-react"

/**
 * TreeView component - Hierarchical tree structure
 * Provides accessible tree navigation with expand/collapse
 * 
 * @param items - Tree items data
 * @onSelect - Callback when item is selected
 * @onExpand - Callback when node is expanded/collapsed
 * @selectedId - Currently selected item ID
 * @expandedIds - Array of expanded node IDs
 * @showIcons - Whether to show folder/file icons
 * @className - Additional CSS classes
 * @returns JSX.Element - Tree view component
 * 
 * @example
 * <TreeView 
 *   items={treeData} 
 *   onSelect={handleSelect}
 *   selectedId={selectedId}
 *   expandedIds={expandedIds}
 * />
 */
interface TreeItem {
  id: string
  label: string
  children?: TreeItem[]
  icon?: React.ReactNode
  isFolder?: boolean
  disabled?: boolean
}

interface TreeViewProps {
  items: TreeItem[]
  onSelect?: (item: TreeItem) => void
  onExpand?: (item: TreeItem, expanded: boolean) => void
  selectedId?: string
  expandedIds?: string[]
  showIcons?: boolean
  className?: string
}

const TreeViewContext = React.createContext<{
  selectedId?: string
  onSelect?: (item: TreeItem) => void
  onExpand?: (item: TreeItem, expanded: boolean) => void
  expandedIds: string[]
  showIcons: boolean
}>({
  expandedIds: [],
  showIcons: true
})

const TreeView = React.forwardRef<HTMLDivElement, TreeViewProps>(
  ({ 
    items, 
    onSelect, 
    onExpand, 
    selectedId, 
    expandedIds = [], 
    showIcons = true, 
    className, 
    ...props 
  }, ref) => {
    const [internalExpandedIds, setInternalExpandedIds] = React.useState<string[]>(expandedIds)
    const [focusedIndex, setFocusedIndex] = React.useState(-1)

    const currentExpandedIds = expandedIds || internalExpandedIds

    const handleSelect = React.useCallback((item: TreeItem) => {
      if (item.disabled) return
      onSelect?.(item)
    }, [onSelect])

    const handleExpand = React.useCallback((item: TreeItem, expanded: boolean) => {
      if (item.disabled) return
      
      if (expandedIds) {
        onExpand?.(item, expanded)
      } else {
        setInternalExpandedIds(prev => 
          expanded 
            ? [...prev, item.id]
            : prev.filter(id => id !== item.id)
        )
        onExpand?.(item, expanded)
      }
    }, [expandedIds, onExpand])

    const handleKeyDown = (e: KeyboardEvent) => {
      const treeItems = document.querySelectorAll('[data-tree-item]')
      const currentIndex = Array.from(treeItems).findIndex(item => 
        item === document.activeElement
      )

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          if (currentIndex < treeItems.length - 1) {
            (treeItems[currentIndex + 1] as HTMLElement)?.focus()
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          if (currentIndex > 0) {
            (treeItems[currentIndex - 1] as HTMLElement)?.focus()
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (currentIndex >= 0) {
            const item = treeItems[currentIndex] as HTMLElement
            const itemId = item.dataset.treeId
            const treeItem = findTreeItem(items, itemId!)
            if (treeItem?.children && treeItem.children.length > 0) {
              if (!currentExpandedIds.includes(treeItem.id)) {
                handleExpand(treeItem, true)
              }
            }
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (currentIndex >= 0) {
            const item = treeItems[currentIndex] as HTMLElement
            const itemId = item.dataset.treeId
            const treeItem = findTreeItem(items, itemId!)
            if (treeItem?.children && treeItem.children.length > 0) {
              if (currentExpandedIds.includes(treeItem.id)) {
                handleExpand(treeItem, false)
              }
            }
          }
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (currentIndex >= 0) {
            const item = treeItems[currentIndex] as HTMLElement
            const itemId = item.dataset.treeId
            const treeItem = findTreeItem(items, itemId!)
            if (treeItem) {
              if (treeItem.children && treeItem.children.length > 0) {
                handleExpand(treeItem, !currentExpandedIds.includes(treeItem.id))
              }
              handleSelect(treeItem)
            }
          }
          break
      }
    }

    React.useEffect(() => {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [items, currentExpandedIds])

    const contextValue = React.useMemo(() => ({
      selectedId,
      onSelect: handleSelect,
      onExpand: handleExpand,
      expandedIds: currentExpandedIds,
      showIcons
    }), [selectedId, handleSelect, handleExpand, currentExpandedIds, showIcons])

    return (
      <TreeViewContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn("w-full", className)}
          role="tree"
          {...props}
        >
          {items.map((item, index) => (
            <TreeItemComponent key={item.id} item={item} level={0} />
          ))}
        </div>
      </TreeViewContext.Provider>
    )
  }
)
TreeView.displayName = "TreeView"

/**
 * TreeItemComponent component - Individual tree item
 */
interface TreeItemComponentProps {
  item: TreeItem
  level: number
}

const TreeItemComponent: React.FC<TreeItemComponentProps> = ({ item, level }) => {
  const { selectedId, onSelect, onExpand, expandedIds, showIcons } = React.useContext(TreeViewContext)
  const isExpanded = expandedIds.includes(item.id)
  const isSelected = selectedId === item.id
  const hasChildren = item.children && item.children.length > 0

  const handleClick = () => {
    if (item.disabled) return
    
    if (hasChildren) {
      onExpand?.(item, !isExpanded)
    }
    onSelect?.(item)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const renderIcon = () => {
    if (!showIcons) return null

    if (item.icon) {
      return item.icon
    }

    if (item.isFolder !== false && hasChildren) {
      return isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
    }

    return <File className="w-4 h-4" />
  }

  return (
    <div className="select-none">
      <div
        data-tree-item
        data-tree-id={item.id}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-disabled={item.disabled}
        tabIndex={item.disabled ? -1 : 0}
        className={cn(
          "flex items-center py-1 px-2 rounded-md cursor-pointer",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isSelected && "bg-accent text-accent-foreground",
          item.disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {hasChildren && (
          <div className="mr-1">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        )}

        {renderIcon()}

        <span className="ml-2 text-sm">{item.label}</span>
      </div>

      {hasChildren && isExpanded && (
        <div role="group">
          {item.children?.map(child => (
            <TreeItemComponent key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Helper function to find tree item by ID
 */
function findTreeItem(items: TreeItem[], id: string): TreeItem | undefined {
  for (const item of items) {
    if (item.id === id) {
      return item
    }
    if (item.children) {
      const found = findTreeItem(item.children, id)
      if (found) return found
    }
  }
  return undefined
}

/**
 * TreeViewSearch component - Searchable tree view
 * 
 * @param items - Tree items data
 * @param searchValue - Current search value
 * @param onSearchChange - Callback when search changes
 * @param onSelect - Callback when item is selected
 * @param onExpand - Callback when node is expanded/collapsed
 * @param selectedId - Currently selected item ID
 * @param expandedIds - Array of expanded node IDs
 * @param className - Additional CSS classes
 * @returns JSX.Element - Searchable tree view
 * 
 * @example
 * <TreeViewSearch 
 *   items={treeData} 
 *   searchValue={search}
 *   onSearchChange={setSearch}
 *   onSelect={handleSelect}
 * />
 */
export const TreeViewSearch: React.FC<{
  items: TreeItem[]
  searchValue: string
  onSearchChange: (value: string) => void
  onSelect?: (item: TreeItem) => void
  onExpand?: (item: TreeItem, expanded: boolean) => void
  selectedId?: string
  expandedIds?: string[]
  className?: string
}> = ({
  items,
  searchValue,
  onSearchChange,
  onSelect,
  onExpand,
  selectedId,
  expandedIds,
  className
}) => {
  const filteredItems = React.useMemo(() => {
    if (!searchValue) return items

    const filterItems = (items: TreeItem[]): TreeItem[] => {
      return items.reduce<TreeItem[]>((acc, item) => {
        const matchesSearch = item.label.toLowerCase().includes(searchValue.toLowerCase())
        const filteredChildren = item.children ? filterItems(item.children) : []
        
        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            ...item,
            children: filteredChildren.length > 0 ? filteredChildren : item.children
          })
        }
        
        return acc
      }, [])
    }

    return filterItems(items)
  }, [items, searchValue])

  return (
    <div className={cn("space-y-2", className)}>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search tree..."
        className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />
      
      <TreeView
        items={filteredItems}
        onSelect={onSelect}
        onExpand={onExpand}
        selectedId={selectedId}
        expandedIds={expandedIds}
      />
    </div>
  )
}

/**
 * TreeViewActions component - Actions for tree view
 * 
 * @param children - Action buttons
 * @param className - Additional CSS classes
 * @returns JSX.Element - Tree view actions
 * 
 * @example
 * <TreeViewActions>
 *   <button onClick={handleExpandAll}>Expand All</button>
 *   <button onClick={handleCollapseAll}>Collapse All</button>
 * </TreeViewActions>
 */
export const TreeViewActions: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({
  children,
  className
}) => {
  return (
    <div className={cn("flex space-x-2 p-2 border-b", className)}>
      {children}
    </div>
  )
}

export { TreeView, TreeViewContext }
