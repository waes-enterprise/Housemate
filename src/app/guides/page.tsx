'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Home,
  Search,
  MapPin,
  ChevronRight,
  Banknote,
  Tag,
  ArrowRight,
  X,
} from 'lucide-react'
import { areaGuides, getProvinces } from '@/lib/area-guides'
import { Badge } from '@/components/ui/badge'

function getInitials(name: string) {
  return name
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const GRADIENT_COLORS: Record<string, string> = {
  'from-emerald-600 to-teal-700': 'emerald',
  'from-green-700 to-emerald-800': 'emerald',
  'from-teal-700 to-cyan-800': 'teal',
  'from-green-600 to-lime-700': 'lime',
  'from-amber-600 to-orange-700': 'amber',
  'from-yellow-600 to-amber-700': 'yellow',
  'from-sky-600 to-blue-700': 'sky',
  'from-stone-600 to-zinc-700': 'zinc',
}

export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')

  const provinces = useMemo(() => getProvinces(), [])

  const filteredGuides = useMemo(() => {
    return areaGuides.filter((guide) => {
      const matchesSearch =
        !searchQuery.trim() ||
        guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.province.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesProvince =
        !selectedProvince || guide.province === selectedProvince
      return matchesSearch && matchesProvince
    })
  }, [searchQuery, selectedProvince])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedProvince('')
  }

  const hasActiveFilters = searchQuery.trim() || selectedProvince

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
      {/* Green Header */}
      <header className="sticky top-0 z-40 bg-[#006633]">
        <div className="flex items-center px-4 py-3 gap-3">
          <Link
            href="/"
            className="shrink-0 flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <Home className="size-5 text-white" />
          </Link>
          <Link href="/" className="shrink-0 hover:opacity-80 transition-opacity">
            <h1 className="text-white font-bold text-lg tracking-tight">
              Housemate<span className="text-[#4ade80]">.zm</span>
            </h1>
          </Link>
          <span className="text-white/40 mx-0.5">|</span>
          <h2 className="text-white/90 font-medium text-base">Area Guides</h2>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search areas, provinces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-12 pr-4 text-sm rounded-xl bg-white text-gray-800 placeholder:text-gray-400 outline-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] focus:shadow-[inset_0_1px_3px_rgba(0,0,0,0.06),0_0_0_3px_rgba(255,255,255,0.2)] transition-shadow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="size-3 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Province filters */}
        <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedProvince('')}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              !selectedProvince
                ? 'bg-white text-[#006633] shadow-sm'
                : 'bg-white/15 text-white/80 hover:bg-white/25'
            }`}
          >
            All Provinces
          </button>
          {provinces.map((prov) => (
            <button
              key={prov}
              onClick={() =>
                setSelectedProvince(selectedProvince === prov ? '' : prov)
              }
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                selectedProvince === prov
                  ? 'bg-white text-[#006633] shadow-sm'
                  : 'bg-white/15 text-white/80 hover:bg-white/25'
              }`}
            >
              {prov}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Results Info */}
        <div className="px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-medium">
            {filteredGuides.length} area{filteredGuides.length !== 1 ? 's' : ''}{' '}
            found
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-[#006633] hover:text-[#004d26] transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Area Guide Cards Grid */}
        <div className="px-4 pb-8">
          {filteredGuides.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGuides.map((guide, index) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {/* Gradient Image Placeholder */}
                  <div
                    className={`relative h-44 bg-gradient-to-br ${guide.gradient} flex items-center justify-center overflow-hidden`}
                  >
                    {/* Decorative circles */}
                    <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
                    <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white/5" />

                    <span className="relative text-6xl font-extrabold text-white/25 select-none">
                      {getInitials(guide.name)}
                    </span>

                    {/* Province badge */}
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant="secondary"
                        className="bg-white/90 text-gray-800 text-[10px] font-semibold backdrop-blur-sm hover:bg-white"
                      >
                        <MapPin className="size-3 mr-1" />
                        {guide.province}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-[#006633] transition-colors">
                        {guide.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {guide.description}
                      </p>
                    </div>

                    {/* Rent & Sale */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Banknote className="size-3.5 text-[#006633]" />
                        <span className="font-medium">Rent:</span>
                        <span className="text-gray-500">{guide.avgRent}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Tag className="size-3.5 text-[#006633]" />
                      <span className="font-medium">Sale:</span>
                      <span className="text-gray-500">{guide.avgSale}</span>
                    </div>

                    {/* Best For Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {guide.bestFor.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 text-[#006633] text-[10px] font-semibold"
                        >
                          {item}
                        </span>
                      ))}
                      {guide.bestFor.length > 3 && (
                        <span className="text-[10px] text-gray-400 font-medium self-center">
                          +{guide.bestFor.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* View Guide CTA */}
                    <div className="pt-1 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">
                        {guide.highlights.length} highlights
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#006633] group-hover:gap-2 transition-all">
                        View Guide
                        <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="relative mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
                  <MapPin className="size-8 text-gray-300" />
                </div>
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1.5">
                No areas found
              </h3>
              <p className="text-sm text-gray-400 mb-6 text-center max-w-[260px] leading-relaxed">
                No guides match your search. Try different keywords or clear your
                filters.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#006633] to-[#004d26] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#006633]/25 transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
