'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Badge } from '@/components/ui/badge'
import { MapPin, Crown, Star, Zap } from 'lucide-react'

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
}

function TierBadge({ tier }: { tier: string }) {
  switch (tier) {
    case 'premium':
      return (
        <Badge className="absolute top-2 left-2 bg-amber-500 text-white border-0 rounded-full text-[10px] px-2 gap-0.5 z-10">
          <Crown className="size-3" />
          Premium
        </Badge>
      )
    case 'featured':
      return (
        <Badge className="absolute top-2 left-2 bg-emerald-500 text-white border-0 rounded-full text-[10px] px-2 gap-0.5 z-10">
          <Star className="size-3" />
          Featured
        </Badge>
      )
    case 'spotlight':
      return (
        <Badge className="absolute top-2 left-2 bg-sky-500 text-white border-0 rounded-full text-[10px] px-2 gap-0.5 z-10">
          <Zap className="size-3" />
          Spotlight
        </Badge>
      )
    default:
      return null
  }
}

function TimeAgo({ dateStr }: { dateStr: string }) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHrs / 24)

  let label = ''
  let isUrgent = false

  if (diffHrs < 1) {
    label = 'Just now'
    isUrgent = true
  } else if (diffHrs < 24) {
    label = `${diffHrs}h ago`
    isUrgent = true
  } else if (diffDays < 7) {
    label = `${diffDays}d ago`
  } else {
    label = `${Math.floor(diffDays / 7)}w ago`
  }

  return (
    <Badge
      variant="secondary"
      className={`text-[10px] px-1.5 rounded-full ${
        isUrgent ? 'bg-emerald-100 text-emerald-700' : ''
      }`}
    >
      {label}
    </Badge>
  )
}

function formatPrice(price: number) {
  return `K${price.toLocaleString()}`
}

export { TierBadge, TimeAgo, formatPrice }
export type { Listing }

interface FeaturedCarouselProps {
  listings: Listing[]
  onSelectListing: (listing: Listing) => void
}

export function FeaturedCarousel({
  listings,
  onSelectListing,
}: FeaturedCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)

  if (listings.length === 0) return null

  return (
    <section ref={carouselRef} className="relative px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <Crown className="size-4 text-amber-500" />
        <h2 className="text-sm font-semibold">Featured Listings</h2>
      </div>

      <Carousel
        opts={{ align: 'start', loop: true }}
        className="w-full"
      >
        <CarouselContent className="-ml-3">
          {listings.map((listing) => (
            <CarouselItem key={listing.id} className="pl-3 basis-[75%] sm:basis-[40%] md:basis-[30%] lg:basis-[22%]">
              <div
                className="relative group cursor-pointer rounded-lg overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
                onClick={() => onSelectListing(listing)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={listing.imageUrl}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 75vw, (max-width: 768px) 40vw, (max-width: 1024px) 30vw, 22vw"
                  />
                  <TierBadge tier={listing.tier} />
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                    <span className="text-white font-bold text-sm">
                      {formatPrice(listing.price)}
                      <span className="font-normal text-[10px] text-white/80">
                        /{listing.priceUnit}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="p-2.5">
                  <h3 className="text-xs font-medium line-clamp-1 mb-1">
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    <span className="text-[11px] truncate">{listing.location}</span>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 size-7 bg-white/90 border shadow-sm" />
        <CarouselNext className="right-0 size-7 bg-white/90 border shadow-sm" />
      </Carousel>
    </section>
  )
}
