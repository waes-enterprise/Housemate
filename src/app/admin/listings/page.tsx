'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2, Plus, Search, Star, StarOff, MoreHorizontal,
  Trash2, Edit, Eye, ArrowUpDown, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { StatusBadge } from '@/components/admin/status-badge'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { EmptyState } from '@/components/admin/empty-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface ListingOwner {
  id: string
  name: string
  email: string
}

interface Listing {
  id: string
  title: string
  description: string
  category: string
  location: string
  price: number
  priceUnit: string
  tier: string
  status: string
  isFeatured: boolean
  imageUrl: string
  createdAt: string
  owner: ListingOwner | null
  categoryRef?: { name: string }
  _count: { favorites: number }
}

export default function AdminListingsPage() {
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [tierFilter, setTierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteTitle, setDeleteTitle] = useState('')

  const LIMIT = 10

  const fetchListings = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: String(LIMIT),
      })
      if (search) params.set('search', search)
      if (categoryFilter !== 'all') params.set('category', categoryFilter)
      if (tierFilter !== 'all') params.set('tier', tierFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res = await fetch(`/api/admin/listings?${params}`)
      if (res.ok) {
        const data = await res.json()
        setListings(data.listings || [])
        setTotal(data.total || 0)
        setPage(data.page || 1)
        setTotalPages(data.totalPages || 0)
      }
    } catch {
      toast.error('Failed to fetch listings')
    } finally {
      setLoading(false)
    }
  }, [search, categoryFilter, tierFilter, statusFilter])

  useEffect(() => {
    fetchListings(1)
  }, [fetchListings])

  function handleSearch() {
    setSearch(searchInput)
    setPage(1)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput)
        setPage(1)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  async function handleDelete() {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/listings/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Listing deleted successfully')
        fetchListings(page)
      } else {
        toast.error('Failed to delete listing')
      }
    } catch {
      toast.error('Failed to delete listing')
    }
  }

  async function handleToggleFeatured(id: string) {
    try {
      const res = await fetch(`/api/admin/listings/${id}/feature`, { method: 'PATCH' })
      if (res.ok) {
        toast.success('Featured status updated')
        fetchListings(page)
      } else {
        toast.error('Failed to update featured status')
      }
    } catch {
      toast.error('Failed to update featured status')
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/listings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success(`Status changed to ${status}`)
        fetchListings(page)
      } else {
        toast.error('Failed to update status')
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const categories = [
    'Rooms', 'Farms', 'Offices', 'Storage', 'Event Spaces',
    'Garages', 'Warehouses', 'Land', 'Shops', 'Parking', 'Other',
  ]

  const tiers = ['standard', 'featured', 'spotlight', 'premium']
  const statuses = ['active', 'pending', 'rejected', 'archived']

  // Page number generation
  function getPageNumbers() {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  const startIdx = total > 0 ? (page - 1) * LIMIT + 1 : 0
  const endIdx = Math.min(page * LIMIT, total)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Listings"
        description="Manage all property listings on the platform"
        icon={Building2}
        action={
          <Button
            onClick={() => router.push('/admin/listings/create')}
            className="bg-[#006633] hover:bg-[#004d26] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Listing
          </Button>
        }
      />

      {/* Filters Row */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search listings..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>

          {/* Category */}
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Tier */}
          <Select value={tierFilter} onValueChange={(v) => setTierFilter(v)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {tiers.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
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
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[70px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Featured</TableHead>
                <TableHead className="hidden xl:table-cell">Created</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-10 w-14 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-36" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-8" /></TableCell>
                    <TableCell className="hidden xl:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10}>
                    <EmptyState
                      icon={Building2}
                      title="No listings found"
                      description="Try adjusting your search or filters to find what you're looking for."
                      action={
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchInput('')
                            setSearch('')
                            setCategoryFilter('all')
                            setTierFilter('all')
                            setStatusFilter('all')
                          }}
                        >
                          Clear Filters
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((listing) => (
                  <TableRow key={listing.id} className="hover:bg-slate-50">
                    {/* Image */}
                    <TableCell>
                      {listing.imageUrl ? (
                        <img
                          src={listing.imageUrl}
                          alt={listing.title}
                          className="w-[60px] h-[40px] rounded-lg object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-[60px] h-[40px] rounded-lg bg-gray-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </TableCell>

                    {/* Title */}
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate max-w-[200px]">
                          {listing.title.length > 40 ? listing.title.slice(0, 40) + '...' : listing.title}
                        </p>
                        <p className="text-xs text-gray-400 md:hidden">{listing.category}</p>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs font-medium">
                        {listing.category}
                      </Badge>
                    </TableCell>

                    {/* Location */}
                    <TableCell className="hidden lg:table-cell text-sm text-gray-600">
                      {listing.location.length > 25 ? listing.location.slice(0, 25) + '...' : listing.location}
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <span className="text-sm font-bold text-gray-900">
                        K{listing.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 font-normal">/{listing.priceUnit}</span>
                    </TableCell>

                    {/* Tier */}
                    <TableCell>
                      <StatusBadge type="tier" value={listing.tier} />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge type="status" value={listing.status} />
                    </TableCell>

                    {/* Featured */}
                    <TableCell className="hidden sm:table-cell">
                      <button
                        onClick={() => handleToggleFeatured(listing.id)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        title={listing.isFeatured ? 'Remove from featured' : 'Set as featured'}
                      >
                        {listing.isFeatured ? (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <StarOff className="w-4 h-4 text-gray-300" />
                        )}
                      </button>
                    </TableCell>

                    {/* Created */}
                    <TableCell className="hidden xl:table-cell text-xs text-gray-400 whitespace-nowrap">
                      {format(new Date(listing.createdAt), 'MMM dd, yyyy')}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {/* View */}
                          <DropdownMenuItem onClick={() => router.push(`/admin/listings/${listing.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>

                          {/* Edit */}
                          <DropdownMenuItem onClick={() => router.push(`/admin/listings/${listing.id}/edit`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>

                          {/* Toggle Featured */}
                          <DropdownMenuItem onClick={() => handleToggleFeatured(listing.id)}>
                            {listing.isFeatured ? (
                              <>
                                <StarOff className="w-4 h-4 mr-2" />
                                Remove Featured
                              </>
                            ) : (
                              <>
                                <Star className="w-4 h-4 mr-2" />
                                Set Featured
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* Change Status Submenu */}
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <ArrowUpDown className="w-4 h-4 mr-2" />
                              Change Status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {statuses.map((s) => (
                                <DropdownMenuItem
                                  key={s}
                                  onClick={() => handleStatusChange(listing.id, s)}
                                  disabled={listing.status === s}
                                >
                                  <StatusBadge type="status" value={s} />
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>

                          <DropdownMenuSeparator />

                          {/* Delete */}
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              setDeleteId(listing.id)
                              setDeleteTitle(listing.title)
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
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
        {totalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t bg-gray-50/50">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{startIdx}</span> to{' '}
              <span className="font-medium text-gray-700">{endIdx}</span> of{' '}
              <span className="font-medium text-gray-700">{total}</span> listings
            </p>
            <div className="flex items-center gap-1">
              {/* Prev */}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => fetchListings(page - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Page Numbers */}
              {getPageNumbers().map((p, idx) =>
                typeof p === 'string' ? (
                  <span key={`dots-${idx}`} className="px-1 text-gray-400">
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="icon"
                    className={`h-8 w-8 ${p === page ? 'bg-[#006633] hover:bg-[#004d26] text-white' : ''}`}
                    onClick={() => fetchListings(p)}
                  >
                    {p}
                  </Button>
                )
              )}

              {/* Next */}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => fetchListings(page + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Listing"
        description={`Are you sure you want to delete "${deleteTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
      />
    </div>
  )
}
