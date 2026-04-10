'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Home,
  GitCompareArrows,
  X,
  Check,
  Star,
  MapPin,
  ShieldCheck,
  Crown,
  Phone,
  Mail,
  Calendar,
  Tag,
  Search,
  Plus,
  Loader2,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useCompareStore } from '@/lib/compare-store'
import { formatPrice } from '@/components/marketplace/listing-card'

// ─── Types ────────────────────────────────────────────────────────────

interface CompareListing {
  id: string
  title: string
  description: string
  price: number
  priceUnit: string
  location: string
  category: string
  imageUrl: string
  imageUrls?: string
  tier: string
  contactPhone?: string | null
  contactEmail?: string | null
  isFeatured: boolean
  createdAt: string
  totalReviews: number
  averageRating: number | null
  favoriteCount: number
}

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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function truncDesc(text: string, max = 120) {
  if (text.length <= max) return text
  return text.slice(0, max).trim() + '…'
}

// ─── Page Component ───────────────────────────────────────────────────

function ComparePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const storeIds = useCompareStore((s) => s.ids)
  const storeAdd = useCompareStore((s) => s.add)
  const storeRemove = useCompareStore((s) => s.remove)
  const storeClear = useCompareStore((s) => s.clear)

  // Merge URL params with store on mount
  const [ids, setIds] = useState<string[]>([])
  const [listings, setListings] = useState<CompareListing[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<CompareListing[]>([])
  const [favoritesLoading, setFavoritesLoading] = useState(true)
  const [manualId, setManualId] = useState('')
  const [addingId, setAddingId] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Sync URL params ↔ store on first load
  useEffect(() => {
    const urlIds = searchParams.get('ids')
    const parsed = urlIds
      ? urlIds.split(',').filter(Boolean).slice(0, 3)
      : []

    if (parsed.length > 0) {
      // URL takes priority: replace store
      const merged = [...new Set([...parsed, ...storeIds])].slice(0, 3)
      setIds(merged)
      // Sync store to match
      storeClear()
      merged.forEach((id) => storeAdd(id))
    } else {
      setIds(storeIds)
    }
  }, [])

  // Update URL when ids change
  useEffect(() => {
    if (ids.length > 0) {
      const params = new URLSearchParams()
      params.set('ids', ids.join(','))
      router.replace(`/compare?${params.toString()}`, { scroll: false })
    } else {
      router.replace('/compare', { scroll: false })
    }
  }, [ids, router])

  // Fetch listings data whenever ids change
  useEffect(() => {
    if (ids.length === 0) {
      setListings([])
      setLoading(false)
      return
    }

    async function fetchListings() {
      setLoading(true)
      try {
        const res = await fetch(`/api/listings/batch?ids=${ids.join(',')}`)
        if (res.ok) {
          const data = await res.json()
          setListings(data)
        } else {
          setListings([])
        }
      } catch {
        setListings([])
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [ids])

  // Fetch favorites for selection grid
  useEffect(() => {
    async function fetchFavorites() {
      setFavoritesLoading(true)
      try {
        const sessionId = getSessionId()
        const res = await fetch(`/api/favorites?sessionId=${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          setFavorites(Array.isArray(data) ? data : [])
        }
      } catch {
        setFavorites([])
      } finally {
        setFavoritesLoading(false)
      }
    }
    fetchFavorites()
  }, [])

  // Handlers
  const handleToggle = useCallback(
    (id: string) => {
      if (ids.includes(id)) {
        const next = ids.filter((i) => i !== id)
        setIds(next)
        storeRemove(id)
      } else if (ids.length < 3) {
        const next = [...ids, id]
        setIds(next)
        storeAdd(id)
      }
    },
    [ids, storeAdd, storeRemove]
  )

  const handleRemove = useCallback(
    (id: string) => {
      const next = ids.filter((i) => i !== id)
      setIds(next)
      storeRemove(id)
    },
    [ids, storeRemove]
  )

  const handleAddManual = useCallback(async () => {
    const trimmed = manualId.trim()
    if (!trimmed) return
    if (ids.includes(trimmed)) {
      setAddError('Already in comparison')
      setTimeout(() => setAddError(null), 2000)
      return
    }
    if (ids.length >= 3) {
      setAddError('Max 3 properties')
      setTimeout(() => setAddError(null), 2000)
      return
    }

    setAddingId(true)
    setAddError(null)

    try {
      const res = await fetch(`/api/listings/${trimmed}`)
      if (!res.ok) {
        setAddError('Listing not found')
        setTimeout(() => setAddError(null), 2000)
        setAddingId(false)
        return
      }
      const next = [...ids, trimmed]
      setIds(next)
      storeAdd(trimmed)
      setManualId('')
    } catch {
      setAddError('Failed to find listing')
      setTimeout(() => setAddError(null), 2000)
    } finally {
      setAddingId(false)
    }
  }, [manualId, ids, storeAdd])

  // ─── Determine "best" values ──────────────────────────────────────
  const lowestPrice = listings.length > 1
    ? Math.min(...listings.map((l) => l.price))
    : null

  const highestRating = listings.length > 1
    ? Math.max(
        ...listings
          .map((l) => l.averageRating)
          .filter((r): r is number => r !== null)
      )
    : null

  const mostReviews = listings.length > 1
    ? Math.max(...listings.map((l) => l.totalReviews))
    : null

  const mostFavorites = listings.length > 1
    ? Math.max(...listings.map((l) => l.favoriteCount))
    : null

  // ─── Loading State ─────────────────────────────────────────────────
  if (loading && ids.length > 0) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        <CompareHeader />
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-28 shrink-0" />
                <div className="flex-1 flex gap-4">
                  {Array.from({ length: Math.min(ids.length, 3) }).map((_, j) => (
                    <Skeleton key={j} className="h-5 flex-1" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─── Main Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <CompareHeader />

      <div className="px-4 py-5 space-y-6 max-w-5xl mx-auto">
        {/* Selection counter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompareArrows className="size-5 text-[#006633]" />
            <h2 className="text-sm font-bold text-gray-900">
              {ids.length}/3 properties selected
            </h2>
          </div>
          {ids.length > 0 && (
            <button
              onClick={() => {
                setIds([])
                storeClear()
              }}
              className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <X className="size-3" />
              Clear all
            </button>
          )}
        </div>

        {/* ─── Selection Grid ────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Select from your saved listings
          </h3>

          {favoritesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="aspect-[3/2] w-full shimmer" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <p className="text-sm text-gray-400">
                No saved listings. Add a listing ID below or save some listings first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {favorites.map((fav) => {
                const selected = ids.includes(fav.id)
                const disabled = !selected && ids.length >= 3
                return (
                  <div
                    key={fav.id}
                    onClick={() => !disabled && handleToggle(fav.id)}
                    className={`relative group bg-white rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                      selected
                        ? 'border-[#006633] shadow-md shadow-[#006633]/15 ring-1 ring-[#006633]/20'
                        : disabled
                          ? 'border-gray-100 opacity-50 cursor-not-allowed'
                          : 'border-gray-100 hover:border-[#006633]/40 hover:shadow-sm'
                    }`}
                  >
                    {/* Checkbox overlay */}
                    <div
                      className={`absolute top-2 left-2 z-10 h-6 w-6 rounded-lg flex items-center justify-center transition-all ${
                        selected
                          ? 'bg-[#006633]'
                          : 'bg-white/80 backdrop-blur-sm border border-gray-200'
                      }`}
                    >
                      {selected && <Check className="size-3.5 text-white" />}
                    </div>

                    {/* Image */}
                    <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                      <Image
                        src={fav.imageUrl}
                        alt={fav.title}
                        fill
                        className="object-cover"
                        sizes="200px"
                        loading="lazy"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-2.5">
                      <h4 className="text-xs font-semibold text-gray-900 line-clamp-1">
                        {fav.title}
                      </h4>
                      <div className="flex items-center gap-1 text-gray-400 mt-0.5">
                        <MapPin className="size-2.5 shrink-0" />
                        <span className="text-[10px] truncate">{fav.location}</span>
                      </div>
                      <p className="text-xs font-extrabold text-emerald-700 mt-1">
                        {formatPrice(fav.price)}
                        <span className="font-normal text-gray-400"> / {fav.priceUnit}</span>
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ─── Add by ID ─────────────────────────────────────────── */}
        <section>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Or add by listing ID
          </h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Paste listing ID..."
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
                className="w-full h-10 pl-9 pr-3 text-sm rounded-xl bg-white border border-gray-200 text-gray-800 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-[#006633]/20 focus:border-[#006633]/30"
              />
            </div>
            <button
              onClick={handleAddManual}
              disabled={addingId || !manualId.trim()}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-[#006633] to-[#004d26] text-white text-sm font-semibold flex items-center gap-1.5 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {addingId ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Add
            </button>
          </div>
          {addError && (
            <p className="text-xs text-red-500 mt-1.5">{addError}</p>
          )}
        </section>

        {/* ─── Empty State ───────────────────────────────────────── */}
        {ids.length < 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center border-2 border-dashed border-emerald-200/80">
                <GitCompareArrows className="size-9 text-emerald-300" />
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1.5">
              Select at least 2 properties to compare
            </h3>
            <p className="text-sm text-gray-400 max-w-[300px] mx-auto leading-relaxed">
              Choose properties from your saved listings or add them by ID to see a side-by-side comparison
            </p>
          </div>
        )}

        {/* ─── Comparison Table ──────────────────────────────────── */}
        {ids.length >= 2 && listings.length >= 2 && (
          <section className="animate-fade-in">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              {/* Column Headers */}
              <div className="grid border-b border-gray-100 bg-gray-50/80" style={{ gridTemplateColumns: `180px repeat(${listings.length}, 1fr)` }}>
                <div className="p-4">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Attribute
                  </span>
                </div>
                {listings.map((l) => (
                  <div key={l.id} className="p-3 text-center">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-gray-400 font-medium uppercase">
                        Property {listings.indexOf(l) + 1}
                      </span>
                      <button
                        onClick={() => handleRemove(l.id)}
                        className="h-6 w-6 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors group"
                        title="Remove from comparison"
                      >
                        <X className="size-3.5 text-gray-400 group-hover:text-red-500" />
                      </button>
                    </div>
                    {/* Thumbnail */}
                    <Link
                      href={`/listings/${l.id}`}
                      className="block relative aspect-[3/2] rounded-xl overflow-hidden bg-gray-100 mx-auto max-w-[180px] hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src={l.imageUrl}
                        alt={l.title}
                        fill
                        className="object-cover"
                        sizes="180px"
                      />
                    </Link>
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-50">
                <CompareRow
                  label="Image"
                  icon={<Tag className="size-3.5 text-[#006633]" />}
                  cols={listings.length}
                >
                  {listings.map((l) => (
                    <Link
                      key={l.id}
                      href={`/listings/${l.id}`}
                      className="flex justify-center"
                    >
                      <span className="text-xs text-[#006633] font-semibold hover:underline">
                        View Listing →
                      </span>
                    </Link>
                  ))}
                </CompareRow>

                <CompareRow
                  label="Price"
                  icon={<Tag className="size-3.5 text-[#006633]" />}
                  cols={listings.length}
                >
                  {listings.map((l) => (
                    <span
                      key={l.id}
                      className={`text-sm font-extrabold text-center block ${
                        l.price === lowestPrice
                          ? 'text-[#006633] bg-[#006633]/5 px-3 py-1.5 rounded-xl'
                          : 'text-gray-800'
                      }`}
                    >
                      {formatPrice(l.price)}
                      <span className="text-xs font-normal text-gray-400"> / {l.priceUnit}</span>
                      {l.price === lowestPrice && (
                        <span className="block text-[10px] font-semibold text-[#006633] mt-0.5">Lowest</span>
                      )}
                    </span>
                  ))}
                </CompareRow>

                <CompareRow
                  label="Location"
                  icon={<MapPin className="size-3.5 text-[#006633]" />}
                  cols={listings.length}
                >
                  {listings.map((l) => (
                    <span key={l.id} className="text-xs text-gray-700 text-center block leading-snug">
                      {l.location}
                    </span>
                  ))}
                </CompareRow>

                <CompareRow
                  label="Category"
                  icon={<Tag className="size-3.5 text-[#006633]" />}
                  cols={listings.length}
                >
                  {listings.map((l) => (
                    <Badge
                      key={l.id}
                      className="bg-[#006633]/10 text-[#006633] border-0 rounded-lg text-[11px] font-medium justify-center mx-auto"
                    >
                      {l.category}
                    </Badge>
                  ))}
                </CompareRow>

                <CompareRow
                  label="Tier"
                  icon={<ShieldCheck className="size-3.5 text-[#006633]" />}
                  cols={listings.length}
                >
                  {listings.map((l) => (
                    <span
                      key={l.id}
                      className={`text-xs font-semibold text-center block capitalize px-3 py-1 rounded-lg inline-block mx-auto ${
                        l.tier !== 'standard'
                          ? 'bg-[#006633]/10 text-[#006633]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {l.tier}
                    </span>
                  ))}
                </CompareRow>

                <CompareRow
                  label="Description"
                  icon={null}
                  cols={listings.length}
                >
                  {listings.map((l) => (
                    <p
                      key={l.id}
                      className="text-xs text-gray-600 text-center leading-relaxed px-1"
                    >
                      {truncDesc(l.description)}
                    </p>
                  ))}
                </CompareRow>

                <CompareRow
                  label="Reviews"
                  icon={<Star className="size-3.5 text-[#006633]" />}
                  cols={listings.length}
                >
                  {listings.map((l) => {
                    const isBest = l.totalReviews === mostReviews && mostReviews > 0
                    return (
                      <span
                        key={l.id}
                        className={`text-center block ${
                          isBest ? 'bg-[#006633]/5 px-3 py-1.5 rounded-xl' : ''
                        }`}
                      >
                        <span className={`text-sm font-bold ${isBest ? 'text-[#006633]' : 'text-gray-800'}`}>
                          {l.totalReviews}
                        </span>
                        <span className="text-xs text-gray-400 ml-0.5">review{l.totalReviews !== 1 ? 's' : ''}</span>
                        {isBest && (
                          <span className="block text-[10px] font-semibold text-[#006633] mt-0.5">Most</span>
                        )}
                      </span>
                    )
                  })}
                </CompareRow>

                <CompareRow
                  label="Rating"
                  icon={<Star className="size-3.5 text-[#006633]" />}
                  cols={listings.length}
                >
                  {listings.map((l) => {
                    const isBest =
                      l.averageRating !== null &&
                      l.averageRating === highestRating &&
                      highestRating !== null
                    return (
                      <span
                        key={l.id}
                        className={`text-center block ${
                          isBest ? 'bg-[#006633]/5 px-3 py-1.5 rounded-xl' : ''
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <Star
                            className={`size-4 ${
                              l.averageRating !== null
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                          <span className={`text-sm font-bold ${isBest ? 'text-[#006633]' : 'text-gray-800'}`}>
                            {l.averageRating !== null ? l.averageRating.toFixed(1) : '—'}
                          </span>
                        </div>
                        {isBest && (
                          <span className="text-[10px] font-semibold text-[#006633] mt-0.5 block">Highest</span>
                        )}
                      </span>
                    )
                  })}
                </CompareRow>

                <CompareRow
                  label="Featured"
                  icon={<Crown className="size-3.5 text-[#006633]" />}
                  cols={listings.length}
                >
                  {listings.map((l) => (
                    <span key={l.id} className="text-center block">
                      {l.isFeatured ? (
                        <Badge className="bg-amber-100 text-amber-700 border-0 rounded-lg text-[11px] font-medium gap-1 mx-auto">
                          <Crown className="size-3" />
                          Featured
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">No</span>
                      )}
                    </span>
                  ))}
                </CompareRow>

                <CompareRow
                  label="Listed Date"
                  icon={<Calendar className="size-3.5 text-[#006633]" />}
                  cols={listings.length}
                >
                  {listings.map((l) => (
                    <span key={l.id} className="text-xs text-gray-700 text-center block">
                      {formatDate(l.createdAt)}
                    </span>
                  ))}
                </CompareRow>

                <CompareRow
                  label="Contact"
                  icon={<Phone className="size-3.5 text-[#006633]" />}
                  cols={listings.length}
                >
                  {listings.map((l) => (
                    <div key={l.id} className="text-center space-y-1">
                      {l.contactPhone ? (
                        <div className="flex items-center justify-center gap-1">
                          <Phone className="size-3 text-[#006633]" />
                          <span className="text-xs font-medium text-gray-700">{l.contactPhone}</span>
                        </div>
                      ) : null}
                      {l.contactEmail ? (
                        <div className="flex items-center justify-center gap-1">
                          <Mail className="size-3 text-[#006633]" />
                          <span className="text-xs font-medium text-gray-700 truncate max-w-[140px]">
                            {l.contactEmail}
                          </span>
                        </div>
                      ) : null}
                      {!l.contactPhone && !l.contactEmail && (
                        <span className="text-xs text-gray-400">Not provided</span>
                      )}
                    </div>
                  ))}
                </CompareRow>
              </div>
            </div>
          </section>
        )}

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="animate-spin size-8 border-2 border-[#006633] border-t-transparent rounded-full" />
      </div>
    }>
      <ComparePageInner />
    </Suspense>
  )
}

function CompareHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[#006633]">
      <div className="flex items-center px-4 py-3 gap-3">
        <Link href="/" className="shrink-0">
          <Home className="size-5 text-white" />
        </Link>
        <Link href="/" className="shrink-0 hover:opacity-80">
          <h1 className="text-white font-bold text-lg tracking-tight">
            Housemate<span className="text-[#4ade80]">.zm</span>
          </h1>
        </Link>
      </div>
      {/* Subtitle */}
      <div className="px-4 pb-3">
        <h2 className="text-white/90 text-sm font-semibold">Compare Properties</h2>
        <p className="text-white/60 text-[11px] mt-0.5">
          Select up to 3 listings to compare side by side
        </p>
      </div>
    </header>
  )
}

function CompareRow({
  label,
  icon,
  cols,
  children,
}: {
  label: string
  icon: React.ReactNode
  cols: number
  children: React.ReactNode
}) {
  return (
    <div
      className="grid items-center py-3.5 px-4"
      style={{ gridTemplateColumns: `180px repeat(${cols}, 1fr)` }}
    >
      <div className="flex items-center gap-2 pr-4">
        {icon}
        <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">{label}</span>
      </div>
      {children}
    </div>
  )
}
