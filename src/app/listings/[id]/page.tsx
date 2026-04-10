'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Home,
  MapPin,
  Star,
  ShieldCheck,
  Share2,
  Heart,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Tag,
  Crown,
  HeartIcon,
  Loader2,
  AlertCircle,
  Send,
  X,
  Car,
  Shield,
  Wifi,
  Droplets,
  Sun,
  Zap,
  Wind,
  Waves,
  TreePine,
  Tv,
  Gauge,
  Droplet,
  Users,
  Lock,
  Grid3X3,
  DoorOpen,
  Building,
  Flame,
  Eye,
} from 'lucide-react'
import type { Listing } from '@/components/marketplace/listing-card'
import { formatPrice } from '@/components/marketplace/listing-card'

// ─── Types ────────────────────────────────────────────────────────────

interface ListingDetailData extends Listing {
  ownerId?: string | null
  owner?: { id: string; name: string; email: string; phone: string | null; avatarUrl: string | null; isVerifiedAgent: boolean; agentCompany: string | null; agentBio: string | null; agentSpecialties: string | null } | null
  _count?: { favorites: number }
  status?: string
  updatedAt?: string
  imageUrls?: string
  amenities?: string
  amenitiesList?: string[]
}

interface ReviewData {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    name: string
    avatarUrl: string | null
  }
}

interface ReviewStats {
  averageRating: number
  totalReviews: number
  distribution: Record<number, number>
}

// ─── Helpers ──────────────────────────────────────────────────────────

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = localStorage.getItem('hmz-session')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('hmz-session', sessionId)
  }
  return sessionId
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateShort(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 1) return 'Today'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return formatDate(dateStr)
}

// ─── Amenity Icon Mapping ──────────────────────────────────────

const AMENITY_ICON_MAP: Record<string, React.ReactNode> = {
  'Parking': <Car className="size-3.5" />,
  'Security Guard': <Shield className="size-3.5" />,
  'CCTV': <Flame className="size-3.5" />,
  'Electric Fence': <Zap className="size-3.5" />,
  'Borehole/Well': <Droplets className="size-3.5" />,
  'Solar Power': <Sun className="size-3.5" />,
  'Generator': <Zap className="size-3.5" />,
  'WiFi': <Wifi className="size-3.5" />,
  'Air Conditioning': <Wind className="size-3.5" />,
  'Swimming Pool': <Waves className="size-3.5" />,
  'Garden': <TreePine className="size-3.5" />,
  'DSTV': <Tv className="size-3.5" />,
  'Prepaid Electricity': <Gauge className="size-3.5" />,
  'Water Tank': <Droplet className="size-3.5" />,
  'Servants Quarters': <Users className="size-3.5" />,
  'Wall Fence': <Lock className="size-3.5" />,
  'Gate': <DoorOpen className="size-3.5" />,
  'Tiled Floor': <Grid3X3 className="size-3.5" />,
  'Built-in Cupboards': <Building className="size-3.5" />,
  'Balcony': <Building className="size-3.5" />,
  'Elevator': <Building className="size-3.5" />,
  'Gym': <Users className="size-3.5" />,
  'Backup Water': <Droplet className="size-3.5" />,
  'Fire Suppression': <Flame className="size-3.5" />,
}

function getAmenityIcon(name: string): React.ReactNode {
  return AMENITY_ICON_MAP[name] || <Tag className="size-3.5" />
}

function parseAmenities(amenitiesStr: string | null | undefined): string[] {
  if (!amenitiesStr || amenitiesStr === '[]') return []
  try {
    const parsed = JSON.parse(amenitiesStr)
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return []
  }
}

// ─── Premium Divider Component ────────────────────────────────────────

function PremiumDivider() {
  return <div className="divider-premium my-5" />
}

// ─── Star Rating Selector Component ───────────────────────────────────

function StarRatingSelector({
  value,
  onChange,
}: {
  value: number
  onChange: (val: number) => void
}) {
  const [hoverValue, setHoverValue] = useState(0)
  const displayValue = hoverValue || value

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          className="p-0.5 transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            className={`size-6 transition-colors ${
              star <= displayValue
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
      <span className="text-sm font-medium text-gray-500 ml-1">
        {value > 0 ? `${value}/5` : 'Select rating'}
      </span>
    </div>
  )
}

// ─── Page Component ───────────────────────────────────────────────────

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [listing, setListing] = useState<ListingDetailData | null>(null)
  const [similarListings, setSimilarListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const touchStartX = useRef(0)

  // Analytics state
  const [analytics, setAnalytics] = useState<{
    viewCount: number
    inquiryCount: number
    favoriteCount: number
    reviewCount: number
    averageRating: number
    viewsPerDay: number
    daysListed: number
  } | null>(null)

  // Reviews state
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  // Parse all images
  const allImages = (() => {
    const images = [listing?.imageUrl || '']
    if (listing?.imageUrls) {
      try {
        const extra: string[] = JSON.parse(listing.imageUrls)
        if (Array.isArray(extra)) {
          extra.forEach(url => { if (url && !images.includes(url)) images.push(url) })
        }
      } catch { /* ignore */ }
    }
    return images.filter(Boolean)
  })()

  // Fetch listing data
  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${id}`)
        if (!res.ok) {
          setError('Listing not found')
          setLoading(false)
          return
        }
        const data: ListingDetailData = await res.json()
        setListing(data)

        // Fetch similar listings
        if (data.category) {
          const simRes = await fetch(`/api/listings?category=${encodeURIComponent(data.category)}`)
          if (simRes.ok) {
            const simData: Listing[] = await simRes.json()
            setSimilarListings(simData.filter((l) => l.id !== id).slice(0, 8))
          }
        }
      } catch {
        setError('Failed to load listing')
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [id])

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    if (!id) return
    setReviewsLoading(true)
    try {
      const res = await fetch(`/api/listings/${id}/reviews`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews)
        setReviewStats(data.stats)
      }
    } catch {
      // ignore
    } finally {
      setReviewsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Track view once per session
  useEffect(() => {
    if (!id) return
    const viewedKey = `hmz-viewed-${id}`
    if (typeof window !== 'undefined' && !sessionStorage.getItem(viewedKey)) {
      sessionStorage.setItem(viewedKey, '1')
      fetch(`/api/listings/${id}/view`, { method: 'POST' }).catch(() => {})
    }
  }, [id])

  // Fetch analytics
  useEffect(() => {
    if (!id) return
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/listings/${id}/analytics`)
        if (res.ok) {
          const data = await res.json()
          setAnalytics(data)
        }
      } catch {
        // ignore
      }
    }
    fetchAnalytics()
  }, [id])

  // Check favorite status on mount
  useEffect(() => {
    if (!id) return
    async function checkFavorite() {
      try {
        const sessionId = getSessionId()
        const res = await fetch(`/api/favorites?sessionId=${sessionId}`)
        if (res.ok) {
          const data: Listing[] = await res.json()
          setIsFavorited(data.some((f) => f.id === id))
        }
      } catch {
        // ignore
      }
    }
    checkFavorite()
  }, [id])

  // Toggle favorite
  const toggleFavorite = useCallback(async () => {
    if (!id || favLoading) return
    setFavLoading(true)
    try {
      const sessionId = getSessionId()
      if (isFavorited) {
        await fetch(`/api/favorites?listingId=${id}&sessionId=${sessionId}`, { method: 'DELETE' })
        setIsFavorited(false)
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: id, sessionId }),
        })
        setIsFavorited(true)
      }
    } catch {
      // ignore
    } finally {
      setFavLoading(false)
    }
  }, [id, isFavorited, favLoading])

  // Share
  const handleShare = useCallback(async () => {
    if (!listing) return
    const shareUrl = window.location.href
    const shareText = `${listing.title} - K${listing.price.toLocaleString()}/${listing.priceUnit} on Housemate ZM`
    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.title,
          text: shareText,
          url: shareUrl,
        })
      } else {
        // Desktop fallback: open social share sheet
        setShowShareSheet(true)
        return
      }
    } catch (err) {
      // User cancelled — do nothing on AbortError
      if (err instanceof Error && err.name !== 'AbortError') {
        setShowShareSheet(true)
      }
    }
  }, [listing])

  // Social share helpers
  const handleSocialShare = useCallback((platform: string) => {
    if (!listing) return
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`${listing.title} - K${listing.price.toLocaleString()}/${listing.priceUnit} on Housemate ZM`)
    const via = encodeURIComponent('HousemateZM')
    let shareUrl = ''
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&via=${via}&url=${url}`
        break
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`
        break
    }
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500')
    }
    setShowShareSheet(false)
  }, [listing])

  const handleCopyLink = useCallback(() => {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    }).catch(() => {
      // Fallback for non-secure contexts
      const textArea = document.createElement('textarea')
      textArea.value = url
      textArea.style.position = 'fixed'
      textArea.style.left = '-9999px'
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      } catch { /* ignore */ }
      document.body.removeChild(textArea)
    })
  }, [])

  // Submit review
  const handleSubmitReview = useCallback(async () => {
    if (!id || newRating === 0 || newComment.trim().length < 5) {
      setReviewError('Please provide a rating and at least 5 characters for your comment.')
      return
    }

    setSubmittingReview(true)
    setReviewError(null)

    try {
      const res = await fetch(`/api/listings/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating, comment: newComment.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setReviewError(data.error || 'Failed to submit review')
        return
      }

      // Reset form and refresh reviews
      setNewRating(0)
      setNewComment('')
      setShowReviewForm(false)
      await fetchReviews()
    } catch {
      setReviewError('Network error. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }, [id, newRating, newComment, fetchReviews])

  // Share sheet state
  const [showShareSheet, setShowShareSheet] = useState(false)
  // Auth state for messaging
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        setIsAuthenticated(!!data.user)
      } catch {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  // Message handler
  const handleMessage = useCallback(() => {
    if (!listing) return
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/listings/' + id)
      return
    }
    const ownerId = listing.ownerId
    if (!ownerId) {
      // No owner — use WhatsApp or contact info instead
      const phone = listing.contactPhone || listing.owner?.phone
      if (phone) {
        window.open(`https://wa.me/${phone.replace(/[^0-9+]/g, '')}`, '_blank')
      } else if (listing.contactEmail) {
        window.location.href = `mailto:${listing.contactEmail}`
      }
      return
    }
    const params = new URLSearchParams({
      conversation: 'new',
      participantId: ownerId,
      listingId: listing.id,
    })
    router.push(`/inbox?${params.toString()}`)
  }, [listing, isAuthenticated, router, id])

  // WhatsApp link
  const whatsappLink = listing?.contactPhone
    ? `https://wa.me/${listing.contactPhone.replace(/[^0-9+]/g, '')}`
    : null

  // ─── Render ────────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />
  if (error || !listing) return <ErrorState message={error || 'Listing not found'} onBack={() => router.back()} />

  const favoriteCount = listing._count?.favorites ?? 0
  const contactPhone = listing.contactPhone || listing.owner?.phone
  const hasReviews = reviewStats !== null && reviewStats.totalReviews > 0
  const listingAmenities = parseAmenities(listing.amenities)

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* ─── Hero Image Gallery ───────────────────────────────── */}
      <div className="relative">
        <div
          className="relative z-0 aspect-[4/3] md:aspect-[16/9] w-full overflow-hidden bg-gray-200"
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
          onTouchEnd={(e) => {
            const diff = touchStartX.current - e.changedTouches[0].clientX
            if (Math.abs(diff) > 50) {
              if (diff > 0 && currentImageIndex < allImages.length - 1) {
                setCurrentImageIndex(prev => prev + 1)
              } else if (diff < 0 && currentImageIndex > 0) {
                setCurrentImageIndex(prev => prev - 1)
              }
            }
          }}
        >
          {allImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-300 ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <Image
                src={img}
                alt={`${listing.title} - Photo ${idx + 1}`}
                fill
                className="object-cover scale-[1.02]"
                sizes="100vw"
                priority={idx === 0}
              />
            </div>
          ))}
          {/* Dramatic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/30" />

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-3 md:p-4">
            <div className="flex items-center gap-2">
              {/* Home button */}
              <Link
                href="/"
                className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white hover:shadow-lg transition-all group"
                aria-label="Go home"
              >
                <Home className="size-4.5 text-gray-700 group-hover:text-[#006633] transition-colors" />
              </Link>
              {/* Back button */}
              <button
                onClick={() => router.back()}
                className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white hover:shadow-lg transition-all"
              >
                <ArrowLeft className="size-4 text-gray-700" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white hover:shadow-lg transition-all"
              >
                <Share2 className="size-4 text-gray-700" />
              </button>
              <button
                onClick={toggleFavorite}
                disabled={favLoading}
                className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white hover:shadow-lg transition-all"
              >
                {favLoading ? (
                  <Loader2 className="size-4 text-gray-500 animate-spin" />
                ) : (
                  <Heart className={`size-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                )}
              </button>
            </div>
          </div>

          {/* Price overlay — premium with glow */}
          <div className="absolute bottom-4 left-4 md:bottom-5 md:left-5 z-10">
            <div className="card-elevated bg-[#006633] text-white px-5 py-3 md:px-6 md:py-3.5 rounded-2xl shadow-[0_0_20px_rgba(0,102,51,0.35),0_0_40px_rgba(0,102,51,0.15)]">
              <span className="text-xl md:text-2xl font-bold tracking-tight">{formatPrice(listing.price)}</span>
              <span className="text-sm md:text-base text-white/70 ml-1">/ {listing.priceUnit}</span>
            </div>
          </div>

          {/* Share copied toast */}
          {shareCopied && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-gray-900/90 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full shadow-lg font-medium">
              ✓ Link copied!
            </div>
          )}

          {/* Gallery navigation arrows */}
          {allImages.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev - 1) }}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white transition-all"
                >
                  <svg className="size-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {currentImageIndex < allImages.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev + 1) }}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white transition-all"
                >
                  <svg className="size-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              {/* Dot indicators */}
              <div className="absolute bottom-4 right-4 md:bottom-5 md:right-5 z-10 flex items-center gap-1.5">
                <span className="bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
                  {currentImageIndex + 1}/{allImages.length}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Content Area ──────────────────────────────────────── */}
      <div className="relative -mt-6 rounded-t-2xl bg-white z-10 min-h-[calc(100vh-60px)]">
        <div className="max-w-4xl mx-auto px-5 md:px-8 pt-6 pb-32">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] md:text-2xl font-bold text-gray-900 leading-snug tracking-tight">{listing.title}</h1>
              <div className="flex items-center gap-1.5 text-gray-500 mt-1.5">
                <MapPin className="size-4 shrink-0" />
                <span className="text-sm">{listing.location}</span>
              </div>
            </div>
            {hasReviews ? (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl shrink-0 mt-0.5">
                <Star className="size-4 fill-amber-400 text-amber-400 star-glow" />
                <span className="text-sm font-bold text-gray-800">{reviewStats!.averageRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({reviewStats!.totalReviews})</span>
              </div>
            ) : null}
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Badge className="bg-[#006633]/10 text-[#006633] border-0 rounded-lg text-xs font-medium">
              {listing.category}
            </Badge>
            {listing.tier !== 'standard' && (
              <Badge className="bg-[#006633]/10 text-[#006633] border-0 rounded-lg text-xs font-medium gap-1">
                <ShieldCheck className="size-3" />
                {listing.tier.charAt(0).toUpperCase() + listing.tier.slice(1)}
              </Badge>
            )}
            {listing.isFeatured && (
              <Badge className="bg-amber-100 text-amber-700 border-0 rounded-lg text-xs font-medium gap-1">
                <Crown className="size-3" />
                Featured
              </Badge>
            )}
          </div>

          <PremiumDivider />

          {/* ─── Description ───────────────────────────────────── */}
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 mb-2.5">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Features & Amenities */}
          {listingAmenities.length > 0 && (
            <>
              <PremiumDivider />
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 mb-3">Features &amp; Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {listingAmenities.map(amenity => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-[#006633] text-xs font-medium border border-[#006633]/10"
                    >
                      {getAmenityIcon(amenity)}
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── Analytics Section (public: views only) ────── */}
          {analytics && (
            <>
              <PremiumDivider />
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 mb-3">Listing Stats</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="card-elevated rounded-2xl p-4 bg-white border border-gray-100/60"
                    style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="size-4 text-[#006633]" />
                      <span className="text-xs font-medium text-gray-400">Views</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{analytics.viewCount.toLocaleString()}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{analytics.viewsPerDay.toFixed(1)} per day</p>
                  </div>
                  <div
                    className="card-elevated rounded-2xl p-4 bg-white border border-gray-100/60"
                    style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="size-4 text-amber-500" />
                      <span className="text-xs font-medium text-gray-400">Reviews</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{analytics.reviewCount}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {analytics.averageRating > 0 ? `${analytics.averageRating.toFixed(1)} avg` : 'No ratings'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <PremiumDivider />

          {/* ─── Reviews Section ───────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-bold text-gray-900">Reviews</h2>
              {!showReviewForm && (
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="gap-1.5 bg-[#006633] hover:bg-[#004d26] rounded-xl text-xs font-semibold h-8 px-3"
                >
                  <Send className="size-3" />
                  Write a Review
                </Button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div
                className="card-elevated rounded-2xl p-5 mb-5 border border-[#006633]/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,102,51,0.03) 0%, rgba(0,102,51,0.005) 100%)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Write a Review</h3>
                  <button
                    onClick={() => { setShowReviewForm(false); setReviewError(null) }}
                    className="h-7 w-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <X className="size-3.5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Star rating selector */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Rating</label>
                    <StarRatingSelector value={newRating} onChange={setNewRating} />
                  </div>

                  {/* Comment textarea */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Comment</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your experience with this listing..."
                      rows={3}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#006633]/20 focus:border-[#006633]/30 resize-none transition-all"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">{newComment.trim().length}/5 min characters</p>
                  </div>

                  {/* Error message */}
                  {reviewError && (
                    <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">
                      <AlertCircle className="size-3.5 shrink-0" />
                      {reviewError}
                    </div>
                  )}

                  {/* Submit button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || newRating === 0 || newComment.trim().length < 5}
                      className="gap-2 bg-[#006633] hover:bg-[#004d26] rounded-xl text-sm font-semibold h-10 px-5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews loading */}
            {reviewsLoading && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-2 w-32" />
                  </div>
                  <div className="w-32 space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-2 w-3" />
                        <Skeleton className="h-2 flex-1 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {/* Reviews content */}
            {!reviewsLoading && (
              <>
                {hasReviews ? (
                  <>
                    {/* Rating summary + distribution */}
                    <div className="flex flex-col sm:flex-row gap-6 mb-6">
                      {/* Average rating display */}
                      <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100/60 min-w-[120px]">
                        <span className="text-3xl font-bold text-gray-900">{reviewStats!.averageRating.toFixed(1)}</span>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`size-4 ${
                                star <= Math.round(reviewStats!.averageRating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 mt-1.5">{reviewStats!.totalReviews} review{reviewStats!.totalReviews !== 1 ? 's' : ''}</span>
                      </div>

                      {/* Star distribution bars */}
                      <div className="flex-1 flex flex-col justify-center gap-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = reviewStats!.distribution[star] || 0
                          const pct = reviewStats!.totalReviews > 0 ? (count / reviewStats!.totalReviews) * 100 : 0
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-500 w-3 text-right">{star}</span>
                              <Star className="size-3 fill-amber-400 text-amber-400" />
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-gray-400 w-7 text-right">{pct.toFixed(0)}%</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Reviews list */}
                    <div className="space-y-3">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="card-elevated rounded-2xl p-4 bg-white border border-gray-100/60"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {/* User avatar */}
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#006633] to-[#004d26] flex items-center justify-center shrink-0">
                                {review.user.avatarUrl ? (
                                  <Image
                                    src={review.user.avatarUrl}
                                    alt={review.user.name}
                                    width={32}
                                    height={32}
                                    className="rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-white text-xs font-bold">
                                    {review.user.name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <span className="text-sm font-semibold text-gray-800">{review.user.name}</span>
                                <p className="text-[11px] text-gray-400">{formatDateShort(review.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`size-3 ${
                                    star <= review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'fill-gray-200 text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* No reviews yet */
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                      <Star className="size-7 text-gray-200" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">No reviews yet</p>
                    <p className="text-xs text-gray-400 mt-1">Be the first to share your experience!</p>
                  </div>
                )}
              </>
            )}
          </div>

          <PremiumDivider />

          {/* ─── Details Grid ──────────────────────────────────── */}
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 mb-4">Details</h2>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <DetailItem icon={<Tag className="size-4 text-[#006633]" />} label="Price" value={`${formatPrice(listing.price)} / ${listing.priceUnit}`} />
              <DetailItem icon={<Tag className="size-4 text-[#006633]" />} label="Category" value={listing.category} />
              <DetailItem icon={<MapPin className="size-4 text-[#006633]" />} label="Location" value={listing.location} />
              <DetailItem icon={<Crown className="size-4 text-[#006633]" />} label="Tier" value={listing.tier.charAt(0).toUpperCase() + listing.tier.slice(1)} />
              <DetailItem icon={<Calendar className="size-4 text-[#006633]" />} label="Listed" value={formatDate(listing.createdAt)} />
              <DetailItem icon={<HeartIcon className="size-4 text-[#006633]" />} label="Favorites" value={`${favoriteCount} saves`} />
            </div>
          </div>

          {/* ─── Listing Owner Section ─────────────────────────── */}
          {listing.owner && (
            <>
              <PremiumDivider />
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 mb-4">Listed By</h2>
                <div
                  className="card-elevated rounded-2xl p-4 border overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,102,51,0.03) 0%, rgba(0,102,51,0.005) 100%)',
                    borderColor: listing.owner.isVerifiedAgent ? 'rgba(0,102,51,0.15)' : 'rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#006633] to-[#004d26] flex items-center justify-center shrink-0 shadow-md shadow-[#006633]/20">
                      {listing.owner.avatarUrl ? (
                        <Image
                          src={listing.owner.avatarUrl}
                          alt={listing.owner.name}
                          width={48}
                          height={48}
                          className="rounded-xl object-cover"
                        />
                      ) : (
                        <span className="text-white text-lg font-bold">
                          {listing.owner.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 truncate">{listing.owner.name}</span>
                        {listing.owner.isVerifiedAgent && (
                          <span className="inline-flex items-center gap-1 bg-[#006633] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            <ShieldCheck className="size-3" />
                            Verified Agent
                          </span>
                        )}
                      </div>
                      {listing.owner.isVerifiedAgent && listing.owner.agentCompany && (
                        <p className="text-xs text-[#006633] font-medium mt-0.5">{listing.owner.agentCompany}</p>
                      )}
                      {listing.owner.agentBio && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{listing.owner.agentBio}</p>
                      )}
                      {listing.owner.isVerifiedAgent && listing.owner.agentSpecialties && listing.owner.agentSpecialties !== '[]' && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(() => {
                            try {
                              return JSON.parse(listing.owner.agentSpecialties).map((s: string) => (
                                <span
                                  key={s}
                                  className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 text-[#006633] text-[10px] font-medium border border-[#006633]/10"
                                >
                                  {s}
                                </span>
                              ))
                            } catch { return null }
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ─── Contact Section ───────────────────────────────── */}
          {(contactPhone || listing.contactEmail) && (
            <>
              <PremiumDivider />
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 mb-4">Contact</h2>
                <div className="space-y-3">
                  {contactPhone && (
                    <a
                      href={`tel:${contactPhone}`}
                      className="hover-lift flex items-center gap-4 p-4 rounded-2xl transition-all text-left"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,102,51,0.04) 0%, rgba(0,102,51,0.01) 100%)',
                        border: '1px solid rgba(0,102,51,0.08)',
                      }}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#006633] to-[#004d26] flex items-center justify-center shrink-0 shadow-md shadow-[#006633]/20">
                        <Phone className="size-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Call</p>
                        <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{contactPhone}</p>
                      </div>
                    </a>
                  )}
                  {listing.contactEmail && (
                    <a
                      href={`mailto:${listing.contactEmail}`}
                      className="hover-lift flex items-center gap-4 p-4 rounded-2xl transition-all text-left"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,102,51,0.04) 0%, rgba(0,102,51,0.01) 100%)',
                        border: '1px solid rgba(0,102,51,0.08)',
                      }}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#006633] to-[#004d26] flex items-center justify-center shrink-0 shadow-md shadow-[#006633]/20">
                        <Mail className="size-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email</p>
                        <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{listing.contactEmail}</p>
                      </div>
                    </a>
                  )}
                  {whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover-lift flex items-center gap-4 p-4 rounded-2xl transition-all text-left"
                      style={{
                        background: 'linear-gradient(135deg, rgba(22,163,74,0.04) 0%, rgba(22,163,74,0.01) 100%)',
                        border: '1px solid rgba(22,163,74,0.08)',
                      }}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shrink-0 shadow-md shadow-green-600/20">
                        <MessageCircle className="size-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">WhatsApp</p>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">Send a message</p>
                      </div>
                    </a>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ─── Similar Listings ──────────────────────────────── */}
          {similarListings.length > 0 && (
            <>
              <PremiumDivider />
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 mb-4">Similar Listings</h2>
                <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-none">
                  {similarListings.map((sl) => (
                    <button
                      key={sl.id}
                      onClick={() => router.push(`/listings/${sl.id}`)}
                      className="group shrink-0 w-44 card-elevated bg-white rounded-2xl overflow-hidden text-left border border-gray-100/80 hover:border-[#006633]/10"
                    >
                      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                        <Image
                          src={sl.imageUrl}
                          alt={sl.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="176px"
                        />
                        {sl.tier !== 'standard' && (
                          <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 bg-[#006633] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="p-3 space-y-1">
                        <h3 className="text-xs font-semibold text-gray-900 line-clamp-1">{sl.title}</h3>
                        <p className="text-xs font-bold text-gray-900">
                          {formatPrice(sl.price)} <span className="font-normal text-gray-400">/ {sl.priceUnit}</span>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── Fixed Bottom Bar ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 glass-white border-t border-gray-200/60 px-5 py-3 safe-area-bottom">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 rounded-xl h-12 border-gray-200/80 font-semibold text-sm px-3"
            onClick={toggleFavorite}
            disabled={favLoading}
          >
            {favLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Heart className={`size-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            )}
            {isFavorited ? 'Saved' : 'Save'}
          </Button>

          <Button
            variant="outline"
            className="flex-1 gap-2 rounded-xl h-12 border-gray-200/80 font-semibold text-sm"
            onClick={handleMessage}
          >
            <MessageCircle className="size-4" />
            Message
          </Button>

          {contactPhone ? (
            <Button
              className="flex-1 gap-2 btn-gradient rounded-xl h-12 font-semibold text-sm"
              asChild
            >
              <a href={`tel:${contactPhone}`}>
                <Phone className="size-4" />
                Call
              </a>
            </Button>
          ) : listing.contactEmail ? (
            <Button
              className="flex-1 gap-2 btn-gradient rounded-xl h-12 font-semibold text-sm"
              asChild
            >
              <a href={`mailto:${listing.contactEmail}`}>
                <Mail className="size-4" />
                Email
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Share Sheet */}
      {showShareSheet && (
        <div className="fixed inset-0 z-[100] animate-fade-in">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowShareSheet(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-5 pb-8 animate-slide-up max-w-lg mx-auto">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Share this listing</h3>
              <button
                onClick={() => setShowShareSheet(false)}
                className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X className="size-4 text-gray-500" />
              </button>
            </div>

            {/* Social Media Buttons */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              <button onClick={() => handleSocialShare('whatsapp')} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-green-50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center shadow-sm shadow-[#25D366]/20">
                  <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </div>
                <span className="text-[11px] font-semibold text-gray-600">WhatsApp</span>
              </button>

              <button onClick={() => handleSocialShare('facebook')} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-blue-50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center shadow-sm shadow-[#1877F2]/20">
                  <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </div>
                <span className="text-[11px] font-semibold text-gray-600">Facebook</span>
              </button>

              <button onClick={() => handleSocialShare('twitter')} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-sm shadow-black/20">
                  <svg className="size-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </div>
                <span className="text-[11px] font-semibold text-gray-600">X</span>
              </button>

              <button onClick={() => handleSocialShare('telegram')} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-blue-50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center shadow-sm shadow-[#0088cc]/20">
                  <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </div>
                <span className="text-[11px] font-semibold text-gray-600">Telegram</span>
              </button>
            </div>

            {/* Copy Link */}
            <button
              onClick={() => { handleCopyLink(); setShowShareSheet(false) }}
              className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                <svg className="size-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">Copy link</p>
                <p className="text-[11px] text-gray-400 truncate max-w-[250px]">{typeof window !== 'undefined' ? window.location.href : ''}</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Detail Item Component ────────────────────────────────────────────

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="card-elevated rounded-2xl p-4 bg-white border border-gray-100/60 hover:border-[#006633]/10 group transition-all cursor-default"
      style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,102,51,0.03) 0%, rgba(0,102,51,0.005) 100%)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Hero skeleton */}
      <Skeleton className="aspect-[4/3] md:aspect-[16/9] w-full" />

      {/* Content skeleton */}
      <div className="relative -mt-6 rounded-t-2xl bg-white z-10 min-h-[calc(100vh-60px)]">
        <div className="max-w-4xl mx-auto px-5 md:px-8 pt-6 pb-32 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-lg" />
          </div>
          <div className="divider-premium my-5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="divider-premium my-5" />
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-elevated rounded-2xl p-4 bg-white border border-gray-100/60 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Error State ──────────────────────────────────────────────────────

function ErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <AlertCircle className="size-8 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">{message}</h2>
        <p className="text-sm text-gray-500">The listing you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Button
          className="gap-2 bg-[#006633] hover:bg-[#004d26] rounded-xl px-6"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" />
          Go Back
        </Button>
      </div>
    </div>
  )
}
