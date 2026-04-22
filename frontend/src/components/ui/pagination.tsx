'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

/**
 * Pagination component - Accessible page navigation
 * Provides keyboard navigation and screen reader support
 * 
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param onPageChange - Callback when page changes
 * @param showFirstLast - Whether to show first/last buttons
 * @param showPrevNext - Whether to show prev/next buttons
 * @param siblingCount - Number of sibling pages to show
 * @param className - Additional CSS classes
 * @returns JSX.Element - Pagination component
 * 
 * @example
 * <Pagination 
 *   currentPage={1} 
 *   totalPages={10} 
 *   onPageChange={setPage}
 *   showFirstLast
 * />
 */
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
  showPrevNext?: boolean
  siblingCount?: number
  className?: string
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    showFirstLast = true, 
    showPrevNext = true, 
    siblingCount = 1, 
    className, 
    ...props 
  }, ref) => {
    const [focusedIndex, setFocusedIndex] = React.useState(0)

    const handleKeyDown = (e: React.KeyboardEvent, index: number, page?: number) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          if (index > 0) {
            const prevIndex = index - 1
            setFocusedIndex(prevIndex)
            const prevButton = e.currentTarget.parentElement?.children[prevIndex] as HTMLElement
            prevButton?.focus()
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          const totalButtons = React.Children.count(e.currentTarget.parentElement?.children)
          if (index < totalButtons - 1) {
            const nextIndex = index + 1
            setFocusedIndex(nextIndex)
            const nextButton = e.currentTarget.parentElement?.children[nextIndex] as HTMLElement
            nextButton?.focus()
          }
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (page !== undefined) {
            onPageChange(page)
          }
          break
      }
    }

    const generatePageNumbers = () => {
      const pages = []
      const startPage = Math.max(1, currentPage - siblingCount)
      const endPage = Math.min(totalPages, currentPage + siblingCount)

      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) {
          pages.push('ellipsis')
        }
      }

      // Add page range
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('ellipsis')
        }
        pages.push(totalPages)
      }

      return pages
    }

    const pages = generatePageNumbers()
    let buttonIndex = 0

    return (
      <div
        ref={ref}
        role="navigation"
        aria-label="Pagination navigation"
        className={cn("flex items-center justify-center space-x-1", className)}
        {...props}
      >
        {/* First page button */}
        {showFirstLast && (
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              currentPage === 1 
                ? "text-muted-foreground cursor-not-allowed" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="Go to first page"
            aria-disabled={currentPage === 1}
            onKeyDown={(e) => handleKeyDown(e, buttonIndex++, 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            <ChevronLeft className="h-4 w-4 -ml-2" />
          </button>
        )}

        {/* Previous page button */}
        {showPrevNext && (
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              currentPage === 1 
                ? "text-muted-foreground cursor-not-allowed" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
            aria-disabled={currentPage === 1}
            onKeyDown={(e) => handleKeyDown(e, buttonIndex++, currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Page numbers */}
        {pages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <div
                key={`ellipsis-${index}`}
                className="inline-flex items-center justify-center w-8 h-8 text-sm font-medium text-muted-foreground"
                aria-hidden="true"
              >
                <MoreHorizontal className="h-4 w-4" />
              </div>
            )
          }

          const pageNumber = page as number
          const isActive = pageNumber === currentPage

          return (
            <button
              key={pageNumber}
              type="button"
              className={cn(
                "inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => onPageChange(pageNumber)}
              aria-current={isActive}
              aria-label={`Go to page ${pageNumber}`}
              onKeyDown={(e) => handleKeyDown(e, buttonIndex++, pageNumber)}
            >
              {pageNumber}
            </button>
          )
        })}

        {/* Next page button */}
        {showPrevNext && (
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              currentPage === totalPages 
                ? "text-muted-foreground cursor-not-allowed" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
            aria-disabled={currentPage === totalPages}
            onKeyDown={(e) => handleKeyDown(e, buttonIndex++, currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Last page button */}
        {showFirstLast && (
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              currentPage === totalPages 
                ? "text-muted-foreground cursor-not-allowed" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
            aria-disabled={currentPage === totalPages}
            onKeyDown={(e) => handleKeyDown(e, buttonIndex++, totalPages)}
          >
            <ChevronRight className="h-4 w-4" />
            <ChevronRight className="h-4 w-4 -ml-2" />
          </button>
        )}
      </div>
    )
  }
)
Pagination.displayName = "Pagination"

/**
 * PaginationInfo component - Shows current page information
 * 
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @param totalItems - Total number of items
 * @param itemsPerPage - Items per page
 * @param className - Additional CSS classes
 * @returns JSX.Element - Pagination info
 * 
 * @example
 * <PaginationInfo 
 *   currentPage={1} 
 *   totalPages={10} 
 *   totalItems={100} 
 *   itemsPerPage={10}
 * />
 */
export const PaginationInfo: React.FC<{
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  className?: string
}> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      Showing {startItem} to {endItem} of {totalItems} results
    </div>
  )
}

/**
 * PaginationSelect component - Page size selector
 * 
 * @param pageSize - Current page size
 * @param onPageSizeChange - Callback when page size changes
 * @param options - Available page size options
 * @param className - Additional CSS classes
 * @returns JSX.Element - Pagination select
 * 
 * @example
 * <PaginationSelect 
 *   pageSize={10} 
 *   onPageSizeChange={setPageSize}
 *   options={[10, 25, 50, 100]}
 * />
 */
export const PaginationSelect: React.FC<{
  pageSize: number
  onPageSizeChange: (size: number) => void
  options: number[]
  className?: string
}> = ({
  pageSize,
  onPageSizeChange,
  options,
  className
}) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <span className="text-sm text-muted-foreground">Items per page:</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export { Pagination }
