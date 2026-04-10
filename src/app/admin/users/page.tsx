'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Search, MoreHorizontal, Ban, CheckCircle, Trash2, Edit, Eye,
  ShieldCheck, UserCog, Loader2,
} from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { StatusBadge } from '@/components/admin/status-badge'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { EmptyState } from '@/components/admin/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  Tooltip, TooltipTrigger, TooltipContent,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { format, differenceInDays } from 'date-fns'

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  isBanned: boolean
  banReason: string | null
  createdAt: string
  avatarUrl: string | null
  _count: { listings: number; favorites: number }
}

interface BanDialogData {
  userId: string
  userName: string
  isBanned: boolean
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog states
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [banDialog, setBanDialog] = useState<BanDialogData | null>(null)
  const [banReason, setBanReason] = useState('')
  const [banLoading, setBanLoading] = useState(false)
  const [roleDialog, setRoleDialog] = useState<{ userId: string; userName: string; currentRole: string } | null>(null)
  const [newRole, setNewRole] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (search) params.set('search', search)
      if (roleFilter !== 'all') params.set('role', roleFilter)
      if (statusFilter !== 'all') params.set('banned', statusFilter === 'active' ? 'false' : 'true')

      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, statusFilter, page, limit])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, roleFilter, statusFilter])

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('User deleted successfully')
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete user')
      }
    } catch {
      toast.error('Failed to delete user')
    }
  }

  async function handleBan() {
    if (!banDialog) return
    setBanLoading(true)
    try {
      const isBanning = !banDialog.isBanned
      const res = await fetch(`/api/admin/users/${banDialog.userId}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isBanned: isBanning,
          banReason: isBanning ? banReason || 'No reason provided' : undefined,
        }),
      })
      if (res.ok) {
        toast.success(isBanning ? 'User banned' : 'User unbanned')
        setBanDialog(null)
        setBanReason('')
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update ban status')
      }
    } catch {
      toast.error('Failed to update ban status')
    } finally {
      setBanLoading(false)
    }
  }

  async function handleRoleChange() {
    if (!roleDialog || !newRole) return
    try {
      const res = await fetch(`/api/admin/users/${roleDialog.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) {
        toast.success(`Role changed to ${newRole}`)
        setRoleDialog(null)
        setNewRole('')
        fetchUsers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to change role')
      }
    } catch {
      toast.error('Failed to change role')
    }
  }

  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage user accounts and permissions" icon={Users} />

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
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
                <TableHead className="w-12">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden lg:table-cell">Email</TableHead>
                <TableHead className="hidden xl:table-cell">Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="hidden sm:table-cell text-center">Listings</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" /></TableCell>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <EmptyState
                      icon={Users}
                      title="No users found"
                      description="No users match your current filters. Try adjusting your search criteria."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50/50">
                    {/* Avatar */}
                    <TableCell>
                      <Avatar className="w-8 h-8">
                        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>

                    {/* Name */}
                    <TableCell>
                      <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                      <p className="text-sm text-muted-foreground lg:hidden">{user.email}</p>
                      <p className="text-sm text-muted-foreground xl:hidden">
                        {user.phone || '—'}
                      </p>
                    </TableCell>

                    {/* Email */}
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="hidden xl:table-cell text-sm text-gray-600">
                      {user.phone || '—'}
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <StatusBadge status={user.role} />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {user.isBanned && user.banReason ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <StatusBadge status="banned" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium text-red-400">Ban reason:</p>
                            <p>{user.banReason}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <StatusBadge status="active" />
                      )}
                    </TableCell>

                    {/* Joined */}
                    <TableCell className="hidden md:table-cell text-sm text-gray-500">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </TableCell>

                    {/* Listings count */}
                    <TableCell className="hidden sm:table-cell text-center">
                      <span className="text-sm font-semibold text-gray-700">{user._count.listings}</span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                            <Eye className="w-4 h-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setBanDialog({
                                userId: user.id,
                                userName: user.name,
                                isBanned: user.isBanned,
                              })
                              setBanReason('')
                            }}
                          >
                            {user.isBanned ? (
                              <><CheckCircle className="w-4 h-4 mr-2" /> Unban User</>
                            ) : (
                              <><Ban className="w-4 h-4 mr-2" /> Ban User</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setRoleDialog({
                                userId: user.id,
                                userName: user.name,
                                currentRole: user.role,
                              })
                              setNewRole(user.role)
                            }}
                          >
                            <UserCog className="w-4 h-4 mr-2" /> Change Role
                          </DropdownMenuItem>
                          {user.role !== 'admin' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setDeleteId(user.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Showing {from} to {to} of {total} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Ban/Unban Dialog */}
      <Dialog open={!!banDialog} onOpenChange={(open) => { if (!open) { setBanDialog(null); setBanReason('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {banDialog?.isBanned ? 'Unban User' : 'Ban User'}
            </DialogTitle>
            <DialogDescription>
              {banDialog?.isBanned
                ? `Are you sure you want to unban ${banDialog.userName}? They will regain full access to the platform.`
                : `Ban ${banDialog.userName} from the platform. They will lose access until unbanned.`}
            </DialogDescription>
          </DialogHeader>

          {!banDialog?.isBanned && (
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Ban Reason <span className="text-red-500">*</span></Label>
              <Textarea
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter the reason for banning this user..."
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setBanDialog(null); setBanReason('') }}>
              Cancel
            </Button>
            <Button
              className={
                banDialog?.isBanned
                  ? 'bg-[#006633] hover:bg-[#004d26] text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
              onClick={handleBan}
              disabled={!banDialog?.isBanned && !banReason.trim()}
            >
              {banLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {banDialog?.isBanned ? 'Unban User' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={!!roleDialog} onOpenChange={(open) => { if (!open) setRoleDialog(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for <span className="font-semibold text-gray-900">{roleDialog?.userName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    User
                  </span>
                </SelectItem>
                <SelectItem value="admin">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    Admin
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog(null)}>
              Cancel
            </Button>
            <Button
              className="bg-[#006633] hover:bg-[#004d26] text-white"
              onClick={handleRoleChange}
              disabled={newRole === roleDialog?.currentRole}
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete User"
        description="Are you sure you want to delete this user? This will remove all their data including favorites. Their listings will become orphaned. This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          if (deleteId) handleDelete(deleteId)
        }}
      />
    </div>
  )
}
