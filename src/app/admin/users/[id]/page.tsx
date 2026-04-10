'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Ban, CheckCircle, Mail, Phone, Calendar,
  Building2, Heart, ShieldCheck, UserCog, Loader2, MapPin, Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/admin/status-badge'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { format, differenceInDays } from 'date-fns'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'

interface UserDetail {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  isBanned: boolean
  banReason: string | null
  createdAt: string
  updatedAt: string
  avatarUrl: string | null
  _count: { listings: number; favorites: number }
}

interface Listing {
  id: string
  title: string
  category: string
  location: string
  price: number
  priceUnit: string
  tier: string
  status: string
  isFeatured: boolean
  imageUrl: string
  createdAt: string
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserDetail | null>(null)
  const [listings, setListings] = useState<Listing[]>([])

  // Dialog states
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [banLoading, setBanLoading] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/admin/users/${id}`)
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setListings(data.listings || [])
          setNewRole(data.user.role)
        } else {
          toast.error('Failed to load user')
        }
      } catch {
        toast.error('Failed to load user')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  async function handleToggleBan() {
    if (!user) return
    const isBanning = !user.isBanned
    if (isBanning && !banReason.trim()) {
      toast.error('Please provide a ban reason')
      return
    }
    setBanLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isBanned: isBanning,
          banReason: isBanning ? banReason : undefined,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setUser((prev) =>
          prev ? { ...prev, isBanned: data.user.isBanned, banReason: data.user.banReason } : null
        )
        toast.success(isBanning ? 'User banned' : 'User unbanned')
        setBanDialogOpen(false)
        setBanReason('')
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
    if (!user || !newRole) return
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) {
        setUser((prev) => (prev ? { ...prev, role: newRole } : null))
        toast.success(`Role changed to ${newRole}`)
        setRoleDialogOpen(false)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to change role')
      }
    } catch {
      toast.error('Failed to change role')
    }
  }

  const activeDays = user ? differenceInDays(new Date(), new Date(user.createdAt)) : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">User not found</p>
        <Button variant="outline" onClick={() => router.push('/admin/users')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/users')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Button>
      </div>

      {/* User Info Card */}
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          {/* Avatar */}
          <Avatar className="w-20 h-20 shrink-0">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback className="bg-green-100 text-green-700 text-xl font-bold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <StatusBadge status={user.role} />
              <StatusBadge status={user.isBanned ? 'banned' : 'active'} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
              <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                <Mail className="w-4 h-4" /> {user.email}
              </span>
              <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                <Phone className="w-4 h-4" /> {user.phone || 'Not provided'}
              </span>
              <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                <Calendar className="w-4 h-4" /> Member since {format(new Date(user.createdAt), 'MMM dd, yyyy')}
              </span>
            </div>

            {user.isBanned && user.banReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-lg">
                <p className="text-xs font-semibold text-red-600 mb-1">Ban Reason</p>
                <p className="text-sm text-red-700">{user.banReason}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
              {user.role !== 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRoleDialogOpen(true)
                    setNewRole(user.role)
                  }}
                  className="gap-2"
                >
                  <UserCog className="w-4 h-4" /> Edit Role
                </Button>
              )}
              <Button
                variant={user.isBanned ? 'outline' : 'destructive'}
                size="sm"
                onClick={() => {
                  setBanDialogOpen(true)
                  setBanReason('')
                }}
                className={!user.isBanned ? 'gap-2' : 'gap-2 border-green-300 text-green-700 hover:bg-green-50'}
              >
                {user.isBanned ? (
                  <><CheckCircle className="w-4 h-4" /> Unban User</>
                ) : (
                  <><Ban className="w-4 h-4" /> Ban User</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{user._count.listings}</p>
            <p className="text-sm text-gray-500">Total Listings</p>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{user._count.favorites}</p>
            <p className="text-sm text-gray-500">Total Favorites</p>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {user.isBanned ? 'Banned' : `${activeDays} days`}
            </p>
            <p className="text-sm text-gray-500">
              {user.isBanned ? 'Account Status' : 'Active for'}
            </p>
          </div>
        </div>
      </div>

      {/* User's Listings */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">User&apos;s Listings ({listings.length})</h2>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No listings yet</p>
            <p className="text-sm text-gray-400 mt-1">This user hasn&apos;t created any listings.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <button
                  key={listing.id}
                  onClick={() => router.push(`/admin/listings/${listing.id}`)}
                  className="rounded-lg border overflow-hidden text-left hover:shadow-md transition-shadow group"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1">
                      <StatusBadge status={listing.status} className="text-[10px]" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{listing.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#006633]">
                        K{listing.price.toLocaleString()}<span className="font-normal text-gray-400">/{listing.priceUnit}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {listing.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {listing.category}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ban/Unban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={(open) => { if (!open) { setBanDialogOpen(false); setBanReason('') } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {user.isBanned ? 'Unban User' : 'Ban User'}
            </DialogTitle>
            <DialogDescription>
              {user.isBanned
                ? `Are you sure you want to unban ${user.name}? They will regain full access to the platform.`
                : `Ban ${user.name} from the platform. They will lose access until unbanned.`}
            </DialogDescription>
          </DialogHeader>

          {!user.isBanned && (
            <div className="space-y-2">
              <Label htmlFor="detail-ban-reason">Ban Reason <span className="text-red-500">*</span></Label>
              <Textarea
                id="detail-ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter the reason for banning this user..."
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setBanDialogOpen(false); setBanReason('') }}>
              Cancel
            </Button>
            <Button
              className={
                user.isBanned
                  ? 'bg-[#006633] hover:bg-[#004d26] text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }
              onClick={handleToggleBan}
              disabled={!user.isBanned && !banReason.trim()}
            >
              {banLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {user.isBanned ? 'Unban User' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={(open) => { if (!open) setRoleDialogOpen(false) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for <span className="font-semibold text-gray-900">{user.name}</span>.
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
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#006633] hover:bg-[#004d26] text-white"
              onClick={handleRoleChange}
              disabled={newRole === user.role}
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
