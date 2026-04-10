'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MapPin, X, Heart, Loader2, Search, Home } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Listing } from '@/components/marketplace/listing-card'
import { formatPrice } from '@/components/marketplace/listing-card'

// ─── Helpers ──────────────────────────────────────────────────────────

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = localStorage.getItem('hmz-session')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('hmz-session', sessionId)
  }
  return sessionId
}

// ─── Page Component ───────────────────────────────────────────────────

export default function SavedListingsPage() {
  const router = useRouter()

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [removedFeedback, setRemovedFeedback] = useState<string | null>(null)

  // Check auth & fetch favorites
  useEffect(() => {
    async function init() {
      try {
        // Check auth
        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()
        const authenticated = !!sessionData.user
        setIsAuthenticated(authenticated)

        // Fetch favorites
        const sessionId = getSessionId()
        const urlParam = authenticated ? '' : `?sessionId=${sessionId}`
        const favRes = await fetch(`/api/favorites${urlParam}`)
        const favData = await favRes.json()
        setListings(Array.isArray(favData) ? favData : [])
      } catch {
        setListings([])
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Remove favorite
  const handleRemove = useCallback(async (listingId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (removingId) return

    setRemovingId(listingId)
    try {
      const sessionId = getSessionId()
      const urlParam = isAuthenticated
        ? `?listingId=${listingId}`
        : `?listingId=${listingId}&sessionId=${sessionId}`
      const res = await fetch(`/api/favorites${urlParam}`, { method: 'DELETE' })
      if (res.ok) {
        setListings(prev => prev.filter(l => l.id !== listingId))
        setRemovedFeedback(listingId)
        setTimeout(() => setRemovedFeedback(null), 1500)
      }
    } catch {
      // ignore
    } finally {
      setRemovingId(null)
    }
  }, [isAuthenticated, removingId])

  // ─── Loading State ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#006633]">
          <div className="flex items-center px-4 py-3 gap-3">
            <Link href="/" className="shrink-0">
              <Home className="size-5 text-white" />
            </Link>
            <Skeleton className="h-5 w-36 bg-white/20" />
          </div>
        </header>
        {/* Subtitle */}
        <div className="px-4 py-2.5">
          <Skeleton className="h-4 w-32" />
        </div>
        {/* Skeleton Grid */}
        <div className="px-4 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="aspect-[3/2] w-full shimmer" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-full rounded shimmer" />
                  <div className="h-3 w-1/2 rounded shimmer" />
                  <div className="h-4 w-1/3 rounded shimmer" />
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
        <header className="sticky top-0 z-40 bg-[#006633]">
          <div className="flex items-center px-4 py-3 gap-3">
            <Link href="/" className="shrink-0">
              <Home className="size-5 text-white" />
            </Link>
            <Link href="/" className="shrink-0 hover:opacity-80">
              <h1 className="text-white font-bold text-lg tracking-tight">Housemate<span className="text-[#4ade80]">.zm</span></h1>
            </Link>
          </div>
        </header>

        {/* Premium empty state */}
        <div className="flex flex-col items-center justify-center px-4 py-24">
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-50 via-pink-50 to-red-50 flex items-center justify-center border-2 border-dashed border-red-200/80">
              <Heart className="size-12 text-red-300" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-100">
              <span className="text-xl">💔</span>
            </div>
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">No saved listings yet</h2>
          <p className="text-sm text-gray-400 mb-8 text-center max-w-[240px] leading-relaxed">
            Start exploring and tap the heart icon on listings you love
          </p>
          <Link
            href="/explore"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#006633] to-[#004d26] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#006633]/25 hover:-translate-y-0.5"
          >
            Explore Listings
          </Link>
        </div>
      </div>
    )
  }

  // ─── Main Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* A. Green Header Bar */}
      <header className="sticky top-0 z-40 bg-[#006633]">
        <div className="flex items-center px-4 py-3 gap-3">
          <Link href="/" className="shrink-0">
            <Home className="size-5 text-white" />
          </Link>
          <Link href="/" className="shrink-0 hover:opacity-80">
            <h1 className="text-white font-bold text-lg tracking-tight">Housemate<span className="text-[#4ade80]">.zm</span></h1>
          </Link>
        </div>
      </header>

      {/* B. Subtitle bar */}
      <div className="px-4 py-2.5">
        <p className="text-xs text-gray-500 font-medium">
          {listings.length} listing{listings.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* C. Listings Grid with staggered entrance animation */}
      <div className="px-4 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {listings.map((listing, index) => (
            <div
              key={listing.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg card-premium cursor-pointer border border-gray-100/80"
                onClick={() => router.push(`/listings/${listing.id}`)}
              >
                {/* Image */}
                <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                  <Image
                    src={listing.imageUrl}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    loading="lazy"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

                  {/* Verified badge */}
                  {listing.tier !== 'standard' && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 bg-[#006633] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md verified-glow">
                      Verified
                    </span>
                  )}

                  {/* Remove button with scale animation */}
                  <button
                    onClick={(e) => handleRemove(listing.id, e)}
                    disabled={removingId === listing.id}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 active:scale-90"
                  >
                    {removingId === listing.id ? (
                      <Loader2 className="size-3.5 text-gray-500 animate-spin" />
                    ) : removedFeedback === listing.id ? (
                      <span className="text-[9px] font-semibold text-[#006633]">Done</span>
                    ) : (
                      <X className="size-4 text-gray-500" />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className="p-3 space-y-1">
                  {/* Title */}
                  <h3 className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-snug">
                    {listing.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-gray-400">
                    <MapPin className="size-3 shrink-0" />
                    <span className="text-[11px] truncate">{listing.location}</span>
                  </div>

                  {/* Price */}
                  <div className="pt-0.5">
                    <span className="text-base font-extrabold text-gray-900">
                      K{listing.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-gray-400 font-normal"> / {listing.priceUnit}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
