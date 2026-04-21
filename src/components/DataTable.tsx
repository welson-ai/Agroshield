import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Column<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  pagination?: {
    enabled: boolean;
    pageSize: number;
  };
  actions?: {
    view?: (row: T) => void;
    edit?: (row: T) => void;
    delete?: (row: T) => void;
    custom?: Array<{
      label: string;
      onClick: (row: T) => void;
      icon?: React.ReactNode;
    }>;
  };
  onRefresh?: () => void;
  onExport?: () => void;
  emptyState?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
  };
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  pagination = { enabled: true, pageSize: 10 },
  actions,
  onRefresh,
  onExport,
  emptyState
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(column => {
          const value = row[column.key];
          return value && 
                 value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row =>
          row[key] && row[key].toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        const comparison = aValue > bValue ? 1 : -1;
        return sortConfig.direction === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [data, searchTerm, filters, sortConfig, columns]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pagination.pageSize);
  const startIndex = (currentPage - 1) * pagination.pageSize;
  const paginatedData = pagination.enabled 
    ? processedData.slice(startIndex, startIndex + pagination.pageSize)
    : processedData;

  const handleSort = (key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getUniqueValues = (key: keyof T) => {
    const values = new Set(data.map(row => row[key]).filter(Boolean));
    return Array.from(values);
  };

  const renderCellValue = (column: Column<T>, row: T) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    // Auto-format common types
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    if (typeof value === 'number' && column.key.toString().toLowerCase().includes('amount')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    }
    
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }
    
    return value?.toString() || '-';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Data Table</CardTitle>
          <div className="flex gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex gap-4">
          {searchable && (
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          )}
          
          {columns.filter(col => col.filterable).map(column => (
            <div key={column.key.toString()} className="w-32">
              <select
                value={filters[column.key.toString()] || ''}
                onChange={(e) => handleFilter(column.key.toString(), e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All {column.title}</option>
                {getUniqueValues(column.key).map(value => (
                  <option key={value.toString()} value={value.toString()}>
                    {value.toString()}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {processedData.length === 0 ? (
          <div className="text-center py-8">
            {emptyState?.icon || <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />}
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {emptyState?.title || 'No data found'}
            </h3>
            <p className="text-gray-600">
              {emptyState?.description || 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {columns.map(column => (
                      <th
                        key={column.key.toString()}
                        className={`text-left p-3 font-medium text-gray-700 ${
                          column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''
                        }`}
                        style={{ width: column.width }}
                        onClick={() => column.sortable && handleSort(column.key)}
                      >
                        <div className="flex items-center gap-1">
                          {column.title}
                          {column.sortable && (
                            <div className="flex flex-col">
                              <ChevronUp 
                                className={`w-3 h-3 ${
                                  sortConfig.key === column.key && sortConfig.direction === 'asc'
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                                }`}
                              />
                              <ChevronDown 
                                className={`w-3 h-3 -mt-1 ${
                                  sortConfig.key === column.key && sortConfig.direction === 'desc'
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                                }`}
                              />
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                    {actions && <th className="text-left p-3 font-medium text-gray-700 w-20">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      {columns.map(column => (
                        <td key={column.key.toString()} className="p-3">
                          {renderCellValue(column, row)}
                        </td>
                      ))}
                      {actions && (
                        <td className="p-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.view && (
                                <DropdownMenuItem onClick={() => actions.view!(row)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                              )}
                              {actions.edit && (
                                <DropdownMenuItem onClick={() => actions.edit!(row)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {actions.custom?.map((action, index) => (
                                <DropdownMenuItem key={index} onClick={() => action.onClick(row)}>
                                  {action.icon}
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                              {actions.view && actions.edit && <DropdownMenuSeparator />}
                              {actions.delete && (
                                <DropdownMenuItem 
                                  onClick={() => actions.delete!(row)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.enabled && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + pagination.pageSize, processedData.length)} of {processedData.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2">...</span>
                        <Button
                          variant={currentPage === totalPages ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
