'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Header } from '@/components/marketplace/header'
import { CategoryRow, type Category } from '@/components/marketplace/category-row'
import { ListingGrid } from '@/components/marketplace/listing-grid'
import { ListingDetail } from '@/components/marketplace/listing-detail'
import { FavoritesSheet } from '@/components/marketplace/favorites-sheet'
import { BottomNav, type TabType } from '@/components/marketplace/bottom-nav'
import { MapView } from '@/components/marketplace/map-view'
import { ChevronRight, ShieldCheck, Zap, Heart, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Listing } from '@/components/marketplace/listing-card'
import { useCompareStore } from '@/lib/compare-store'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = localStorage.getItem('hmz-session')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('hmz-session', sessionId)
  }
  return sessionId
}

const PRICE_RANGES = [
  { label: 'Any Price', min: '', max: '' },
  { label: 'Under K1,000', min: '', max: '1000' },
  { label: 'K1,000 - K3,000', min: '1000', max: '3000' },
  { label: 'K3,000 - K5,000', min: '3000', max: '5000' },
  { label: 'K5,000 - K10,000', min: '5000', max: '10000' },
  { label: 'K10,000 - K20,000', min: '10000', max: '20000' },
  { label: 'Over K20,000', min: '20000', max: '' },
]

// Section configuration
const sections = [
  { key: 'all', title: 'All Collection', description: 'Browse all available listings', link: '/explore' },
  { key: 'budget', title: 'Budget Friendly', description: 'Affordable options under K3,000', link: '/explore?maxPrice=3000' },
  { key: 'executive', title: 'Executive Living', description: 'Premium properties for discerning tenants', link: '/explore?minPrice=5000' },
  { key: 'top', title: 'Top Rated', description: 'Highest rated properties by users', link: '/explore?sort=top' },
]

function getListingsForSection(sectionKey: string, listings: Listing[]): Listing[] {
  switch (sectionKey) {
    case 'budget':
      return listings.filter(l => l.price < 3000).slice(0, 6)
    case 'executive':
      return listings
        .filter(l => l.tier === 'premium' || l.tier === 'featured' || l.price >= 5000)
        .slice(0, 6)
    case 'top': {
      return [...listings]
        .sort((a, b) => {
          const tierOrder: Record<string, number> = { premium: 4, featured: 3, spotlight: 2, standard: 1 }
          const scoreA = (tierOrder[a.tier] || 1) + (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) / 100000000000
          const scoreB = (tierOrder[b.tier] || 1) + (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) / 100000000000
          return scoreB - scoreA
        })
        .slice(0, 6)
    }
    default:
      return listings.slice(0, 6)
  }
}

export default function Home() {
  const router = useRouter()

  // Compare store
  const compareIds = useCompareStore((s) => s.ids)
  const compareAdd = useCompareStore((s) => s.add)
  const compareRemove = useCompareStore((s) => s.remove)
  const compareIdsSet = new Set(compareIds)

  // Data states
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredResults, setFilteredResults] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)

  // UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activePriceRange, setActivePriceRange] = useState('Any Price')
  const [activeTab, setActiveTab] = useState<TabType>('explore')
  const [activeView, setActiveView] = useState<'list' | 'map'>('list')
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [favoriteListings, setFavoriteListings] = useState<Listing[]>([])
  // Debounce timer ref
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sessionId = getSessionId()

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 400)
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [searchQuery])

  // Fetch initial data (all listings for sections)
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [listingsRes, categoriesRes] = await Promise.all([
          fetch('/api/listings'),
          fetch('/api/categories'),
        ])

        const listingsData = await listingsRes.json()
        const categoriesData = await categoriesRes.json()

        setListings(listingsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch filtered results when filters change (server-side)
  useEffect(() => {
    const hasFilters = activeCategory !== 'All' || activePriceRange !== 'Any Price' || debouncedSearch.trim()

    if (!hasFilters) {
      setFilteredResults([])
      setIsFiltering(false)
      return
    }

    async function fetchFiltered() {
      setIsFiltering(true)
      try {
        const params: Record<string, string> = {}
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
        if (activeCategory !== 'All') params.category = activeCategory

        const priceObj = PRICE_RANGES.find(r => r.label === activePriceRange)
        if (priceObj?.min) params.minPrice = priceObj.min
        if (priceObj?.max) params.maxPrice = priceObj.max

        const qs = new URLSearchParams(params).toString()
        const res = await fetch(`/api/listings${qs ? `?${qs}` : ''}`)
        const data = await res.json()
        setFilteredResults(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch filtered listings:', error)
        setFilteredResults([])
      } finally {
        setIsFiltering(false)
      }
    }

    fetchFiltered()
  }, [activeCategory, activePriceRange, debouncedSearch])

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        setIsAuthenticated(!!data.user)
      } catch {
        // Not authenticated
      }
    }
    checkAuth()
  }, [])

  // Fetch favorites on mount and when auth changes
  useEffect(() => {
    async function fetchFavorites() {
      try {
        const urlParam = isAuthenticated ? '' : `?sessionId=${sessionId}`
        const res = await fetch(`/api/favorites${urlParam}`)
        const data = await res.json()
        setFavoriteListings(data)
        setFavoriteIds(new Set(data.map((f: Listing) => f.id)))
      } catch {
        console.error('Failed to fetch favorites')
      }
    }

    fetchFavorites()
  }, [sessionId, isAuthenticated])

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (listing: Listing) => {
      const isFav = favoriteIds.has(listing.id)

      try {
        if (isFav) {
          const urlParam = isAuthenticated
            ? `?listingId=${listing.id}`
            : `?listingId=${listing.id}&sessionId=${sessionId}`
          await fetch(`/api/favorites${urlParam}`, { method: 'DELETE' })
          setFavoriteIds((prev) => {
            const next = new Set(prev)
            next.delete(listing.id)
            return next
          })
          setFavoriteListings((prev) => prev.filter((f) => f.id !== listing.id))
        } else {
          await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listingId: listing.id, sessionId: isAuthenticated ? undefined : sessionId }),
          })
          setFavoriteIds((prev) => new Set(prev).add(listing.id))
          setFavoriteListings((prev) => [listing, ...prev])
        }
      } catch {
        console.error('Failed to toggle favorite')
      }
    },
    [sessionId, isAuthenticated, favoriteIds]
  )

  const removeFavorite = useCallback(
    async (listingId: string) => {
      try {
        const urlParam = isAuthenticated
          ? `?listingId=${listingId}`
          : `?listingId=${listingId}&sessionId=${sessionId}`
        await fetch(`/api/favorites${urlParam}`, { method: 'DELETE' })
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          next.delete(listingId)
          return next
        })
        setFavoriteListings((prev) => prev.filter((f) => f.id !== listingId))
      } catch {
        console.error('Failed to remove favorite')
      }
    },
    [sessionId, isAuthenticated]
  )

  const handleSelectListing = useCallback((listing: Listing) => {
    setSelectedListing(listing)
    setDetailOpen(true)
  }, [])

  // Toggle compare
  const handleToggleCompare = useCallback(
    (listing: Listing) => {
      if (compareIds.includes(listing.id)) {
        compareRemove(listing.id)
      } else if (compareIds.length < 3) {
        compareAdd(listing.id)
      }
    },
    [compareIds, compareAdd, compareRemove]
  )

  // Navigate to compare page
  const handleGoCompare = useCallback(() => {
    const params = new URLSearchParams()
    params.set('ids', compareIds.join(','))
    router.push(`/compare?${params.toString()}`)
  }, [router, compareIds])

  // Handle category change from header filter
  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat)
  }, [])

  // Handle price range change from header filter
  const handlePriceRangeChange = useCallback((range: string) => {
    setActivePriceRange(range)
  }, [])

  const isFiltered = searchQuery.trim() || activeCategory !== 'All' || activePriceRange !== 'Any Price'
  const displayedFilteredListings = isFiltered ? filteredResults : []

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      {/* Green Header with functional filter buttons */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeView={activeView}
        onViewChange={setActiveView}
        onOpenProfile={() => setActiveTab('profile')}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        activePriceRange={activePriceRange}
        onPriceRangeChange={handlePriceRangeChange}
      />

      {/* Decorative gradient wave below header */}
      <div className="h-4 bg-gradient-to-b from-[#006633]/10 to-transparent" />

      {/* Main Content */}
      <main className="flex-1 pb-20 safe-area-bottom">
        {/* Category icons row */}
        {!isFiltered && (
          <CategoryRow
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        )}

        {/* Active filters indicator */}
        {isFiltered && (
          <div className="px-4 py-2.5 bg-white border-b border-gray-100 animate-fade-in">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-[#006633]/10 text-[#006633] text-[11px] font-semibold whitespace-nowrap shrink-0">
                  &quot;{searchQuery.trim()}&quot;
                  <button onClick={() => setSearchQuery('')} className="h-4 w-4 rounded-full bg-[#006633]/20 flex items-center justify-center hover:bg-[#006633]/30">
                    <X className="size-2.5" />
                  </button>
                </span>
              )}
              {activeCategory !== 'All' && (
                <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-[#006633]/10 text-[#006633] text-[11px] font-semibold whitespace-nowrap shrink-0">
                  {activeCategory}
                  <button onClick={() => setActiveCategory('All')} className="h-4 w-4 rounded-full bg-[#006633]/20 flex items-center justify-center hover:bg-[#006633]/30">
                    <X className="size-2.5" />
                  </button>
                </span>
              )}
              {activePriceRange !== 'Any Price' && (
                <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-[#006633]/10 text-[#006633] text-[11px] font-semibold whitespace-nowrap shrink-0">
                  {activePriceRange}
                  <button onClick={() => setActivePriceRange('Any Price')} className="h-4 w-4 rounded-full bg-[#006633]/20 flex items-center justify-center hover:bg-[#006633]/30">
                    <X className="size-2.5" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory('All')
                  setActivePriceRange('Any Price')
                }}
                className="text-[11px] font-semibold text-[#006633] whitespace-nowrap ml-1 hover:text-[#004d26]"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Filter results count */}
        {isFiltered && !isFiltering && (
          <div className="px-4 py-2 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">
              {displayedFilteredListings.length} result{displayedFilteredListings.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* When filtered, show filtered results from API */}
        {isFiltered ? (
          <div className="mt-1">
            <ListingGrid
              listings={displayedFilteredListings}
              favorites={favoriteIds}
              onToggleFavorite={toggleFavorite}
              onSelectListing={handleSelectListing}
              isLoading={isFiltering}
              compareIds={compareIdsSet}
              onToggleCompare={handleToggleCompare}
            />
            {!isFiltering && displayedFilteredListings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <SearchIcon className="size-8 text-gray-300" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">No listings found</h3>
                <p className="text-sm text-gray-400 mb-4 text-center max-w-[260px]">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setActiveCategory('All')
                    setActivePriceRange('Any Price')
                  }}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#006633] to-[#004d26] text-white text-sm font-semibold"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : activeView === 'map' ? (
          /* Map View */
          <div className="h-[calc(100vh-180px)] animate-fade-in">
            <MapView listings={listings} favorites={favoriteIds} />
          </div>
        ) : (
          /* Normal sections view */
          <>
            {sections.map((section, idx) => {
              const sectionListings = getListingsForSection(section.key, listings)

              if (isLoading) {
                return (
                  <section key={section.key} className="mt-5 animate-section-fade" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="px-4 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#006633] to-[#004d26]" />
                        <div>
                          <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">{section.title}</h2>
                          <p className="text-[11px] text-gray-500 mt-0.5">{section.description}</p>
                        </div>
                      </div>
                    </div>
                    <ListingGrid
                      listings={Array(6).fill({}) as unknown as Listing[]}
                      favorites={favoriteIds}
                      onToggleFavorite={toggleFavorite}
                      onSelectListing={handleSelectListing}
                      isLoading={true}
                      compareIds={compareIdsSet}
                      onToggleCompare={handleToggleCompare}
                    />
                  </section>
                )
              }

              if (sectionListings.length === 0) return null

              return (
                <section key={section.key} className="mt-5 animate-section-fade" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="px-4 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#006633] to-[#004d26]" />
                      <div>
                        <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">{section.title}</h2>
                        <p className="text-[11px] text-gray-500 mt-0.5">{section.description}</p>
                      </div>
                    </div>
                    <Link
                      href={section.link}
                      className="group flex items-center gap-0.5 text-[#006633] text-xs font-semibold hover:text-[#004d26] relative hover:-translate-y-0.5 transition-transform duration-200"
                    >
                      See all
                      <ChevronRight className="size-3.5 group-hover:translate-x-0.5" />
                      <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-px bg-gradient-to-r from-[#006633]/60 to-[#006633]/20 transition-all duration-300" />
                    </Link>
                  </div>

                  {idx === 0 ? (
                    <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none">
                      {sectionListings.map((listing, i) => (
                        <div key={listing.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                          <HorizontalCard
                            listing={listing}
                            isFavorited={favoriteIds.has(listing.id)}
                            onToggleFavorite={toggleFavorite}
                            onSelectListing={handleSelectListing}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ListingGrid
                      listings={sectionListings}
                      favorites={favoriteIds}
                      onToggleFavorite={toggleFavorite}
                      onSelectListing={handleSelectListing}
                      isLoading={false}
                      compareIds={compareIdsSet}
                      onToggleCompare={handleToggleCompare}
                    />
                  )}
                </section>
              )
            })}

            {/* "Why Housemate ZM?" Trust Section */}
            <section className="mt-8 px-4 pb-4 animate-section-fade" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#006633] to-[#004d26]" />
                <div>
                  <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">Why Housemate ZM?</h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">Trusted by thousands across Zambia</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100/80 card-elevated">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006633]/15 via-[#006633]/8 to-emerald-500/10 flex items-center justify-center mx-auto mb-2.5">
                    <ShieldCheck className="size-5 text-[#006633]" />
                  </div>
                  <h3 className="text-[11px] font-bold text-gray-900 mb-0.5">Verified Listings</h3>
                  <p className="text-[10px] text-gray-400 leading-relaxed">Every property is checked for authenticity</p>
                </div>

                <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100/80 card-elevated">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/15 via-amber-500/10 to-orange-400/8 flex items-center justify-center mx-auto mb-2.5">
                    <Zap className="size-5 text-amber-500" />
                  </div>
                  <h3 className="text-[11px] font-bold text-gray-900 mb-0.5">Instant Alerts</h3>
                  <p className="text-[10px] text-gray-400 leading-relaxed">Get notified of new listings first</p>
                </div>

                <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100/80 card-elevated">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400/15 via-red-400/10 to-pink-400/8 flex items-center justify-center mx-auto mb-2.5">
                    <Heart className="size-5 text-red-500" />
                  </div>
                  <h3 className="text-[11px] font-bold text-gray-900 mb-0.5">Save &amp; Compare</h3>
                  <p className="text-[10px] text-gray-400 leading-relaxed">Bookmark favorites to review later</p>
                </div>
              </div>

              {/* Stats bar */}
              <div className="mt-4 relative bg-gradient-to-r from-[#006633] to-[#004d26] rounded-3xl p-4 flex items-center justify-around text-white shadow-lg shadow-[#006633]/20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(0,102,51,0.3),transparent_50%)]" />
                <div className="text-center relative z-10">
                  <p className="text-lg font-extrabold animate-count-up">2,500+</p>
                  <p className="text-[10px] text-white/70">Active Listings</p>
                </div>
                <div className="w-px h-8 bg-white/20 relative z-10" />
                <div className="text-center relative z-10">
                  <p className="text-lg font-extrabold animate-count-up">1,200+</p>
                  <p className="text-[10px] text-white/70">Happy Tenants</p>
                </div>
                <div className="w-px h-8 bg-white/20 relative z-10" />
                <div className="text-center relative z-10">
                  <p className="text-lg font-extrabold animate-count-up">10+</p>
                  <p className="text-[10px] text-white/70">Cities Covered</p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        savedCount={favoriteIds.size}
        onOpenFavorites={() => setFavoritesOpen(true)}
      />

      {/* Listing Detail Modal */}
      <ListingDetail
        listing={selectedListing}
        open={detailOpen}
        isFavorited={selectedListing ? favoriteIds.has(selectedListing.id) : false}
        onOpenChange={setDetailOpen}
        onToggleFavorite={() => {
          if (selectedListing) toggleFavorite(selectedListing)
        }}
      />

      {/* Favorites Sheet */}
      <FavoritesSheet
        open={favoritesOpen}
        onOpenChange={setFavoritesOpen}
        favorites={favoriteListings}
        onRemoveFavorite={removeFavorite}
        onSelectListing={handleSelectListing}
      />

      {/* Floating Compare Button */}
      {compareIds.length >= 2 && (
        <button
          onClick={handleGoCompare}
          className="fixed bottom-24 right-4 z-50 flex items-center gap-2 h-12 px-5 rounded-2xl bg-gradient-to-r from-[#006633] to-[#004d26] text-white font-semibold shadow-xl shadow-[#006633]/30 hover:shadow-2xl hover:shadow-[#006633]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 animate-fade-in"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 3h5v5" />
            <path d="M4 20L21 3" />
            <path d="M21 16v5h-5" />
            <path d="M15 15l6 6" />
            <path d="M4 4l5 5" />
          </svg>
          <span>Compare ({compareIds.length})</span>
        </button>
      )}
    </div>
  )
}

// Simple search icon for empty state
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

// Horizontal scrollable card for "All Collection" section
function HorizontalCard({
  listing,
  isFavorited,
  onToggleFavorite,
  onSelectListing,
}: {
  listing: Listing
  isFavorited: boolean
  onToggleFavorite: (listing: Listing) => void
  onSelectListing: (listing: Listing) => void
}) {
  const hash = listing.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const rating = (3.5 + (hash % 15) / 10).toFixed(1)

  return (
    <div
      className="group relative bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-md card-elevated cursor-pointer border border-white/60 shrink-0 w-44 glass-white"
      onClick={() => onSelectListing(listing)}
    >
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

        {listing.tier !== 'standard' && (
          <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 bg-[#006633] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md verified-glow">
            Verified
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(listing)
          }}
          className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 active:scale-95"
        >
          <svg
            className={`size-3 transition-all ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            viewBox="0 0 24 24"
            fill={isFavorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>
      {/* Content */}
      <div className="p-2.5 space-y-1">
        <h3 className="text-[12px] font-semibold text-gray-900 line-clamp-1 leading-snug">
          {listing.title}
        </h3>
        <div className="flex items-center gap-1">
          <svg className="size-3 fill-amber-400 text-amber-400" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="text-[10px] font-semibold text-gray-600">{rating}</span>
          <span className="text-[10px] text-gray-400">&middot; {listing.category}</span>
        </div>
        <p className="text-[11px] font-extrabold text-emerald-700">
          K{listing.price.toLocaleString()} <span className="font-normal text-gray-400">/ {listing.priceUnit}</span>
        </p>
      </div>
    </div>
  )
}
