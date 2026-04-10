'use client'

import { ListingCard, ListingCardSkeleton } from './listing-card'
import type { Listing } from './listing-card'
import { Search } from 'lucide-react'

interface ListingGridProps {
  listings: Listing[]
  favorites: Set<string>
  onToggleFavorite: (listing: Listing) => void
  onSelectListing: (listing: Listing) => void
  isLoading?: boolean
  compareIds?: Set<string>
  onToggleCompare?: (listing: Listing) => void
}

export function ListingGrid({
  listings,
  favorites,
  onToggleFavorite,
  onSelectListing,
  isLoading,
  compareIds,
  onToggleCompare,
}: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="animate-section-fade">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <ListingCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="animate-section-fade flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="relative mb-5 animate-float">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
            <Search className="size-10 text-gray-300" />
          </div>
        </div>
        <h3 className="font-bold text-base mb-1.5 text-gray-800">No listings found</h3>
        <p className="text-gray-400 text-sm max-w-[260px] leading-relaxed">
          Try adjusting your search or filters to find what you&apos;re looking for.
        </p>
      </div>
    )
  }

  return (
    <div className="animate-section-fade">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4">
        {listings.map((listing, index) => (
          <div
            key={listing.id}
            className="animate-fade-in hover-lift"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <ListingCard
              listing={listing}
              isFavorited={favorites.has(listing.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectListing={onSelectListing}
              isCompareSelected={compareIds ? compareIds.has(listing.id) : false}
              onToggleCompare={onToggleCompare}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
