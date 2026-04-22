'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Table component - Accessible data table
 * Provides keyboard navigation and screen reader support
 * 
 * @param children - Table content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Table component
 * 
 * @example
 * <Table>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Name</TableHead>
 *       <TableHead>Email</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>John Doe</TableCell>
 *       <TableCell>john@example.com</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </Table>
 */
interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full overflow-auto">
        <table
          ref={ref}
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        >
          {children}
        </table>
      </div>
    )
  }
)
Table.displayName = "Table"

/**
 * TableHeader component - Table header section
 * 
 * @param children - Header content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Table header
 */
interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props}>
      {children}
    </thead>
  )
)
TableHeader.displayName = "TableHeader"

/**
 * TableBody component - Table body section
 * 
 * @param children - Body content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Table body
 */
interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    >
      {children}
    </tbody>
  )
)
TableBody.displayName = "TableBody"

/**
 * TableFooter component - Table footer section
 * 
 * @param children - Footer content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Table footer
 */
interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, children, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    >
      {children}
    </tfoot>
  )
)
TableFooter.displayName = "TableFooter"

/**
 * TableRow component - Table row
 * 
 * @param children - Row content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Table row
 */
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
)
TableRow.displayName = "TableRow"

/**
 * TableHead component - Table header cell
 * 
 * @param children - Header content
 * @param className - Additional CSS classes
 * @param sortable - Whether column is sortable
 * @param sortDirection - Current sort direction
 * @param onSort - Callback when sort is requested
 * @returns JSX.Element - Table head
 */
interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
  sortable?: boolean
  sortDirection?: 'asc' | 'desc' | null
  onSort?: () => void
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable = false, sortDirection, onSort, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onSort?.()
      }
    }

    return (
      <th
        ref={ref}
        className={cn(
          "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
          sortable && "cursor-pointer hover:text-foreground",
          className
        )}
        {...props}
        onClick={sortable ? onSort : undefined}
        onKeyDown={sortable ? handleKeyDown : undefined}
        role={sortable ? "button" : undefined}
        tabIndex={sortable ? 0 : undefined}
        aria-sort={sortable ? (sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none') : undefined}
      >
        <div className="flex items-center space-x-2">
          {children}
          {sortable && (
            <span className="text-muted-foreground">
              {sortDirection === 'asc' ? '·' : sortDirection === 'desc' ? '·' : '·'}
            </span>
          )}
        </div>
      </th>
    )
  }
)
TableHead.displayName = "TableHead"

/**
 * TableCell component - Table data cell
 * 
 * @param children - Cell content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Table cell
 */
interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    >
      {children}
    </td>
  )
)
TableCell.displayName = "TableCell"

/**
 * TableCaption component - Table caption
 * 
 * @param children - Caption content
 * @param className - Additional CSS classes
 * @returns JSX.Element - Table caption
 */
interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  children: React.ReactNode
}

const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, children, ...props }, ref) => (
    <caption
      ref={ref}
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </caption>
  )
)
TableCaption.displayName = "TableCaption"

/**
 * TableCheckbox component - Checkbox for table row selection
 * 
 * @param checked - Whether checkbox is checked
 * @param onCheckedChange - Callback when checkbox state changes
 * @param indeterminate - Whether checkbox is indeterminate
 * @param className - Additional CSS classes
 * @returns JSX.Element - Table checkbox
 */
export const TableCheckbox: React.FC<{
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  indeterminate?: boolean
  className?: string
}> = ({
  checked = false,
  onCheckedChange,
  indeterminate = false,
  className
}) => {
  const checkboxRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      className={cn(
        "h-4 w-4 rounded border border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      aria-label="Select row"
    />
  )
}

/**
 * TableActions component - Actions for table row
 * 
 * @param children - Action buttons
 * @param className - Additional CSS classes
 * @returns JSX.Element - Table actions
 */
export const TableActions: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({
  children,
  className
}) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {children}
    </div>
  )
}

/**
 * TableEmpty component - Empty state for table
 * 
 * @param message - Empty message
 * @param icon - Optional icon
 * @param className - Additional CSS classes
 * @returns JSX.Element - Table empty state
 */
export const TableEmpty: React.FC<{
  message: string
  icon?: React.ReactNode
  className?: string
}> = ({
  message,
  icon,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
      {icon && <div className="text-muted-foreground mb-2">{icon}</div>}
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

/**
 * TableLoading component - Loading state for table
 * 
 * @param message - Loading message
 * @param className - Additional CSS classes
 * @returns JSX.Element - Table loading state
 */
export const TableLoading: React.FC<{
  message?: string
  className?: string
}> = ({
  message = "Loading...",
  className
}) => {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <div className="flex items-center space-x-2">
        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
        <span className="text-muted-foreground">{message}</span>
      </div>
    </div>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
}
