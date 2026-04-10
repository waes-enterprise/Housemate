'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Listing } from '@/components/marketplace/listing-card'

// ─── Zambia city coordinates for geocoding locations ───────────────────────────
const ZAMBIA_LOCATIONS: Record<string, [number, number]> = {
  'lusaka': [-15.3875, 28.3228],
  'ndola': [-12.9589, 28.6364],
  'kitwe': [-12.8026, 28.2099],
  'kabwe': [-14.4469, 28.4481],
  'livingstone': [-17.8419, 25.8572],
  'chipata': [-13.6327, 32.6490],
  'chisamba': [-14.4647, 28.0686],
  'chongwe': [-15.2792, 28.6833],
  'kafue': [-15.7703, 28.1772],
}

const ZAMBIA_CENTER: [number, number] = [-13.1339, 27.8493]

// Deterministic pseudo-random based on listing id to keep markers stable across renders
function seededOffset(id: string, index: number): [number, number] {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
  }
  const seed = Math.abs(hash) + index * 7919
  const latOff = ((seed * 9301 + 49297) % 233280) / 233280 * 0.018 - 0.009
  const lngOff = (((seed + 1337) * 9301 + 49297) % 233280) / 233280 * 0.018 - 0.009
  return [latOff, lngOff]
}

function getCoordinates(location: string, id: string, index: number, lat?: number | null, lng?: number | null): [number, number] {
  // Prefer real lat/lng from listing
  if (lat != null && lng != null) {
    return [lat, lng]
  }

  const lower = location.toLowerCase()
  for (const [city, coords] of Object.entries(ZAMBIA_LOCATIONS)) {
    if (lower.includes(city)) {
      const [latOff, lngOff] = seededOffset(id, index)
      return [coords[0] + latOff, coords[1] + lngOff]
    }
  }
  return [
    ZAMBIA_CENTER[0] + (Math.random() - 0.5) * 2,
    ZAMBIA_CENTER[1] + (Math.random() - 0.5) * 2,
  ]
}

function formatPrice(price: number): string {
  return `K${price.toLocaleString()}`
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface MapViewProps {
  listings: Listing[]
  favorites: Set<string>
  userLocation?: { lat: number; lng: number } | null
  searchRadius?: number | null // in meters
}

interface LocationGroup {
  listings: Listing[]
  lat: number
  lng: number
  key: string
}

// ─── SVG Icons as data URIs ────────────────────────────────────────────────────
const HEART_FILLED_SVG = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>'
)}`

const HEART_OUTLINE_SVG = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/></svg>'
)}`

// ─── Marker HTML Generator ─────────────────────────────────────────────────────
function createMarkerHtml(
  listing: Listing,
  isFavorite: boolean,
  isFeatured: boolean,
  isSelected: boolean,
  staggerIndex: number,
  groupId: string,
  isDimmed: boolean = false,
): string {
  const borderStyle = isFeatured
    ? 'border: 2.5px solid #006633; box-shadow: 0 2px 12px rgba(0,102,51,0.35), 0 2px 4px rgba(0,0,0,0.12);'
    : 'border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.08);'

  const heartIcon = isFavorite
    ? `<img src="${HEART_FILLED_SVG}" style="position:absolute;top:3px;right:3px;width:16px;height:16px;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3));" />`
    : ''

  const countBadge = groupId ? `
    <div style="
      position:absolute;top:-6px;right:-6px;
      min-width:18px;height:18px;
      background:#006633;color:white;
      font-size:10px;font-weight:700;
      border-radius:9px;display:flex;align-items:center;justify-content:center;
      padding:0 4px;
      box-shadow:0 1px 4px rgba(0,102,51,0.4);
      border:1.5px solid white;
    ">${groupId}</div>
  ` : ''

  const pulseClass = isSelected ? 'map-marker-pulse' : ''
  const dimStyle = isDimmed ? 'opacity:0.4;filter:grayscale(60%);' : ''

  return `
    <div class="map-marker-wrapper ${pulseClass}" style="animation-delay:${staggerIndex * 50}ms;${dimStyle}" data-group="${groupId || ''}">
      <div style="
        width:48px;height:56px;position:relative;cursor:pointer;
        ${borderStyle}
        border-radius:12px;overflow:hidden;
        background:#f3f4f6;
        transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
      " class="map-marker-inner">
        <img
          src="${listing.imageUrl}"
          style="width:100%;height:100%;object-fit:cover;display:block;"
          loading="lazy"
          onerror="this.style.display='none'"
        />
        <div style="
          position:absolute;bottom:0;left:0;right:0;
          background:linear-gradient(to top,rgba(0,0,0,0.75),rgba(0,0,0,0.15));
          padding:3px 4px 3px 5px;
        ">
          <span style="
            color:white;font-size:9px;font-weight:700;
            font-family:system-ui,-apple-system,sans-serif;
            text-shadow:0 1px 2px rgba(0,0,0,0.3);
            white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
            display:block;
          ">${formatPrice(listing.price)}</span>
        </div>
        ${heartIcon}
        ${countBadge}
      </div>
    </div>
  `
}

// ─── Bottom Sheet Component ────────────────────────────────────────────────────
function BottomSheet({
  group,
  initialIndex,
  favorites,
  onClose,
}: {
  group: LocationGroup
  initialIndex: number
  favorites: Set<string>
  onClose: () => void
}) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isVisible, setIsVisible] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  const listing = group.listings[currentIndex]
  const isFav = favorites.has(listing.id)
  const isFeatured = listing.tier === 'premium' || listing.tier === 'featured' || listing.tier === 'spotlight'
  const hasMultiple = group.listings.length > 1

  useEffect(() => {
    // Trigger entrance animation on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    })
  }, [])

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }, [onClose])

  const goToIndex = (i: number) => {
    if (i >= 0 && i < group.listings.length) setCurrentIndex(i)
  }

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-[1000] pointer-events-none"
      ref={sheetRef}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/20 transition-opacity duration-300 pointer-events-auto ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`pointer-events-auto relative mx-auto transition-all duration-300 ease-out ${
          isVisible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0'
        }`}
        style={{ maxWidth: '520px' }}
      >
        <div className="bg-white rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] overflow-hidden">
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-300/70" />
          </div>

          {/* Hero Image */}
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100">
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 left-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
            >
              <X className="size-4" />
            </button>

            {/* Favorite button on image */}
            <button
              className={`absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center z-10 transition-all duration-200 ${
                isFav
                  ? 'bg-white/90 scale-110'
                  : 'bg-black/40 backdrop-blur-sm hover:bg-black/60'
              }`}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <Heart
                className={`size-4 ${
                  isFav ? 'fill-red-500 text-red-500' : 'text-white'
                }`}
              />
            </button>

            {/* Multiple listings nav */}
            {hasMultiple && (
              <>
                <button
                  onClick={() => goToIndex(currentIndex - 1)}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-opacity ${
                    currentIndex === 0 ? 'opacity-30 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <ChevronLeft className="size-4 text-gray-700" />
                </button>
                <button
                  onClick={() => goToIndex(currentIndex + 1)}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-opacity ${
                    currentIndex === group.listings.length - 1 ? 'opacity-30 pointer-events-none' : 'opacity-100'
                  }`}
                >
                  <ChevronRight className="size-4 text-gray-700" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {group.listings.map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-200 ${
                        i === currentIndex
                          ? 'w-5 h-1.5 bg-white'
                          : 'w-1.5 h-1.5 bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="px-5 pt-4 pb-2">
            {/* Category + location */}
            <div className="flex items-center gap-2 mb-1.5">
              {isFeatured && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#006633] text-white text-[10px] font-bold leading-none">
                  Verified
                </span>
              )}
              <span className="text-[11px] text-gray-500 font-medium">{listing.category}</span>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-gray-900 leading-snug mb-1 line-clamp-2">
              {listing.title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1 text-gray-400 mb-3">
              <MapPin className="size-3.5 shrink-0" />
              <span className="text-[12px]">{listing.location}</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-xl font-extrabold text-emerald-700">
                {formatPrice(listing.price)}
              </span>
              <span className="text-[12px] text-gray-400">/ {listing.priceUnit}</span>
            </div>

            {/* Distance badge */}
            {listing.distance != null && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[11px] font-semibold mt-1">
                <MapPin className="size-3" />
                {listing.distance} km away
              </div>
            )}

            {/* Truncated description */}
            {listing.description && (
              <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mt-2">
                {listing.description}
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="px-5 pb-6 pt-2">
            <button
              onClick={() => router.push(`/listings/${listing.id}`)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#006633] to-[#005a2c] text-white font-bold text-[14px] hover:from-[#005a2c] hover:to-[#004d26] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#006633]/20"
            >
              View Details
            </button>
            {hasMultiple && (
              <p className="text-center text-[11px] text-gray-400 mt-2">
                {currentIndex + 1} of {group.listings.length} properties at this location
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main MapView Component ────────────────────────────────────────────────────
export function MapView({ listings, favorites, userLocation, searchRadius }: MapViewProps) {
  const router = useRouter()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const circleRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)

  // Bottom sheet state
  const [selectedGroup, setSelectedGroup] = useState<LocationGroup | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleCloseSheet = useCallback(() => {
    setSelectedGroup(null)
    setSelectedIndex(0)
    // Remove pulse class from all markers
    document.querySelectorAll('.map-marker-pulse').forEach(el => {
      el.classList.remove('map-marker-pulse')
    })
  }, [])

  // Build location groups with offsets
  const buildGroups = useCallback((): LocationGroup[] => {
    const groupMap = new Map<string, Listing[]>()
    listings.forEach((listing, index) => {
      const coords = getCoordinates(listing.location, listing.id, index, listing.latitude, listing.longitude)
      const key = `${coords[0].toFixed(4)},${coords[1].toFixed(4)}`
      if (!groupMap.has(key)) groupMap.set(key, [])
      groupMap.get(key)!.push(listing)
    })

    const groups: LocationGroup[] = []
    groupMap.forEach((groupListings, key) => {
      const [lat, lng] = key.split(',').map(Number)
      groups.push({ listings: groupListings, lat, lng, key })
    })
    return groups
  }, [listings])

  // Main map effect
  useEffect(() => {
    if (!mapRef.current) return

    // Clean up previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      markersRef.current = []
      circleRef.current = null
      userMarkerRef.current = null
    }

    const groups = buildGroups()

    import('leaflet').then(L => {
      // Fix default icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Determine center: user location or default Lusaka
      const mapCenter: L.LatLngTuple = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [-15.3875, 28.3228]

      const map = L.map(mapRef.current!, {
        center: mapCenter,
        zoom: userLocation ? 12 : 7,
        zoomControl: false,
      })

      // CartoDB Positron tiles — clean, modern look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      // Custom zoom controls on the right
      const ZoomControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function () {
          const container = L.DomUtil.create('div', 'leaflet-custom-zoom')
          container.innerHTML = `
            <button class="zoom-btn zoom-in" title="Zoom in" aria-label="Zoom in">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <div style="height:1px;background:#e5e7eb;margin:0;"></div>
            <button class="zoom-btn zoom-out" title="Zoom out" aria-label="Zoom out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          `
          container.querySelector('.zoom-in')!.addEventListener('click', () => map.zoomIn())
          container.querySelector('.zoom-out')!.addEventListener('click', () => map.zoomOut())
          return container
        },
      })
      new ZoomControl().addTo(map)

      // Add user location circle and marker
      if (userLocation && searchRadius) {
        // Blue circle overlay for search radius
        const circle = L.circle([userLocation.lat, userLocation.lng], {
          radius: searchRadius,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.08,
          weight: 2,
          dashArray: '8,6',
          className: 'proximity-circle',
        }).addTo(map)
        circleRef.current = circle

        // Blue pulsing dot for user location
        const userIcon = L.divIcon({
          html: `
            <div style="position:relative;width:20px;height:20px;">
              <div style="
                position:absolute;inset:0;
                background:rgba(59,130,246,0.2);
                border-radius:50%;
                animation:userLocationPulse 2s ease-in-out infinite;
              "></div>
              <div style="
                position:absolute;top:50%;left:50%;
                transform:translate(-50%,-50%);
                width:14px;height:14px;
                background:#3b82f6;
                border:3px solid white;
                border-radius:50%;
                box-shadow:0 2px 8px rgba(59,130,246,0.5);
              "></div>
            </div>
          `,
          className: 'user-location-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })
        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, interactive: false }).addTo(map)
        userMarkerRef.current = userMarker
      }

      // Add markers
      groups.forEach((group, groupIdx) => {
        const mainListing = group.listings[0]
        const isFavorite = favorites.has(mainListing.id)
        const isFeatured = mainListing.tier !== 'standard'
        const groupId = group.listings.length > 1 ? String(group.listings.length) : ''

        // In proximity mode, dim markers that have no distance (not in range)
        const isDimmed = userLocation && searchRadius && mainListing.distance == null

        const markerHtml = createMarkerHtml(
          mainListing,
          isFavorite,
          isFeatured,
          false,
          groupIdx,
          groupId,
          isDimmed,
        )

        const icon = L.divIcon({
          html: markerHtml,
          className: 'map-marker-container',
          iconSize: [48, 60],
          iconAnchor: [24, 56],
        })

        const marker = L.marker([group.lat, group.lng], { icon }).addTo(map)

        if (!isDimmed) {
          marker.on('click', () => {
            // Add pulse to this marker
            const el = marker.getElement()
            if (el) {
              // Remove pulse from all markers first
              document.querySelectorAll('.map-marker-pulse').forEach(e => e.classList.remove('map-marker-pulse'))
              const wrapper = el.querySelector('.map-marker-wrapper')
              if (wrapper) wrapper.classList.add('map-marker-pulse')
            }
            setSelectedGroup(group)
            setSelectedIndex(0)
          })
        }

        markersRef.current.push(marker)
      })

      // Fit bounds
      if (userLocation && searchRadius) {
        // Center on user location with appropriate zoom for radius
        map.fitBounds(circleRef.current!.getBounds(), { padding: [60, 60] })
      } else if (groups.length > 0) {
        const bounds = L.latLngBounds(
          groups.map(g => [g.lat, g.lng] as L.LatLngTuple)
        )
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 })
      }

      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = []
        circleRef.current = null
        userMarkerRef.current = null
      }
    }
  }, [listings, router, buildGroups, favorites, userLocation, searchRadius])

  // Update marker visuals when favorites change (without rebuilding map)
  useEffect(() => {
    if (!mapInstanceRef.current) return

    const groups = buildGroups()
    markersRef.current.forEach((marker, idx) => {
      if (idx >= groups.length) return
      const group = groups[idx]
      const mainListing = group.listings[0]
      const isFavorite = favorites.has(mainListing.id)
      const isFeatured = mainListing.tier !== 'standard'
      const groupId = group.listings.length > 1 ? String(group.listings.length) : ''
      const isDimmed = userLocation && searchRadius && mainListing.distance == null

      const markerHtml = createMarkerHtml(
        mainListing,
        isFavorite,
        isFeatured,
        false,
        idx,
        groupId,
        isDimmed,
      )

      const L = (window as any).L
      if (L) {
        const icon = L.divIcon({
          html: markerHtml,
          className: 'map-marker-container',
          iconSize: [48, 60],
          iconAnchor: [24, 56],
        })
        marker.setIcon(icon)
      }
    })
  }, [favorites, buildGroups, userLocation, searchRadius])

  return (
    <div className="relative w-full h-full">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      {/* ─── Global Styles for Map ──────────────────────────────────── */}
      <style>{`
        /* Hide default Leaflet controls */
        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(255,255,255,0.7) !important;
          backdrop-filter: blur(4px);
          border-radius: 6px 0 0 0 !important;
          padding: 2px 6px !important;
        }
        .leaflet-control-attribution a {
          color: #006633 !important;
        }

        /* Marker container reset */
        .map-marker-container {
          background: transparent !important;
          border: none !important;
        }

        /* User location marker reset */
        .user-location-marker {
          background: transparent !important;
          border: none !important;
        }

        /* Marker entrance animation */
        .map-marker-wrapper {
          opacity: 0;
          animation: markerFadeIn 0.4s ease-out forwards;
        }
        @keyframes markerFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.85);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* User location pulse */
        @keyframes userLocationPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(2.5);
            opacity: 0;
          }
        }

        /* Hover scale */
        .map-marker-inner:hover {
          transform: scale(1.15) !important;
          z-index: 999 !important;
        }

        /* Selected marker pulse */
        .map-marker-pulse .map-marker-inner {
          animation: markerPulse 1.5s ease-in-out infinite;
        }
        .map-marker-pulse .map-marker-inner:hover {
          animation: markerPulse 1.5s ease-in-out infinite;
          transform: scale(1.15);
        }
        @keyframes markerPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0,102,51,0.4), 0 2px 8px rgba(0,0,0,0.15);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(0,102,51,0), 0 2px 8px rgba(0,0,0,0.15);
          }
        }

        /* Custom zoom controls */
        .leaflet-custom-zoom {
          display: flex;
          flex-direction: column;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.08);
          margin-top: 16px;
          margin-right: 10px;
        }
        .zoom-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: none;
          cursor: pointer;
          color: #374151;
          transition: background 0.15s, color 0.15s;
        }
        .zoom-btn:hover {
          background: #f9fafb;
          color: #006633;
        }
        .zoom-btn:active {
          background: #f3f4f6;
        }

        /* Leaflet container rounded corners */
        .leaflet-container {
          border-radius: 16px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        /* Proximity circle animation */
        .proximity-circle {
          animation: circleFadeIn 0.6s ease-out forwards;
        }
        @keyframes circleFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* ─── Map Container ──────────────────────────────────────────── */}
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: '400px', borderRadius: '16px', overflow: 'hidden' }}
      />

      {/* ─── Floating Listings Count Badge ─────────────────────────── */}
      {listings.length > 0 && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[999] pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-gray-100/60">
            <div className="w-2 h-2 rounded-full bg-[#006633] animate-pulse" />
            <span className="text-[12px] font-semibold text-gray-700 whitespace-nowrap">
              {listings.length} {listings.length === 1 ? 'property' : 'properties'} on map
            </span>
            {userLocation && searchRadius && (
              <span className="text-[11px] text-blue-500 font-medium ml-1">
                within {(searchRadius / 1000).toFixed(0)} km
              </span>
            )}
          </div>
        </div>
      )}

      {/* ─── Bottom Sheet ───────────────────────────────────────────── */}
      {selectedGroup && (
        <BottomSheet
          group={selectedGroup}
          initialIndex={selectedIndex}
          favorites={favorites}
          onClose={handleCloseSheet}
        />
      )}
    </div>
  )
}
