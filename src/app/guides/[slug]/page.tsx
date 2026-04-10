'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  MapPin,
  Users,
  Banknote,
  Tag,
  Star,
  Shield,
  Bus,
  GraduationCap,
  Building2,
  ShoppingBag,
  Heart,
  TreePine,
  ChevronRight,
  ArrowRight,
  Search,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { getGuideBySlug } from '@/lib/area-guides'
import type { Listing } from '@/components/marketplace/listing-card'

function getInitials(name: string) {
  return name
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function getRating(id: string): number {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return 3.5 + (hash % 15) / 10
}

const HIGHLIGHT_ICONS = [
  () => <Building2 className="size-4" />,
  () => <ShoppingBag className="size-4" />,
  () => <GraduationCap className="size-4" />,
  () => <Heart className="size-4" />,
  () => <TreePine className="size-4" />,
  () => <Star className="size-4" />,
  () => <Shield className="size-4" />,
  () => <MapPin className="size-4" />,
  () => <Banknote className="size-4" />,
  () => <Users className="size-4" />,
]

const AMENITY_ICON_COMPONENTS: Record<string, () => React.ReactNode> = {
  Mall: () => <ShoppingBag className="size-4" />,
  Market: () => <ShoppingBag className="size-4" />,
  Hospital: () => <Heart className="size-4" />,
  Clinic: () => <Heart className="size-4" />,
  School: () => <GraduationCap className="size-4" />,
  University: () => <GraduationCap className="size-4" />,
  Airport: () => <MapPin className="size-4" />,
  Bank: () => <Banknote className="size-4" />,
  Hotel: () => <Building2 className="size-4" />,
  Supermarket: () => <ShoppingBag className="size-4" />,
  Restaurant: () => <Heart className="size-4" />,
  Gym: () => <TreePine className="size-4" />,
  Pharmacy: () => <Heart className="size-4" />,
  Stadium: () => <Star className="size-4" />,
  Golf: () => <TreePine className="size-4" />,
  Park: () => <TreePine className="size-4" />,
  Church: () => <Building2 className="size-4" />,
  Museum: () => <GraduationCap className="size-4" />,
}

function getAmenityIcon(name: string) {
  for (const [key, IconComp] of Object.entries(AMENITY_ICON_COMPONENTS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return <IconComp />
  }
  return <Building2 className="size-4" />
}

export default function GuideDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const guide = getGuideBySlug(slug)

  const [listings, setListings] = useState<Listing[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(false)

  // Fetch listings matching this area
  useEffect(() => {
    if (!guide) return
    async function fetchListings() {
      setIsLoadingListings(true)
      try {
        const searchTerms = guide.name.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        // Try to match by area name (search for key terms)
        const searchName = searchTerms[0]
        const res = await fetch(
          `/api/listings?search=${encodeURIComponent(searchName)}`
        )
        const data = await res.json()
        setListings(Array.isArray(data) ? data.slice(0, 6) : [])
      } catch {
        setListings([])
      } finally {
        setIsLoadingListings(false)
      }
    }
    fetchListings()
  }, [guide])

  if (!guide) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8f9fa]">
        <header className="sticky top-0 z-40 bg-[#006633]">
          <div className="flex items-center px-4 py-3 gap-3">
            <Link href="/" className="shrink-0 hover:opacity-80">
              <Home className="size-5 text-white" />
            </Link>
            <Link href="/" className="shrink-0 hover:opacity-80">
              <h1 className="text-white font-bold text-lg tracking-tight">
                Housemate<span className="text-[#4ade80]">.zm</span>
              </h1>
            </Link>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
          <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <MapPin className="size-8 text-gray-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-1">Guide Not Found</h2>
          <p className="text-sm text-gray-400 mb-6">
            The area guide you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#006633] to-[#004d26] text-white text-sm font-semibold"
          >
            <ArrowRight className="size-4 rotate-180" />
            Back to Area Guides
          </Link>
        </div>
      </div>
    )
  }

  const descriptionParagraphs = guide.longDescription.split('\n\n')

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
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <div className={`relative bg-gradient-to-br ${guide.gradient} px-4 pt-8 pb-12 overflow-hidden`}>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute -top-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute bottom-0 right-1/4 w-24 h-24 rounded-full bg-white/5" />

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-xs mb-6 animate-fade-in">
              <Link
                href="/"
                className="text-white/60 hover:text-white/90 transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="size-3 text-white/40" />
              <Link
                href="/guides"
                className="text-white/60 hover:text-white/90 transition-colors"
              >
                Area Guides
              </Link>
              <ChevronRight className="size-3 text-white/40" />
              <span className="text-white font-medium">{guide.name}</span>
            </nav>

            {/* Area Name */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight animate-fade-in">
              {guide.name}
            </h1>
            <p className="text-white/70 text-sm mt-2 max-w-xl leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
              {guide.description}
            </p>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-20">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <MapPin className="size-5 text-[#006633]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                  Province
                </p>
                <p className="text-sm font-bold text-gray-900">{guide.province}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Users className="size-5 text-[#006633]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                  Population
                </p>
                <p className="text-sm font-bold text-gray-900">{guide.population}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Banknote className="size-5 text-[#006633]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                  Avg Rent
                </p>
                <p className="text-sm font-bold text-gray-900">{guide.avgRent}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Tag className="size-5 text-[#006633]" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">
                  Avg Sale
                </p>
                <p className="text-sm font-bold text-gray-900">{guide.avgSale}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          {/* Description */}
          <section className="animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="h-1 w-6 rounded-full bg-[#006633]" />
              About {guide.name}
            </h2>
            <div className="space-y-4">
              {descriptionParagraphs.map((para, i) => (
                <p
                  key={i}
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  {para}
                </p>
              ))}
            </div>
          </section>

          {/* Highlights */}
          <section className="animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="h-1 w-6 rounded-full bg-[#006633]" />
              Highlights
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guide.highlights.map((highlight, i) => (
                <div
                  key={highlight}
                  className="flex items-start gap-3 bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-8 w-8 rounded-lg bg-[#006633]/10 flex items-center justify-center shrink-0 text-[#006633]">
                    {HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]()}
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{highlight}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Amenities */}
          <section className="animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="h-1 w-6 rounded-full bg-[#006633]" />
              Amenities & Facilities
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-50">
                {guide.amenities.map((amenity) => (
                  <div
                    key={amenity.name}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-[#006633]/10 flex items-center justify-center shrink-0 text-[#006633]">
                      {getAmenityIcon(amenity.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {amenity.name}
                      </p>
                    </div>
                    {amenity.count && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-semibold bg-green-50 text-[#006633] shrink-0"
                      >
                        {amenity.count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Transport */}
          <section className="animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="h-1 w-6 rounded-full bg-[#006633]" />
              Getting Around
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              {guide.transport.map((option, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3"
                >
                  <div className="h-7 w-7 rounded-lg bg-[#006633]/10 flex items-center justify-center shrink-0 mt-0.5 text-[#006633]">
                    <Bus className="size-3.5" />
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {option}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Safety */}
          <section className="animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="h-1 w-6 rounded-full bg-[#006633]" />
              Safety & Security
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Shield className="size-5 text-amber-600" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {guide.safety}
                </p>
              </div>
            </div>
          </section>

          {/* Best For */}
          <section className="animate-fade-in">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="h-1 w-6 rounded-full bg-[#006633]" />
              Best For
            </h2>
            <div className="flex flex-wrap gap-2">
              {guide.bestFor.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#006633]/10 to-[#004d26]/5 text-[#006633] text-sm font-semibold border border-[#006633]/15"
                >
                  <Users className="size-3.5" />
                  {item}
                </span>
              ))}
            </div>
          </section>

          {/* Properties in this Area */}
          <section className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="h-1 w-6 rounded-full bg-[#006633]" />
                Properties in {guide.name}
              </h2>
              <Link
                href={`/explore?search=${encodeURIComponent(guide.name)}`}
                className="text-xs font-semibold text-[#006633] hover:text-[#004d26] flex items-center gap-1 transition-colors"
              >
                See all
                <ArrowRight className="size-3" />
              </Link>
            </div>

            {isLoadingListings ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
                  >
                    <Skeleton className="aspect-[3/2] w-full" />
                    <div className="p-3 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {listings.map((listing) => {
                  const rating = getRating(listing.id)
                  return (
                    <Link
                      key={listing.id}
                      href={`/listings/${listing.id}`}
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                        <img
                          src={listing.imageUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        {listing.tier !== 'standard' && (
                          <span className="absolute top-2 left-2 inline-flex items-center gap-0.5 bg-[#006633] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                            Verified
                          </span>
                        )}
                      </div>
                      {/* Content */}
                      <div className="p-2.5 space-y-1">
                        <h3 className="text-[13px] font-semibold text-gray-900 line-clamp-2 leading-snug">
                          {listing.title}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-400">
                          <MapPin className="size-3 shrink-0" />
                          <span className="text-[11px] truncate">
                            {listing.location}
                          </span>
                        </div>
                        <div className="pt-0.5">
                          <span className="text-base font-extrabold text-gray-900">
                            K{listing.price.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-gray-400 font-normal">
                            {' '}
                            / {listing.priceUnit}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Search className="size-6 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  No listings found for this area
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Check back soon or explore all properties
                </p>
                <Link
                  href={`/explore?search=${encodeURIComponent(guide.name)}`}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#006633] to-[#004d26] text-white text-xs font-semibold hover:shadow-lg hover:shadow-[#006633]/25 transition-all"
                >
                  Explore Properties
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            )}
          </section>

          {/* Explore Properties CTA */}
          <section className="animate-fade-in">
            <div className="bg-gradient-to-r from-[#006633] to-[#004d26] rounded-2xl p-6 md:p-8 text-center relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-white/5 blur-2xl" />
              <div className="absolute -bottom-12 -left-12 w-28 h-28 rounded-full bg-white/5 blur-2xl" />
              <div className="relative z-10">
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                  Ready to explore properties in {guide.name}?
                </h3>
                <p className="text-green-200 text-sm mb-5 max-w-md mx-auto">
                  Browse all available listings in {guide.name} and find your
                  perfect property today.
                </p>
                <Link
                  href={`/explore?search=${encodeURIComponent(guide.name)}`}
                  className="inline-flex items-center gap-2 h-11 px-7 rounded-xl bg-white text-[#006633] font-semibold text-sm hover:bg-green-50 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                >
                  Explore Properties in {guide.name}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
