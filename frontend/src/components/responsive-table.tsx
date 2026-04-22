'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  Edit,
  Trash
} from 'lucide-react'

/**
 * ResponsiveTable component - Mobile-optimized table component
 * Provides responsive table with mobile card view on small screens
 * 
 * @param data - Table data array
 * @param columns - Table column configuration
 * @param className - Additional CSS classes for styling
 * @ searchable - Whether to show search functionality
 * @param sortable - Whether to enable column sorting
 * @param pagination - Pagination configuration
 * @param actions - Row action buttons
 * @returns JSX.Element - Responsive table component
 * 
 * @example
 * <ResponsiveTable 
 *   data={tableData} 
 *   columns={tableColumns}
 *   searchable={true}
 *   pagination={{ pageSize: 10 }}
 * />
 */
interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
  mobilePriority?: 'high' | 'medium' | 'low'
}

interface PaginationConfig {
  pageSize?: number
  showPageSizeSelector?: boolean
  pageSizeOptions?: number[]
}

interface RowAction {
  label: string
  icon: React.ReactNode
  onClick: (row: any) => void
  variant?: 'default' | 'destructive'
}

interface ResponsiveTableProps {
  data: any[]
  columns: TableColumn[]
  className?: string
  searchable?: boolean
  sortable?: boolean
  pagination?: PaginationConfig
  actions?: RowAction[]
}

export function ResponsiveTable({
  data,
  columns,
  className,
  searchable = false,
  sortable = false,
  pagination,
  actions
}: ResponsiveTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10)

  // Filter data based on search term
  const filteredData = data.filter(row => {
    if (!searchTerm) return true
    return columns.some(column => {
      const value = row[column.key]
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    })
  })

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortable) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortColumn, sortDirection, sortable])

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData

    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (columnKey: string) => {
    if (!sortable) return

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1)
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Search and Filter Bar */}
      {(searchable || sortable) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
          {sortable && (
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={cn(
                          'text-left p-4 font-medium text-sm text-muted-foreground',
                          column.sortable && sortable && 'cursor-pointer hover:text-foreground',
                          column.mobilePriority === 'low' && 'hidden xl:table-cell'
                        )}
                        onClick={() => column.sortable && handleSort(column.key)}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{column.label}</span>
                          {column.sortable && sortable && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </div>
                      </th>
                    ))}
                    {actions && (
                      <th className="text-right p-4 font-medium text-sm text-muted-foreground">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            'p-4 text-sm',
                            column.mobilePriority === 'low' && 'hidden xl:table-cell'
                          )}
                        >
                          {column.render ? column.render(row[column.key], row) : row[column.key]}
                        </td>
                      ))}
                      {actions && (
                        <td className="p-4 text-right">
                          <ResponsiveRowActions actions={actions} row={row} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {paginatedData.map((row, index) => (
          <MobileTableRow
            key={index}
            row={row}
            columns={columns}
            actions={actions}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <ResponsivePagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={pagination.pageSizeOptions || [10, 25, 50]}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showPageSizeSelector={pagination.showPageSizeSelector || false}
        />
      )}
    </div>
  )
}

/**
 * MobileTableRow component - Mobile card representation of table row
 * Displays table row as a card on mobile devices
 * 
 * @param row - Row data
 * @param columns - Column configuration
 * @param actions - Row actions
 * @returns JSX.Element - Mobile table row card
 */
function MobileTableRow({ 
  row, 
  columns, 
  actions 
}: { 
  row: any; 
  columns: TableColumn[]; 
  actions?: RowAction[] 
}) {
  const [showActions, setShowActions] = useState(false)

  const highPriorityColumns = columns.filter(col => 
    col.mobilePriority !== 'low'
  )

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* High Priority Fields */}
          {highPriorityColumns.map((column) => (
            <div key={column.key} className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">
                {column.label}
              </span>
              <span className="text-sm text-right ml-2 flex-1">
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </span>
            </div>
          ))}

          {/* Actions */}
          {actions && (
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="w-full justify-between"
              >
                Actions
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {showActions && (
                <div className="mt-2 space-y-2">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => action.onClick(row)}
                      className="w-full justify-start"
                    >
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * ResponsiveRowActions component - Row action buttons
 * Provides action buttons with mobile-friendly layout
 * 
 * @param actions - Action configuration
 * @param row - Row data
 * @returns JSX.Element - Row actions
 */
function ResponsiveRowActions({ 
  actions, 
  row 
}: { 
  actions: RowAction[]; 
  row: any 
}) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {showDropdown && (
        <div className="absolute right-0 top-8 bg-background border border-border rounded-lg shadow-lg z-50 min-w-48">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={() => {
                action.onClick(row)
                setShowDropdown(false)
              }}
              className={cn(
                'w-full justify-start',
                action.variant === 'destructive' && 'text-destructive hover:text-destructive'
              )}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * ResponsivePagination component - Mobile-friendly pagination
 * Provides pagination controls optimized for mobile devices
 * 
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param pageSize - Current page size
 * @param pageSizeOptions - Available page size options
 * @param onPageChange - Callback when page changes
 * @param onPageSizeChange - Callback when page size changes
 * @param showPageSizeSelector - Whether to show page size selector
 * @returns JSX.Element - Responsive pagination
 */
function ResponsivePagination({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector
}: {
  currentPage: number
  totalPages: number
  pageSize: number
  pageSizeOptions: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  showPageSizeSelector: boolean
}) {
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (currentPage + delta < totalPages) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
      <div className="flex items-center space-x-2">
        {showPageSizeSelector && (
          <>
            <span className="text-sm text-muted-foreground">Show</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-input rounded px-2 py-1 text-sm bg-background"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-sm text-muted-foreground">per page</span>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className="min-w-8"
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default ResponsiveTable
