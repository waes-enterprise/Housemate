'use client'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface DataTableColumn<T> {
  /** Unique key used for the table header label */
  key: string
  /** Column header label */
  label: string
  /** Optional CSS class for the header cell */
  headerClassName?: string
  /** Optional CSS class for body cells */
  className?: string
  /** Custom render function for the cell */
  render?: (row: T, rowIndex: number) => React.ReactNode
}

interface DataTableProps<T> {
  /** Column definitions */
  columns: DataTableColumn<T>[]
  /** Array of row data */
  data: T[]
  /** Unique key accessor — either a string (property name) or a function */
  rowKey?: string | ((row: T) => string)
  /** Show skeleton loading state */
  isLoading?: boolean
  /** Number of skeleton rows to show */
  skeletonRows?: number
  /** Message to show when data is empty */
  emptyMessage?: string
  /** Additional CSS class for the table wrapper */
  className?: string
}

export function DataTable<T>({
  columns,
  data,
  rowKey = 'id',
  isLoading = false,
  skeletonRows = 5,
  emptyMessage = 'No data found',
  className,
}: DataTableProps<T>) {
  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === 'function') return rowKey(row)
    const record = row as Record<string, unknown>
    return String(record[rowKey] ?? index)
  }

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.headerClassName}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton loading rows
              Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                <TableRow key={`skeleton-${rowIdx}`}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Empty state row
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 text-gray-400 text-sm"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              data.map((row, rowIndex) => (
                <TableRow key={getRowKey(row, rowIndex)}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render
                        ? col.render(row, rowIndex)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
