'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  MapPin,
  Heart,
  Phone,
  Mail,
  Star,
  ShieldCheck,
  Share2,
  MessageCircle,
  Check,
  X,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import type { Listing } from './listing-card'
import { formatPrice } from './listing-card'

interface ListingDetailProps {
  listing: Listing | null
  open: boolean
  isFavorited: boolean
  onOpenChange: (open: boolean) => void
  onToggleFavorite: () => void
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = localStorage.getItem('hmz-session')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('hmz-session', sessionId)
  }
  return sessionId
}

export function ListingDetail({
  listing,
  open,
  isFavorited,
  onOpenChange,
  onToggleFavorite,
}: ListingDetailProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)

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

  const getShareUrl = useCallback(() => {
    if (listing) {
      return `${window.location.origin}/listings/${listing.id}`
    }
    return window.location.href
  }, [listing])

  const handleCopyLink = useCallback(() => {
    const url = getShareUrl()
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
      } catch {
        // Last resort — ignore
      }
      document.body.removeChild(textArea)
    })
  }, [getShareUrl])

  const handleShareNative = useCallback(async () => {
    if (!listing) return
    try {
      if (navigator.share) {
        await navigator.share({
          title: listing.title,
          text: `${listing.title} - ${formatPrice(listing.price)}/${listing.priceUnit} on Housemate ZM`,
          url: getShareUrl(),
        })
      } else {
        handleCopyLink()
      }
    } catch (err) {
      // User cancelled the share dialog — do nothing
      if (err instanceof Error && err.name !== 'AbortError') {
        handleCopyLink()
      }
    }
    setShowShareSheet(false)
  }, [listing, getShareUrl, handleCopyLink])

  const handleSocialShare = useCallback((platform: string) => {
    if (!listing) return
    const url = encodeURIComponent(getShareUrl())
    const text = encodeURIComponent(`${listing.title} - ${formatPrice(listing.price)}/${listing.priceUnit} on Housemate ZM`)
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
  }, [listing, getShareUrl])

  if (!listing) return null

  // Generate consistent rating from id
  const hash = listing.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const rating = (3.5 + (hash % 15) / 10).toFixed(1)

  const handleMessage = () => {
    if (!isAuthenticated) {
      onOpenChange(false)
      router.push('/auth/signin?redirect=/inbox')
      return
    }
    if (!listing.ownerId) {
      // No owner ID — fallback to WhatsApp or email contact
      const phone = listing.contactPhone
      if (phone) {
        window.open(`https://wa.me/${phone.replace(/[^0-9+]/g, '')}`, '_blank')
      } else if (listing.contactEmail) {
        window.location.href = `mailto:${listing.contactEmail}`
      }
      return
    }
    const params = new URLSearchParams({
      conversation: 'new',
      participantId: listing.ownerId,
      listingId: listing.id,
    })
    onOpenChange(false)
    router.push(`/inbox?${params.toString()}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl animate-fade-in">
        {/* Image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 500px"
            priority
          />
          {/* Prominent gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Action buttons on image */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            <button
              onClick={() => setShowShareSheet(true)}
              className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white hover:scale-105 active:scale-95 transition-all"
            >
              <Share2 className="size-4 text-gray-600" />
            </button>
            <button
              onClick={onToggleFavorite}
              className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white hover:scale-105 active:scale-95 transition-all"
            >
              <Heart
                className={`size-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
              />
            </button>
          </div>

          {/* Price overlay with premium gradient */}
          <div className="absolute bottom-3 left-3 z-10">
            <div className="bg-gradient-to-r from-[#006633] to-[#004d26] text-white px-4 py-2 rounded-xl shadow-lg shadow-[#006633]/30">
              <span className="text-xl font-extrabold">{formatPrice(listing.price)}</span>
              <span className="text-xs text-white/80 ml-1"> / {listing.priceUnit}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <DialogHeader className="text-left space-y-1 p-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <DialogTitle className="text-base font-bold leading-tight text-gray-900">
                  {listing.title}
                </DialogTitle>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                  <MapPin className="size-3.5 shrink-0" />
                  <span className="text-xs">{listing.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-xl shrink-0 border border-amber-100">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-gray-800">{rating}</span>
              </div>
            </div>
          </DialogHeader>

          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5">
            <Badge className="bg-[#006633]/10 text-[#006633] border-0 rounded-lg text-[11px] font-medium">
              {listing.category}
            </Badge>
            {listing.tier !== 'standard' && (
              <Badge className="bg-[#006633]/10 text-[#006633] border-0 rounded-lg text-[11px] font-medium gap-1">
                <ShieldCheck className="size-3" />
                Verified
              </Badge>
            )}
          </div>

          <Separator />

          <DialogDescription className="text-[13px] leading-relaxed text-gray-600 whitespace-pre-wrap">
            {listing.description}
          </DialogDescription>

          <Separator />

          {/* Contact Info - Premium rounded design with icons */}
          {(listing.contactPhone || listing.contactEmail) && (
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Contact Information
              </h4>
              <div className="space-y-2">
                {listing.contactPhone && (
                  <a
                    href={`tel:${listing.contactPhone}`}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-[#006633]/20 hover:from-[#f0fdf4] hover:to-white"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006633] to-[#004d26] flex items-center justify-center shadow-sm">
                      <Phone className="size-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Phone</p>
                      <span className="text-sm font-semibold text-gray-800 block truncate">{listing.contactPhone}</span>
                    </div>
                  </a>
                )}
                {listing.contactEmail && (
                  <a
                    href={`mailto:${listing.contactEmail}`}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-[#006633]/20 hover:from-[#f0fdf4] hover:to-white"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006633] to-[#004d26] flex items-center justify-center shadow-sm">
                      <Mail className="size-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Email</p>
                      <span className="text-sm font-semibold text-gray-800 block truncate">{listing.contactEmail}</span>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons - Premium rounded design */}
          <div className="flex gap-2.5 pt-1 pb-1">
            <Button
              variant="outline"
              className={`gap-2 rounded-xl h-11 border-gray-200 font-semibold px-3 ${isFavorited ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' : ''}`}
              onClick={onToggleFavorite}
            >
              <Heart
                className={`size-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`}
              />
              {isFavorited ? 'Saved' : 'Save'}
            </Button>

            <Button
              variant="outline"
              className="flex-1 gap-2 rounded-xl h-11 border-gray-200 font-semibold"
              onClick={handleMessage}
            >
              <MessageCircle className="size-4" />
              Message
            </Button>

            {listing.contactPhone ? (
              <Button
                className="flex-1 gap-2 bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#007a3d] hover:to-[#005f2e] rounded-xl h-11 font-semibold shadow-md shadow-[#006633]/20"
                asChild
              >
                <a href={`tel:${listing.contactPhone}`}>
                  <Phone className="size-4" />
                  Call Now
                </a>
              </Button>
            ) : listing.contactEmail ? (
              <Button
                className="flex-1 gap-2 bg-gradient-to-r from-[#006633] to-[#004d26] hover:from-[#007a3d] hover:to-[#005f2e] rounded-xl h-11 font-semibold shadow-md shadow-[#006633]/20"
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
      </DialogContent>

      {/* Share Sheet Overlay */}
      {showShareSheet && (
        <div className="fixed inset-0 z-[100] animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowShareSheet(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl p-5 pb-8 animate-slide-up">
            {/* Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Title */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Share this listing</h3>
              <button
                onClick={() => setShowShareSheet(false)}
                className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X className="size-4 text-gray-500" />
              </button>
            </div>

            {/* Native share (mobile) */}
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={handleShareNative}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-gradient-to-r from-[#006633] to-[#004d26] text-white mb-4 hover:from-[#007a3d] hover:to-[#005f2e] transition-all active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Share2 className="size-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Share via...</p>
                  <p className="text-[11px] text-white/70">Use your device&apos;s share sheet</p>
                </div>
              </button>
            )}

            {/* Social Media Buttons */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {/* WhatsApp */}
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-green-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center shadow-sm shadow-[#25D366]/20">
                  <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-gray-600">WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleSocialShare('facebook')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center shadow-sm shadow-[#1877F2]/20">
                  <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-gray-600">Facebook</span>
              </button>

              {/* X / Twitter */}
              <button
                onClick={() => handleSocialShare('twitter')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-sm shadow-black/20">
                  <svg className="size-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-gray-600">X</span>
              </button>

              {/* Telegram */}
              <button
                onClick={() => handleSocialShare('telegram')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center shadow-sm shadow-[#0088cc]/20">
                  <svg className="size-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-gray-600">Telegram</span>
              </button>
            </div>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border transition-all active:scale-[0.98] ${
                shareCopied
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                shareCopied
                  ? 'bg-green-100'
                  : 'bg-gray-200'
              }`}>
                {shareCopied ? (
                  <Check className="size-5 text-green-600" />
                ) : (
                  <svg className="size-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold">{shareCopied ? 'Link copied!' : 'Copy link'}</p>
                <p className="text-[11px] text-gray-400 truncate max-w-[200px]">{getShareUrl()}</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </Dialog>
  )
}
