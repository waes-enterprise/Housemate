'use client'

import { useEffect, useState, useCallback } from 'react'
import { Activity, Search, Clock } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { StatusBadge } from '@/components/admin/status-badge'
import { EmptyState } from '@/components/admin/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'

interface ActivityLogItem {
  id: string
  action: string
  details: string | null
  ipAddress: string | null
  createdAt: string
  user: { id: string; name: string; email: string } | null
}

// Action types as stored in the database
const actionTypes = [
  { value: 'admin_login', label: 'Login' },
  { value: 'admin_create_listing', label: 'Create Listing' },
  { value: 'admin_update_listing', label: 'Update Listing' },
  { value: 'admin_delete_listing', label: 'Delete Listing' },
  { value: 'admin_update_listing_status', label: 'Update Listing Status' },
  { value: 'admin_toggle_featured', label: 'Toggle Featured' },
  { value: 'admin_create_category', label: 'Create Category' },
  { value: 'admin_update_category', label: 'Update Category' },
  { value: 'admin_delete_category', label: 'Delete Category' },
  { value: 'admin_update_user', label: 'Update User' },
  { value: 'admin_ban_user', label: 'Ban User' },
  { value: 'admin_unban_user', label: 'Unban User' },
  { value: 'admin_delete_user', label: 'Delete User' },
  { value: 'admin_update_settings', label: 'Update Settings' },
]

function formatAction(action: string): string {
  return action
    .replace(/^admin_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function parseDetails(details: string | null): Record<string, unknown> | null {
  if (!details) return null
  try {
    const parsed = JSON.parse(details)
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

function DetailsCell({ details }: { details: string | null }) {
  const parsed = parseDetails(details)

  if (!details) return <span className="text-muted-foreground">—</span>

  if (parsed) {
    const entries = Object.entries(parsed)
    return (
      <div className="flex flex-wrap gap-1 max-w-xs">
        {entries.slice(0, 3).map(([key, value]) => (
          <Badge key={key} variant="outline" className="text-xs font-mono py-0">
            {key}: {String(value).length > 20 ? String(value).slice(0, 20) + '...' : String(value)}
          </Badge>
        ))}
        {entries.length > 3 && (
          <Badge variant="secondary" className="text-xs py-0">
            +{entries.length - 3} more
          </Badge>
        )}
      </div>
    )
  }

  return <span className="text-sm text-muted-foreground truncate block max-w-xs">{details}</span>
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (actionFilter !== 'all') params.set('action', actionFilter)

      const res = await fetch(`/api/admin/activity?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
        setTotalPages(data.totalPages || 1)
        setTotal(data.total || 0)
      }
    } catch {
      console.error('Failed to fetch activity logs')
    } finally {
      setLoading(false)
    }
  }, [actionFilter, page])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Client-side search filter for details
  const filteredLogs = search.trim()
    ? logs.filter((log) => {
        const searchLower = search.toLowerCase()
        // Search in details
        if (log.details && log.details.toLowerCase().includes(searchLower)) return true
        // Search in user name/email
        if (log.user) {
          if (log.user.name.toLowerCase().includes(searchLower)) return true
          if (log.user.email.toLowerCase().includes(searchLower)) return true
        }
        // Search in action
        if (log.action.toLowerCase().includes(searchLower)) return true
        return false
      })
    : logs

  return (
    <div className="space-y-6">
      <PageHeader title="Activity Log" description="Track all administrative actions and system events" icon={Activity} />

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search in details, user, or action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1) }}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actionTypes.map((action) => (
                <SelectItem key={action.value} value={action.value}>{action.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden lg:table-cell">Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="hidden md:table-cell">Details</TableHead>
                <TableHead className="hidden lg:table-cell">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                  </TableRow>
                ))
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState
                      icon={Clock}
                      title="No activity found"
                      description={search ? 'Try adjusting your search terms.' : 'Activity logs will appear here when actions are performed.'}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.user?.name || 'System'}
                        </p>
                        {log.user?.email && (
                          <p className="text-xs text-muted-foreground">{log.user.email}</p>
                        )}
                        <p className="text-xs text-muted-foreground lg:hidden">
                          {format(new Date(log.createdAt), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge type="action" value={log.action} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <DetailsCell details={log.details} />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground font-mono">
                      {log.ipAddress || '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">{total} log entries total</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
