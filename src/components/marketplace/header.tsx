'use client'

import { Search, MapPin, SlidersHorizontal, ChevronDown, User, LogOut, Menu, X } from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

interface UserState {
  id: string
  name: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
  role: string
}

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  activeView: 'list' | 'map'
  onViewChange: (view: 'list' | 'map') => void
  onOpenProfile?: () => void
  activeCategory?: string
  onCategoryChange?: (category: string) => void
  activePriceRange?: string
  onPriceRangeChange?: (range: string) => void
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

const CATEGORIES = [
  'All', 'Rooms', 'Farms', 'Offices', 'Storage', 'Event Spaces',
  'Garages', 'Warehouses', 'Land', 'Shops', 'Parking',
]

export function Header({
  searchQuery,
  onSearchChange,
  activeView,
  onViewChange,
  onOpenProfile,
  activeCategory = 'All',
  onCategoryChange,
  activePriceRange = 'Any Price',
  onPriceRangeChange,
}: HeaderProps) {
  const [user, setUser] = useState<UserState | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Temporary filter state for the sheet - sync with props when sheet opens
  const [tempCategory, setTempCategory] = useState(activeCategory)
  const [tempPriceRange, setTempPriceRange] = useState(activePriceRange)

  // Sync temp state when sheet opens (not in an effect)
  const openFilterSheet = () => {
    setTempCategory(activeCategory)
    setTempPriceRange(activePriceRange)
    setFilterSheetOpen(true)
  }

  // Fetch session on mount
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
        }
      } catch {
        // Ignore errors
      }
    }
    fetchSession()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setShowDropdown(false)
      window.location.href = '/'
    } catch {
      // Ignore
    }
  }

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Apply filters from sheet
  const applyFilters = () => {
    onCategoryChange?.(tempCategory)
    onPriceRangeChange?.(tempPriceRange)
    setFilterSheetOpen(false)
  }

  // Reset filters
  const resetFilters = () => {
    setTempCategory('All')
    setTempPriceRange('Any Price')
    onCategoryChange?.('All')
    onPriceRangeChange?.('Any Price')
  }

  // Check if any filters are active
  const hasActiveFilters = activeCategory !== 'All' || activePriceRange !== 'Any Price' || searchQuery.trim().length > 0

  return (
    <header className="sticky top-0 z-40 bg-[#006633] gradient-border-bottom">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none" />

      {/* Top bar */}
      <div className="relative flex items-center px-4 py-3 gap-3">
        {/* Logo */}
        <div className="shrink-0">
          <h1 className="text-white font-bold text-xl tracking-wide">
            Housemate<span className="text-[#4ade80]">.zm</span>
          </h1>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Notification Bell */}
        <NotificationBell />

        {/* Auth button / User avatar */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:opacity-90"
            >
              <div className="h-8 w-8 rounded-full bg-[#004d26] border-2 border-white/30 flex items-center justify-center hover:border-white/50">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-xs font-bold">
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
              <ChevronDown className={`size-3 text-white/70 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100/80 overflow-hidden z-50 animate-dropdown-in">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      onOpenProfile?.()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f0fdf4] hover:text-[#006633]"
                  >
                    <User className="size-4 text-gray-400" />
                    My Profile
                  </button>
                  <Link
                    href="/my-listings"
                    onClick={() => setShowDropdown(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f0fdf4] hover:text-[#006633]"
                  >
                    <Menu className="size-4 text-gray-400" />
                    My Listings
                  </Link>
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/auth/signin"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-white to-white/90 text-[#006633] text-sm font-semibold shadow-sm hover:shadow-md hover:scale-[1.02]"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Search bar */}
      <div className="relative px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-[18px] text-gray-400" />
          <input
            type="text"
            placeholder="Search location, property type..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-11 pr-4 text-sm rounded-2xl bg-white text-gray-800 placeholder:text-gray-300 outline-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.04)] search-glow"
          />
        </div>
      </div>

      {/* Filter buttons row */}
      <div className="relative px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {/* Filters button - opens filter sheet */}
        <button
          onClick={openFilterSheet}
          className={`flex items-center gap-1.5 px-3 py-[5px] rounded-xl backdrop-blur-md text-[11px] font-medium whitespace-nowrap shrink-0 border shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-200 ${
            hasActiveFilters
              ? 'bg-white text-[#006633] border-white/60'
              : 'bg-white/[0.12] text-white border-white/[0.08] hover:bg-white/20 hover:border-white/[0.15]'
          }`}
        >
          <SlidersHorizontal className="size-3" />
          Filters
          {hasActiveFilters && (
            <span className="ml-0.5 h-4 w-4 rounded-full bg-[#006633] text-white text-[9px] font-bold flex items-center justify-center">
              !
            </span>
          )}
        </button>

        {/* Where button - focuses search input */}
        <button
          onClick={() => {
            const input = document.querySelector('header input[type="text"]') as HTMLInputElement
            if (input) input.focus()
          }}
          className={`flex items-center gap-1.5 px-3 py-[5px] rounded-xl backdrop-blur-md text-[11px] font-medium whitespace-nowrap shrink-0 border shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-200 ${
            searchQuery.trim()
              ? 'bg-white text-[#006633] border-white/60'
              : 'bg-white/[0.12] text-white border-white/[0.08] hover:bg-white/20 hover:border-white/[0.15]'
          }`}
        >
          <MapPin className="size-3" />
          Where
          <ChevronDown className="size-2.5" />
        </button>

        {/* Type button - opens filter sheet (category section) */}
        <button
          onClick={openFilterSheet}
          className={`flex items-center gap-1.5 px-3 py-[5px] rounded-xl backdrop-blur-md text-[11px] font-medium whitespace-nowrap shrink-0 border shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-200 ${
            activeCategory !== 'All'
              ? 'bg-white text-[#006633] border-white/60'
              : 'bg-white/[0.12] text-white border-white/[0.08] hover:bg-white/20 hover:border-white/[0.15]'
          }`}
        >
          Type
          <ChevronDown className="size-2.5" />
        </button>

        {/* Price Range button - opens filter sheet (price section) */}
        <button
          onClick={openFilterSheet}
          className={`flex items-center gap-1.5 px-3 py-[5px] rounded-xl backdrop-blur-md text-[11px] font-medium whitespace-nowrap shrink-0 border shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-all duration-200 ${
            activePriceRange !== 'Any Price'
              ? 'bg-white text-[#006633] border-white/60'
              : 'bg-white/[0.12] text-white border-white/[0.08] hover:bg-white/20 hover:border-white/[0.15]'
          }`}
        >
          Price Range
          <ChevronDown className="size-2.5" />
        </button>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2 py-[5px] rounded-xl bg-white/10 text-white/80 text-[11px] font-medium whitespace-nowrap shrink-0 border border-white/[0.06] hover:bg-white/20 transition-all duration-200"
          >
            <X className="size-3" />
            Clear
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* List / Map toggle */}
        <div className="flex items-center rounded-xl bg-white/[0.12] backdrop-blur-md p-[3px] shrink-0 border border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <button
            onClick={() => onViewChange('list')}
            className={`px-3 py-[3px] rounded-lg text-[11px] font-medium transition-all duration-200 ${
              activeView === 'list'
                ? 'bg-white text-[#006633] shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            List
          </button>
          <button
            onClick={() => onViewChange('map')}
            className={`px-3 py-[3px] rounded-lg text-[11px] font-medium transition-all duration-200 ${
              activeView === 'map'
                ? 'bg-white text-[#006633] shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Map
          </button>
        </div>
      </div>

      {/* Filter Sheet */}
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
                Property Type
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setTempCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
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

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setTempCategory('All')
                  setTempPriceRange('Any Price')
                }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#007a3d] hover:to-[#005f2e] shadow-sm shadow-[#006633]/20 transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
