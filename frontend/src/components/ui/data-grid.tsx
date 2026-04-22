'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import { ChevronLeft, ChevronRight, Search, Filter, Download } from "lucide-react"

/**
 * DataGrid component - Advanced data table with sorting, filtering, pagination
 * Provides enterprise-grade data grid functionality
 * 
 * @param data - Array of data objects
 * @param columns - Column configuration
 * @loading - Whether data is loading
 * @onSort - Callback when sorting changes
 * @onFilter - Callback when filtering changes
 * @onPageChange - Callback when page changes
 * @onRowClick - Callback when row is clicked
 * @onSelectionChange - Callback when selection changes
 * @sortable - Whether columns are sortable
 * @filterable - Whether columns are filterable
 * @selectable - Whether rows are selectable
 * @pagination - Pagination configuration
 * @className - Additional CSS classes
 * @returns JSX.Element - Data grid component
 * 
 * @example
 * <DataGrid 
 *   data={tableData}
 *   columns={columns}
 *   loading={isLoading}
 *   onSort={handleSort}
 *   onFilter={handleFilter}
 *   onPageChange={handlePageChange}
 *   sortable
 *   filterable
 *   selectable
 *   pagination={{ pageSize: 10, currentPage: 1, totalItems: 100 }}
 * />
 */
interface DataGridColumn {
  id: string
  header: string
  accessor: string | ((data: any) => any)
  sortable?: boolean
  filterable?: boolean
  width?: string
  minWidth?: string
  align?: 'left' | 'center' | 'right'
  format?: (value: any) => React.ReactNode
}

interface DataGridProps {
  data: any[]
  columns: DataGridColumn[]
  loading?: boolean
  onSort?: (columnId: string, direction: 'asc' | 'desc') => void
  onFilter?: (columnId: string, value: string) => void
  onPageChange?: (page: number, pageSize: number) => void
  onRowClick?: (row: any, index: number) => void
  onSelectionChange?: (selectedRows: any[]) => void
  sortable?: boolean
  filterable?: boolean
  selectable?: boolean
  pagination?: {
    pageSize: number
    currentPage: number
    totalItems: number
  }
  className?: string
}

const DataGrid = React.forwardRef<HTMLDivElement, DataGridProps>(
  ({ 
    data, 
    columns, 
    loading = false, 
    onSort, 
    onFilter, 
    onPageChange, 
    onRowClick, 
    onSelectionChange, 
    sortable = false, 
    filterable = false, 
    selectable = false, 
    pagination,
    className, 
    ...props 
  }, ref) => {
    const [sortColumn, setSortColumn] = React.useState<string | null>(null)
    const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')
    const [filters, setFilters] = React.useState<Record<string, string>>({})
    const [selectedRows, setSelectedRows] = React.useState<Set<number | string>>(new Set())
    const [searchTerm, setSearchTerm] = React.useState('')

    const handleSort = (columnId: string) => {
      if (!sortable) return
      
      const newDirection = sortColumn === columnId && sortDirection === 'asc' ? 'desc' : 'asc'
      setSortColumn(columnId)
      setSortDirection(newDirection)
      onSort?.(columnId, newDirection)
    }

    const handleFilter = (columnId: string, value: string) => {
      if (!filterable) return
      
      const newFilters = { ...filters, [columnId]: value }
      if (!value) delete newFilters[columnId]
      setFilters(newFilters)
      onFilter?.(columnId, value)
    }

    const handleRowSelection = (index: number | string, checked: boolean) => {
      const newSelected = new Set(selectedRows)
      if (checked) {
        newSelected.add(index)
      } else {
        newSelected.delete(index)
      }
      setSelectedRows(newSelected)
      
      const selectedData = Array.from(newSelected).map(idx => 
        typeof idx === 'number' ? data[idx] : data.find(d => d.id === idx)
      ).filter(Boolean)
      onSelectionChange?.(selectedData)
    }

    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        const allIndexes = data.map((_, index) => index)
        setSelectedRows(new Set(allIndexes))
        onSelectionChange?.(data)
      } else {
        setSelectedRows(new Set())
        onSelectionChange?.([])
      }
    }

    const getCellValue = (row: any, column: DataGridColumn) => {
      const value = typeof column.accessor === 'function' 
        ? column.accessor(row) 
        : row[column.accessor]
      
      return column.format ? column.format(value) : value
    }

    const filteredData = React.useMemo(() => {
      let filtered = data
      
      // Apply search
      if (searchTerm) {
        filtered = filtered.filter(row =>
          columns.some(column => {
            const value = getCellValue(row, column)
            return String(value).toLowerCase().includes(searchTerm.toLowerCase())
          })
        )
      }
      
      // Apply column filters
      Object.entries(filters).forEach(([columnId, filterValue]) => {
        if (filterValue) {
          filtered = filtered.filter(row => {
            const column = columns.find(c => c.id === columnId)
            if (!column) return true
            const value = getCellValue(row, column)
            return String(value).toLowerCase().includes(filterValue.toLowerCase())
          })
        }
      })
      
      // Apply sorting
      if (sortColumn) {
        const column = columns.find(c => c.id === sortColumn)
        if (column) {
          filtered = [...filtered].sort((a, b) => {
            const aValue = getCellValue(a, column)
            const bValue = getCellValue(b, column)
            
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
            return 0
          })
        }
      }
      
      return filtered
    }, [data, searchTerm, filters, sortColumn, sortDirection, columns])

    const paginatedData = React.useMemo(() => {
      if (!pagination) return filteredData
      
      const startIndex = (pagination.currentPage - 1) * pagination.pageSize
      const endIndex = startIndex + pagination.pageSize
      return filteredData.slice(startIndex, endIndex)
    }, [filteredData, pagination])

    return (
      <div ref={ref} className={cn("w-full space-y-4", className)} {...props}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {searchTerm && (
              <div className="text-sm text-muted-foreground">
                {filteredData.length} results
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  {selectable && (
                    <th className="w-12 p-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === data.length && data.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-border"
                      />
                    </th>
                  )}
                  
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      className={cn(
                        "p-3 text-left font-medium text-sm",
                        column.align === 'center' && "text-center",
                        column.align === 'right' && "text-right",
                        sortable && column.sortable && "cursor-pointer hover:bg-muted/80"
                      )}
                      style={{ 
                        width: column.width, 
                        minWidth: column.minWidth 
                      }}
                      onClick={() => sortable && column.sortable && handleSort(column.id)}
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.header}</span>
                        {sortable && column.sortable && sortColumn === column.id && (
                          <span className="text-muted-foreground">
                            {sortDirection === 'asc' ? '·' : '·'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-8 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-8 text-center">
                      <div className="text-sm text-muted-foreground">
                        No data available
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className={cn(
                        "border-b hover:bg-muted/50 cursor-pointer",
                        selectedRows.has(index) && "bg-muted"
                      )}
                      onClick={() => onRowClick?.(row, index)}
                    >
                      {selectable && (
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(index)}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleRowSelection(index, e.target.checked)
                            }}
                            className="rounded border-border"
                          />
                        </td>
                      )}
                      
                      {columns.map((column) => (
                        <td
                          key={column.id}
                          className={cn(
                            "p-3 text-sm",
                            column.align === 'center' && "text-center",
                            column.align === 'right' && "text-right"
                          )}
                        >
                          {getCellValue(row, column)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.currentPage - 1, pagination.pageSize)}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.ceil(pagination.totalItems / pagination.pageSize) }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange?.(page, pagination.pageSize)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.currentPage + 1, pagination.pageSize)}
                disabled={pagination.currentPage === Math.ceil(pagination.totalItems / pagination.pageSize)}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }
)
DataGrid.displayName = "DataGrid"

export { DataGrid }
