'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Home, MapPin, Building2, Loader2, Plus, Eye, Heart, MessageCircle, ArrowUpDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type SortOption = 'newest' | 'most_viewed' | 'most_favorited'

interface ListingItem {
  id: string
  title: string
  description: string
  price: number
  priceUnit: string
  location: string
  category: string
  imageUrl: string
  tier: string
  isFeatured: boolean
  status: string
  createdAt: string
  viewCount: number
  inquiryCount: number
  _count?: { favorites: number }
}

export default function MyListingsPage() {
  const router = useRouter()
  const [listings, setListings] = useState<ListingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  useEffect(() => {
    async function fetchData() {
      try {
        const [sessionRes, listingRes] = await Promise.all([
          fetch('/api/auth/session'),
          fetch('/api/listings'),
        ])

        const sessionData = await sessionRes.json()
        if (!sessionData.user) {
          router.push('/auth/signin')
          return
        }

        const userId = sessionData.user.id
        const allListings = await listingRes.json()
        const myListings = Array.isArray(allListings)
          ? allListings.filter((l: ListingItem) => l.ownerId === userId)
          : []

        // Fetch analytics for each listing in parallel
        const listingsWithAnalytics = await Promise.all(
          myListings.map(async (listing: ListingItem) => {
            try {
              const res = await fetch(`/api/listings/${listing.id}/analytics`)
              if (res.ok) {
                const analytics = await res.json()
                return {
                  ...listing,
                  viewCount: analytics.viewCount ?? 0,
                  inquiryCount: analytics.inquiryCount ?? 0,
                  _count: { favorites: analytics.favoriteCount ?? 0 },
                }
              }
            } catch {
              // ignore
            }
            return {
              ...listing,
              viewCount: 0,
              inquiryCount: 0,
              _count: { favorites: 0 },
            }
          })
        )

        setListings(listingsWithAnalytics)
      } catch {
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const sortedListings = useMemo(() => {
    const sorted = [...listings]
    switch (sortBy) {
      case 'most_viewed':
        sorted.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
        break
      case 'most_favorited':
        sorted.sort((a, b) => (b._count?.favorites ?? 0) - (a._count?.favorites ?? 0))
        break
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }
    return sorted
  }, [listings, sortBy])

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'most_viewed', label: 'Most Viewed' },
    { value: 'most_favorited', label: 'Most Favorited' },
  ]

  // ─── Loading State ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#006633] gradient-border-bottom">
          <div className="flex items-center px-4 py-3 gap-3">
            <Link
              href="/"
              className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Home className="size-4 text-white" />
            </Link>
            <Link href="/" className="text-white font-bold text-lg tracking-tight hover:opacity-90 transition-opacity">
              Housemate<span className="text-green-300">.zm</span>
            </Link>
            <span className="text-white/40 mx-1">|</span>
            <Skeleton className="h-5 w-28 bg-white/20 rounded" />
          </div>
        </header>
        {/* Subtitle */}
        <div className="px-4 py-2.5">
          <Skeleton className="h-4 w-32" />
        </div>
        {/* Skeleton Grid */}
        <div className="px-4 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <Skeleton className="h-40 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex gap-3 pt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── Empty State ───────────────────────────────────────────────────
  if (listings.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#006633] gradient-border-bottom">
          <div className="flex items-center px-4 py-3 gap-3">
            <Link
              href="/"
              className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Home className="size-4 text-white" />
            </Link>
            <Link href="/" className="text-white font-bold text-lg tracking-tight hover:opacity-90 transition-opacity">
              Housemate<span className="text-green-300">.zm</span>
            </Link>
            <span className="text-white/40 mx-1">|</span>
            <h1 className="text-white/80 font-medium text-base">My Listings</h1>
          </div>
        </header>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Building2 className="size-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">No listings yet</h2>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
            You haven&apos;t posted any listings yet. Start sharing your property with the community.
          </p>
          <button
            onClick={() => router.push('/create-listing')}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#006633] text-white text-sm font-semibold hover:bg-[#004d26] transition-colors shadow-sm"
          >
            <Plus className="size-4" />
            Post a Listing
          </button>
        </div>
      </div>
    )
  }

  // ─── Main Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#006633] gradient-border-bottom">
        <div className="flex items-center px-4 py-3 gap-3">
          <Link
            href="/"
            className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Home className="size-4 text-white" />
          </Link>
          <Link href="/" className="text-white font-bold text-lg tracking-tight hover:opacity-90 transition-opacity">
            Housemate<span className="text-green-300">.zm</span>
          </Link>
          <span className="text-white/40 mx-1">|</span>
          <h1 className="text-white/80 font-medium text-base">My Listings</h1>
        </div>
      </header>

      {/* Subtitle + Sort */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <p className="text-xs text-gray-500 font-medium">
          {listings.length} listing{listings.length !== 1 ? 's' : ''} posted
        </p>
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="size-3.5 text-gray-400" />
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${
                sortBy === opt.value
                  ? 'bg-[#006633]/10 text-[#006633]'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedListings.map(listing => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 card-elevated"
            >
              {/* Image */}
              <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 50vw"
                  loading="lazy"
                />

                {/* Verified badge */}
                {listing.tier !== 'standard' && (
                  <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 bg-[#006633] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                    Verified
                  </span>
                )}

                {/* Status badge */}
                {listing.status === 'active' && (
                  <span className="absolute top-2 right-2 inline-flex items-center bg-green-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                    Active
                  </span>
                )}
                {listing.status === 'pending' && (
                  <span className="absolute top-2 right-2 inline-flex items-center bg-amber-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                    Pending
                  </span>
                )}
                {listing.status === 'archived' && (
                  <span className="absolute top-2 right-2 inline-flex items-center bg-gray-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                    Archived
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                  {listing.title}
                </h3>

                {/* Location */}
                <div className="flex items-center gap-1 text-gray-400">
                  <MapPin className="size-3 shrink-0" />
                  <span className="text-xs truncate">{listing.location}</span>
                </div>

                {/* Price */}
                <div className="pt-0.5">
                  <span className="text-sm font-bold text-gray-900">
                    K{listing.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400 font-normal"> / {listing.priceUnit}</span>
                </div>

                {/* Analytics Stats */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Eye className="size-3" />
                    <span className="text-[11px] font-medium">{(listing.viewCount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Heart className="size-3" />
                    <span className="text-[11px] font-medium">{listing._count?.favorites ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <MessageCircle className="size-3" />
                    <span className="text-[11px] font-medium">{listing.inquiryCount ?? 0}</span>
                  </div>
                  {/* Mini views bar */}
                  <div className="flex-1 flex items-center justify-end">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#006633]/60 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, ((listing.viewCount ?? 0) / Math.max(1, ...sortedListings.map(l => l.viewCount ?? 0))) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
