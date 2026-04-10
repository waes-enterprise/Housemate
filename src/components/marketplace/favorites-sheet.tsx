'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Heart, MapPin, X, Trash2 } from 'lucide-react'
import Image from 'next/image'
import type { Listing } from './listing-card'
import { formatPrice } from './listing-card'

interface FavoritesSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  favorites: Listing[]
  onRemoveFavorite: (listingId: string) => void
  onSelectListing: (listing: Listing) => void
}

export function FavoritesSheet({
  open,
  onOpenChange,
  favorites,
  onRemoveFavorite,
  onSelectListing,
}: FavoritesSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0">
        {/* Header with gradient accent */}
        <SheetHeader className="p-4 pb-3 border-b border-gray-100 bg-gradient-to-r from-white to-[#f0fdf4]">
          <SheetTitle className="flex items-center gap-2 text-gray-900">
            <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center">
              <Heart className="size-4 text-red-500 fill-red-500" />
            </div>
            Saved Listings
          </SheetTitle>
          <SheetDescription className="text-gray-400 mt-1">
            {favorites.length === 0
              ? 'No saved listings yet'
              : `${favorites.length} saved listing${favorites.length > 1 ? 's' : ''}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-80px)]">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              {/* Larger styled illustration */}
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center border-2 border-dashed border-red-200">
                  <Heart className="size-10 text-red-300" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
                  <span className="text-lg">😊</span>
                </div>
              </div>
              <p className="text-base font-semibold mb-1.5 text-gray-800">No favorites yet</p>
              <p className="text-sm text-gray-400 max-w-[200px]">
                Tap the heart icon on listings to save them here for later
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {favorites.map((listing, index) => (
                <div
                  key={listing.id}
                  className="flex gap-3 p-3 hover:bg-[#f0fdf4] cursor-pointer animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => {
                    onOpenChange(false)
                    onSelectListing(listing)
                  }}
                >
                  <div className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                    <Image
                      src={listing.imageUrl}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-semibold text-gray-900 line-clamp-1">
                      {listing.title}
                    </h4>
                    <p className="text-[#006633] text-xs font-bold mt-0.5">
                      {formatPrice(listing.price)}/{listing.priceUnit}
                    </p>
                    <div className="flex items-center gap-1 text-gray-400 mt-0.5">
                      <MapPin className="size-3" />
                      <span className="text-[11px] truncate">{listing.location}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveFavorite(listing.id)
                    }}
                    className="self-start p-2 hover:bg-red-50 rounded-xl hover:scale-110 active:scale-95"
                  >
                    <Trash2 className="size-3.5 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
