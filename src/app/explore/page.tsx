'use client'

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, X, Heart, Star, MapPin, ChevronDown, ArrowUpDown, Home, LayoutGrid, Map, LocateFixed, Navigation } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Listing } from '@/components/marketplace/listing-card'
import { MapView } from '@/components/marketplace/map-view'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = localStorage.getItem('hmz-session')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('hmz-session', sessionId)
  }
  return sessionId
}

function getRating(id: string): number {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return 3.5 + (hash % 15) / 10
}

const CATEGORIES = [
  'All', 'Rooms', 'Farms', 'Offices', 'Storage', 'Event Spaces',
  'Garages', 'Warehouses', 'Land', 'Shops', 'Parking', 'Other',
]

const TIERS = ['All', 'Standard', 'Featured', 'Spotlight', 'Premium']

const AMENITIES_OPTIONS = [
  'Parking', 'Security Guard', 'CCTV', 'Electric Fence', 'Borehole/Well',
  'Solar Power', 'Generator', 'WiFi', 'Air Conditioning', 'Swimming Pool',
  'Garden', 'DSTV', 'Prepaid Electricity', 'Water Tank', 'Servants Quarters',
  'Wall Fence', 'Tiled Floor', 'Built-in Cupboards', 'Balcony',
]

const PRICE_RANGES = [
  { label: 'Any', min: '', max: '' },
  { label: 'Under K1,000', min: '', max: '1000' },
  { label: 'K1,000 - K3,000', min: '1000', max: '3000' },
  { label: 'K3,000 - K5,000', min: '3000', max: '5000' },
  { label: 'K5,000 - K10,000', min: '5000', max: '10000' },
  { label: 'K10,000 - K20,000', min: '10000', max: '20000' },
  { label: 'Over K20,000', min: '20000', max: '' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'top', label: 'Top Rated' },
]

const RADIUS_OPTIONS = [
  { label: '1 km', value: 1000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
  { label: '25 km', value: 25000 },
  { label: '50 km', value: 50000 },
]

const ITEMS_PER_PAGE = 12

function ExplorePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // URL params on mount
  const initialQuery = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category') || ''
  const initialTier = searchParams.get('tier') || ''
  const initialMinPrice = searchParams.get('minPrice') || ''
  const initialMaxPrice = searchParams.get('maxPrice') || ''
  const initialSort = searchParams.get('sort') || ''
  const initialAmenities = searchParams.get('amenities') || ''

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [tier, setTier] = useState(initialTier)
  const [priceRange, setPriceRange] = useState(() => {
    if (initialMinPrice || initialMaxPrice) {
      const found = PRICE_RANGES.find(
        r => r.min === initialMinPrice && r.max === initialMaxPrice
      )
      return found?.label || 'Any'
    }
    return 'Any'
  })
  const [sort, setSort] = useState(initialSort || 'newest')
  const [amenities, setAmenities] = useState<string[]>(
    initialAmenities ? initialAmenities.split(',').filter(Boolean) : []
  )

  // Proximity state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedRadius, setSelectedRadius] = useState<number>(5000) // 5km default
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isProximityActive, setIsProximityActive] = useState(false)

  // UI state
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  // Temporary filter state (for sheet)
  const [tempCategory, setTempCategory] = useState(initialCategory || 'All')
  const [tempTier, setTempTier] = useState(initialTier || 'All')
  const [tempPriceRange, setTempPriceRange] = useState(() => {
    if (initialMinPrice || initialMaxPrice) {
      const found = PRICE_RANGES.find(
        r => r.min === initialMinPrice && r.max === initialMaxPrice
      )
      return found?.label || 'Any'
    }
    return 'Any'
  })
  const [tempAmenities, setTempAmenities] = useState<string[]>(
    initialAmenities ? initialAmenities.split(',').filter(Boolean) : []
  )

  const sessionId = getSessionId()
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search input to avoid rapid API calls
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

  // Check auth on mount
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

  // Fetch favorites on mount
  useEffect(() => {
    async function fetchFavorites() {
      try {
        const urlParam = isAuthenticated ? '' : `?sessionId=${sessionId}`
        const res = await fetch(`/api/favorites${urlParam}`)
        const data = await res.json()
        setFavorites(new Set((data || []).map((f: Listing) => f.id)))
      } catch {
        // Ignore
      }
    }
    fetchFavorites()
  }, [sessionId, isAuthenticated])

  // Parse current price range
  const currentPriceRange = useMemo(() => {
    return PRICE_RANGES.find(r => r.label === priceRange) || PRICE_RANGES[0]
  }, [priceRange])

  // Build API query params (uses debounced search)
  const buildQueryParams = useCallback(() => {
    const params: Record<string, string> = {}
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
    if (category && category !== 'All') params.category = category
    if (tier && tier !== 'All') params.tier = tier.toLowerCase()
    if (currentPriceRange.min) params.minPrice = currentPriceRange.min
    if (currentPriceRange.max) params.maxPrice = currentPriceRange.max
    if (amenities.length > 0) params.amenities = amenities.join(',')
    // Add proximity params
    if (isProximityActive && userLocation) {
      params.lat = String(userLocation.lat)
      params.lng = String(userLocation.lng)
      params.radius = String(selectedRadius)
    }
    return params
  }, [debouncedSearch, category, tier, currentPriceRange, amenities, isProximityActive, userLocation, selectedRadius])

  // Fetch listings
  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true)
      try {
        const params = buildQueryParams()
        const qs = new URLSearchParams(params).toString()
        const res = await fetch(`/api/listings${qs ? `?${qs}` : ''}`)
        const data = await res.json()
        setListings(Array.isArray(data) ? data : [])
        setDisplayCount(ITEMS_PER_PAGE)
      } catch (error) {
        console.error('Failed to fetch listings:', error)
        setListings([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchListings()
  }, [buildQueryParams])

  // Handle "Near Me" button click
  const handleNearMe = useCallback(() => {
    if (isProximityActive) {
      // Deactivate proximity search
      setIsProximityActive(false)
      setLocationError(null)
      return
    }

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setIsProximityActive(true)
        setIsLocating(false)
        setLocationError(null)
      },
      (error) => {
        setIsLocating(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location access required for nearby search')
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable')
            break
          case error.TIMEOUT:
            setLocationError('Location request timed out')
            break
          default:
            setLocationError('An unknown error occurred')
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }, [isProximityActive])

  // Handle radius change
  const handleRadiusChange = useCallback((radius: number) => {
    setSelectedRadius(radius)
  }, [])

  // Sort listings client-side
  const sortedListings = useMemo(() => {
    const sorted = [...listings]
    // In proximity mode, server already sorts by distance
    if (!isProximityActive) {
      switch (sort) {
        case 'price-asc':
          sorted.sort((a, b) => a.price - b.price)
          break
        case 'price-desc':
          sorted.sort((a, b) => b.price - a.price)
          break
        case 'top':
          sorted.sort((a, b) => getRating(b.id) - getRating(a.id))
          break
        case 'newest':
        default:
          sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          break
      }
    }
    return sorted
  }, [listings, sort, isProximityActive])

  const displayedListings = sortedListings.slice(0, displayCount)
  const hasMore = displayCount < sortedListings.length

  // Active filters check
  const hasActiveFilters = (category && category !== 'All') ||
    (tier && tier !== 'All') ||
    priceRange !== 'Any' ||
    searchQuery.trim().length > 0 ||
    amenities.length > 0 ||
    isProximityActive

  // Remove individual amenity
  const removeAmenity = useCallback((amenity: string) => {
    setAmenities(prev => prev.filter(a => a !== amenity))
    setTempAmenities(prev => prev.filter(a => a !== amenity))
  }, [])

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery('')
    setCategory('All')
    setTier('All')
    setPriceRange('Any')
    setSort('newest')
    setAmenities([])
    setTempCategory('All')
    setTempTier('All')
    setTempPriceRange('Any')
    setTempAmenities([])
    setIsProximityActive(false)
    setUserLocation(null)
    setLocationError(null)
    router.push('/explore', { scroll: false })
  }, [router])

  const removeFilter = useCallback((type: 'category' | 'tier' | 'price' | 'search' | 'amenities' | 'proximity') => {
    switch (type) {
      case 'category':
        setCategory('All')
        setTempCategory('All')
        break
      case 'tier':
        setTier('All')
        setTempTier('All')
        break
      case 'price':
        setPriceRange('Any')
        setTempPriceRange('Any')
        break
      case 'search':
        setSearchQuery('')
        break
      case 'amenities':
        setAmenities([])
        setTempAmenities([])
        break
      case 'proximity':
        setIsProximityActive(false)
        setUserLocation(null)
        setLocationError(null)
        break
    }
  }, [])

  // Apply filters from sheet
  const applyFilters = useCallback(() => {
    setCategory(tempCategory === 'All' ? '' : tempCategory)
    setTier(tempTier === 'All' ? '' : tempTier)
    setPriceRange(tempPriceRange)
    setAmenities(tempAmenities)
    setFilterSheetOpen(false)
  }, [tempCategory, tempTier, tempPriceRange, tempAmenities])

  // Reset sheet filters
  const resetSheetFilters = useCallback(() => {
    setTempCategory('All')
    setTempTier('All')
    setTempPriceRange('Any')
    setTempAmenities([])
  }, [])

  // Toggle favorite
  const toggleFavorite = useCallback(async (listingId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const isFav = favorites.has(listingId)

    try {
      if (isFav) {
        const urlParam = isAuthenticated
          ? `?listingId=${listingId}`
          : `?listingId=${listingId}&sessionId=${sessionId}`
        await fetch(`/api/favorites${urlParam}`, { method: 'DELETE' })
        setFavorites(prev => {
          const next = new Set(prev)
          next.delete(listingId)
          return next
        })
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId, sessionId: isAuthenticated ? undefined : sessionId }),
        })
        setFavorites(prev => new Set(prev).add(listingId))
      }
    } catch {
      // Ignore
    }
  }, [sessionId, isAuthenticated, favorites])

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      {/* A. Green Header Bar */}
      <header className="sticky top-0 z-40 bg-[#006633]">
        <div className="flex items-center px-4 py-3 gap-3">
          {/* Home button */}
          <Link
            href="/"
            className="shrink-0 flex items-center gap-1 hover:opacity-80"
          >
            <Home className="size-5 text-white" />
          </Link>
          {/* Clickable Logo */}
          <Link href="/" className="shrink-0 hover:opacity-80">
            <h1 className="text-white font-bold text-lg tracking-tight">
              Housemate<span className="text-[#4ade80]">.zm</span>
            </h1>
          </Link>
        </div>

        {/* Premium search bar - larger with better focus states */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search location, property type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-12 text-sm rounded-xl bg-white text-gray-800 placeholder:text-gray-400 outline-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] focus:shadow-[inset_0_1px_3px_rgba(0,0,0,0.06),0_0_0_3px_rgba(255,255,255,0.2)] transition-shadow"
            />
            {/* Filter button inside search */}
            <button
              onClick={() => setFilterSheetOpen(true)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl flex items-center justify-center ${
                hasActiveFilters
                  ? 'bg-[#006633] text-white shadow-md shadow-[#006633]/20'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {/* B. Active Filters Bar */}
        {hasActiveFilters && (
          <div className="px-4 py-2.5 bg-white border-b border-gray-100 animate-fade-in">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
              {searchQuery.trim() && (
                <FilterChip
                  label={`"${searchQuery.trim()}"`}
                  onRemove={() => removeFilter('search')}
                />
              )}
              {category && category !== 'All' && (
                <FilterChip
                  label={category}
                  onRemove={() => removeFilter('category')}
                />
              )}
              {tier && tier !== 'All' && (
                <FilterChip
                  label={tier}
                  onRemove={() => removeFilter('tier')}
                />
              )}
              {priceRange !== 'Any' && (
                <FilterChip
                  label={priceRange}
                  onRemove={() => removeFilter('price')}
                />
              )}
              {amenities.map(amenity => (
                <FilterChip
                  key={amenity}
                  label={amenity}
                  onRemove={() => removeAmenity(amenity)}
                />
              ))}
              {isProximityActive && (
                <FilterChip
                  label={`Near Me (${(selectedRadius / 1000).toFixed(0)} km)`}
                  onRemove={() => removeFilter('proximity')}
                />
              )}
              <button
                onClick={clearAllFilters}
                className="text-[11px] font-semibold text-[#006633] whitespace-nowrap ml-1 hover:text-[#004d26]"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* C. Results Info Bar */}
        {!isLoading && (
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">
              {sortedListings.length} listing{sortedListings.length !== 1 ? 's' : ''} found
            </p>
            <div className="flex items-center gap-2">
              {/* Near Me button */}
              <button
                onClick={handleNearMe}
                disabled={isLocating}
                className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  isProximityActive
                    ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                } ${isLocating ? 'opacity-60 cursor-wait' : ''}`}
              >
                {isLocating ? (
                  <>
                    <div className="size-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span>Locating...</span>
                  </>
                ) : isProximityActive ? (
                  <>
                    <LocateFixed className="size-3.5" />
                    <span>Near Me</span>
                  </>
                ) : (
                  <>
                    <Navigation className="size-3.5" />
                    <span>Near Me</span>
                  </>
                )}
              </button>

              {/* View mode toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('list')}
                  className={`h-7 w-7 rounded-md flex items-center justify-center transition-all ${
                    viewMode === 'list' ? 'bg-white shadow-sm text-[#006633]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <LayoutGrid className="size-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`h-7 w-7 rounded-md flex items-center justify-center transition-all ${
                    viewMode === 'map' ? 'bg-white shadow-sm text-[#006633]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Map className="size-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="size-3.5 text-gray-400" />
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="h-8 text-xs border-gray-200 bg-white w-auto min-w-[130px] rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Location Error Message */}
        {locationError && (
          <div className="px-4 pb-3 animate-fade-in">
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200/60">
              <div className="shrink-0 h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center">
                <Navigation className="size-3.5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-800">{locationError}</p>
                <p className="text-[11px] text-amber-600 mt-0.5">Enable location access in your browser settings to search nearby properties.</p>
              </div>
              <button
                onClick={() => setLocationError(null)}
                className="shrink-0 h-6 w-6 rounded-full bg-amber-100 hover:bg-amber-200 flex items-center justify-center transition-colors"
              >
                <X className="size-3 text-amber-600" />
              </button>
            </div>
          </div>
        )}

        {/* Radius Selector (shown when proximity is active) */}
        {isProximityActive && !locationError && (
          <div className="px-4 pb-3 animate-fade-in">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
              <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap mr-0.5">Radius:</span>
              {RADIUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleRadiusChange(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all duration-200 ${
                    selectedRadius === opt.value
                      ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State - Skeleton Grid with shimmer */}
        {isLoading && (
          <div className="px-4 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="aspect-[3/2] w-full shimmer" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 w-full rounded shimmer" />
                    <div className="h-3 w-1/2 rounded shimmer" />
                    <div className="h-3 w-2/3 rounded shimmer" />
                    <div className="h-4 w-1/3 rounded shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* D. Results Grid with staggered animation */}
        {!isLoading && displayedListings.length > 0 && viewMode === 'list' && (
          <div className="px-4 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {displayedListings.map((listing, index) => (
                <div key={listing.id} className="animate-fade-in" style={{ animationDelay: `${index * 60}ms` }}>
                  <ExploreCard
                    listing={listing}
                    isFavorited={favorites.has(listing.id)}
                    onToggleFavorite={toggleFavorite}
                    onClick={() => router.push(`/listings/${listing.id}`)}
                    showDistance={isProximityActive}
                  />
                </div>
              ))}
            </div>

            {/* F. Load More */}
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setDisplayCount(prev => prev + ITEMS_PER_PAGE)}
                  className="px-8 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  Load More ({sortedListings.length - displayCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}

        {/* D2. Map View */}
        {!isLoading && sortedListings.length > 0 && viewMode === 'map' && (
          <div className="h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] animate-fade-in">
            <MapView
              listings={sortedListings}
              favorites={favorites}
              userLocation={isProximityActive ? userLocation : null}
              searchRadius={isProximityActive ? selectedRadius : null}
            />
          </div>
        )}

        {/* H. Empty State */}
        {!isLoading && displayedListings.length === 0 && (
          <div className="flex flex-col items-center justify-center px-4 py-24 animate-fade-in">
            <div className="relative mb-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
                <Search className="size-10 text-gray-300" />
              </div>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-1.5">
              No listings found
            </h3>
            <p className="text-sm text-gray-400 mb-6 text-center max-w-[260px] leading-relaxed">
              {isProximityActive
                ? 'No properties found within your selected radius. Try increasing the search distance.'
                : 'Try adjusting your search or filters'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#006633] to-[#004d26] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#006633]/25"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </main>

      {/* E. Filters Sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto px-4 pb-8">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-base font-bold text-gray-900">Filters</SheetTitle>
            <SheetDescription>Refine your search results</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-2">
            {/* Category Filter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setTempCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium ${
                      tempCategory === cat
                        ? 'bg-gradient-to-r from-[#006633] to-[#004d26] text-white shadow-sm shadow-[#006633]/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Price Range */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                Price Range
              </label>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map(range => (
                  <button
                    key={range.label}
                    onClick={() => setTempPriceRange(range.label)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium ${
                      tempPriceRange === range.label
                        ? 'bg-gradient-to-r from-[#006633] to-[#004d26] text-white shadow-sm shadow-[#006633]/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tier Filter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                Tier
              </label>
              <div className="flex flex-wrap gap-2">
                {TIERS.map(t => (
                  <button
                    key={t}
                    onClick={() => setTempTier(t)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium ${
                      tempTier === t
                        ? 'bg-gradient-to-r from-[#006633] to-[#004d26] text-white shadow-sm shadow-[#006633]/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Amenities Filter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_OPTIONS.map(amenity => {
                  const isActive = tempAmenities.includes(amenity)
                  return (
                    <button
                      key={amenity}
                      onClick={() => setTempAmenities(prev =>
                        isActive ? prev.filter(a => a !== amenity) : [...prev, amenity]
                      )}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#006633] to-[#004d26] text-white shadow-sm shadow-[#006633]/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {amenity}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={resetSheetFilters}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#007a3d] hover:to-[#005f2e] shadow-sm shadow-[#006633]/20"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// Filter chip with smooth remove animation
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-[#006633]/10 text-[#006633] text-[11px] font-semibold whitespace-nowrap shrink-0 animate-fade-in">
      {label}
      <button
        onClick={onRemove}
        className="h-4 w-4 rounded-full bg-[#006633]/20 flex items-center justify-center hover:bg-[#006633]/30 hover:scale-110 active:scale-90"
      >
        <X className="size-2.5" />
      </button>
    </span>
  )
}

// Explore card - premium version with distance support
function ExploreCard({
  listing,
  isFavorited,
  onToggleFavorite,
  onClick,
  showDistance,
}: {
  listing: Listing
  isFavorited: boolean
  onToggleFavorite: (listingId: string, e: React.MouseEvent) => void
  onClick: () => void
  showDistance?: boolean
}) {
  const rating = getRating(listing.id)

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg card-premium cursor-pointer border border-gray-100/80"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

        {/* Distance badge */}
        {showDistance && listing.distance != null && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-blue-500/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            <MapPin className="size-2.5" />
            {listing.distance} km
          </span>
        )}

        {/* Tier badge with glow */}
        {listing.tier !== 'standard' && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 bg-[#006633] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md verified-glow">
            Verified
          </span>
        )}

        {/* Heart button with scale */}
        <button
          onClick={(e) => onToggleFavorite(listing.id, e)}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 active:scale-90"
        >
          <Heart
            className={`size-3.5 ${
              isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-2.5 space-y-1">
        {/* Title */}
        <h3 className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-snug">
          {listing.title}
        </h3>

        {/* Category + Rating */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-medium">{listing.category}</span>
          <div className="flex items-center gap-0.5">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-semibold text-gray-700">{rating.toFixed(1)}</span>
          </div>
        </div>

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
  )
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9fa]">
          <header className="sticky top-0 z-40 bg-[#006633] h-24" />
          <div className="px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="aspect-[3/2] w-full shimmer" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 w-full rounded shimmer" />
                    <div className="h-3 w-1/2 rounded shimmer" />
                    <div className="h-3 w-2/3 rounded shimmer" />
                    <div className="h-4 w-1/3 rounded shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ExplorePageContent />
    </Suspense>
  )
}
