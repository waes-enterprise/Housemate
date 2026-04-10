'use client'

import { Heart, MapPin, Star, ShieldCheck, Zap, Check, Car, Shield, Wifi, Droplets, Sun, Zap as ZapIcon, Wind, Waves, TreePine, Tv, Gauge, Lock, Grid3X3, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { useState } from 'react'

export interface Listing {
  id: string
  title: string
  description: string
  price: number
  priceUnit: string
  location: string
  category: string
  imageUrl: string
  tier: string
  contactPhone?: string | null
  contactEmail?: string | null
  isFeatured: boolean
  createdAt: string
  ownerId?: string | null
  rating?: number | null
  amenities?: string
  amenitiesList?: string[]
  latitude?: number | null
  longitude?: number | null
  distance?: number | null
  ownerIsVerifiedAgent?: boolean
  ownerName?: string | null
}

export function formatPrice(price: number) {
  return `K${price.toLocaleString()}`
}

function TimeAgo({ dateStr }: { dateStr: string }) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHrs / 24)

  if (diffHrs < 1) return 'Just now'
  if (diffHrs < 24) return `${diffHrs}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return `${Math.floor(diffDays / 7)}w ago`
}

// Check if listing is new (within 48 hours)
function isNewListing(dateStr: string): boolean {
  const now = new Date()
  const date = new Date(dateStr)
  const diffHrs = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  return diffHrs <= 48
}

// Amenity icon helper for cards
const CARD_AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Parking': <Car className="size-2.5" />,
  'Security Guard': <Shield className="size-2.5" />,
  'WiFi': <Wifi className="size-2.5" />,
  'Air Conditioning': <Wind className="size-2.5" />,
  'CCTV': <Zap className="size-2.5" />,
  'Swimming Pool': <Waves className="size-2.5" />,
  'Solar Power': <Sun className="size-2.5" />,
  'Generator': <ZapIcon className="size-2.5" />,
  'Borehole/Well': <Droplets className="size-2.5" />,
  'Water Tank': <Gauge className="size-2.5" />,
  'Garden': <TreePine className="size-2.5" />,
  'Electric Fence': <Lock className="size-2.5" />,
  'Tiled Floor': <Grid3X3 className="size-2.5" />,
  'Servants Quarters': <Users className="size-2.5" />,
  'Wall Fence': <Lock className="size-2.5" />,
  'DSTV': <Tv className="size-2.5" />,
  'Built-in Cupboards': <Grid3X3 className="size-2.5" />,
  'Prepaid Electricity': <Gauge className="size-2.5" />,
  'Balcony': <Grid3X3 className="size-2.5" />,
  'Gate': <Lock className="size-2.5" />,
}

function parseListingAmenities(listing: Listing): string[] {
  if (listing.amenitiesList && Array.isArray(listing.amenitiesList)) return listing.amenitiesList
  if (!listing.amenities || listing.amenities === '[]') return []
  try {
    const parsed = JSON.parse(listing.amenities)
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return []
   }
}



interface ListingCardProps {
  listing: Listing
  isFavorited: boolean
  onToggleFavorite: (listing: Listing) => void
  onSelectListing: (listing: Listing) => void
  isCompareSelected?: boolean
  onToggleCompare?: (listing: Listing) => void
}

export function ListingCard({
  listing,
  isFavorited,
  onToggleFavorite,
  onSelectListing,
  isCompareSelected = false,
  onToggleCompare,
}: ListingCardProps) {
  const isNew = isNewListing(listing.createdAt)
  const [heartAnimating, setHeartAnimating] = useState(false)

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(listing)
    // Trigger ring animation
    setHeartAnimating(true)
    setTimeout(() => setHeartAnimating(false), 500)
  }

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleCompare) {
      onToggleCompare(listing)
    }
  }

  return (
    <div
      className={`group relative bg-white rounded-2xl overflow-hidden card-premium card-elevated cursor-pointer transition-all duration-200 ${
        isCompareSelected
          ? 'ring-2 ring-[#006633] shadow-md shadow-[#006633]/10'
          : 'border border-gray-100/80'
      }`}
      onClick={() => onSelectListing(listing)}
    >
      {/* Image section */}
      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100 image-vignette">
        <Image
          src={listing.imageUrl}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
        />

        {/* Gradient overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none z-[2]" />

        {/* Badges container */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
          {/* Verified Agent badge */}
          {listing.ownerIsVerifiedAgent && (
            <span className="inline-flex items-center gap-1 bg-[#006633] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md verified-glow">
              <ShieldCheck className="size-3" />
              Agent
            </span>
          )}
          {/* Verified badge with gradient + glow */}
          {listing.tier !== 'standard' && (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#006633] to-[#005a2c] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-md verified-glow">
              <ShieldCheck className="size-3" />
              Verified
            </span>
          )}
          {/* New badge with vibrant gradient */}
          {isNew && (
            <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-[#f59e0b] to-[#ef4444] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-sm">
              <Zap className="size-2.5" />
              New
            </span>
          )}
        </div>

        {/* Favorite button — larger with ring animation */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-2 right-2 z-10 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 active:scale-95 transition-transform duration-200 ${
            heartAnimating ? 'heart-ring-animate' : ''
          } ${isFavorited ? 'ring-1 ring-red-200/60' : ''}`}
        >
          <Heart
            className={`size-[18px] transition-all duration-200 ${
              isFavorited ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400'
            }`}
          />
        </button>

        {/* Compare selected indicator */}
        {isCompareSelected && (
          <div className="absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 bg-[#006633] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
            <Check className="size-3" />
            Comparing
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-1.5">
        <h3 className="text-[14px] font-bold text-gray-900 line-clamp-2 leading-snug">
          {listing.title}
        </h3>

        {/* Category + rating */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-500 font-medium">{listing.category}</span>
          {listing.rating != null && (
            <div className="flex items-center gap-0.5">
              <Star className="size-3 fill-amber-400 text-amber-400 star-glow" />
              <span className="text-[11px] font-semibold text-gray-700">{listing.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-400">
          <MapPin className="size-3 shrink-0" />
          <span className="text-[11px] truncate">{listing.location}</span>
        </div>

        {/* Subtle separator */}
        <div className="border-t border-gray-100 pt-2">
          {/* Price — prominent with green tint */}
          <span className="text-[17px] font-extrabold text-emerald-700">
            {formatPrice(listing.price)}
          </span>
          <span className="text-[11px] text-gray-400 font-normal ml-0.5">/ {listing.priceUnit}</span>
        </div>

        {/* Top 3 amenities */}
        {(() => {
          const ams = parseListingAmenities(listing).slice(0, 3)
          if (ams.length === 0) return null
          return (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {ams.map(amenity => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-[#006633] text-[10px] font-medium"
                >
                  {CARD_AMENITY_ICONS[amenity]}
                  {amenity}
                </span>
              ))}
            </div>
          )
        })()}

        {/* Compare button */}
        {onToggleCompare && (
          <div className="pt-1">
            <button
              onClick={handleToggleCompare}
              className={`w-full flex items-center justify-center gap-1.5 h-8 rounded-xl text-[11px] font-semibold transition-all duration-200 ${
                isCompareSelected
                  ? 'bg-[#006633]/10 text-[#006633] border border-[#006633]/20 hover:bg-[#006633]/15'
                  : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-[#006633]/5 hover:text-[#006633] hover:border-[#006633]/15'
              }`}
            >
              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5" />
                <path d="M4 20L21 3" />
                <path d="M21 16v5h-5" />
                <path d="M15 15l6 6" />
                <path d="M4 4l5 5" />
              </svg>
              {isCompareSelected ? 'Remove' : 'Compare'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden card-elevated border border-gray-100/80">
      <div className="aspect-[3/2] w-full shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-[18px] w-full rounded shimmer" />
        <div className="h-3 w-1/2 rounded shimmer" />
        <div className="h-3 w-2/3 rounded shimmer" />
        <div className="border-t border-gray-100 pt-2">
          <div className="h-[22px] w-1/3 rounded shimmer" />
        </div>
      </div>
    </div>
  )
}
