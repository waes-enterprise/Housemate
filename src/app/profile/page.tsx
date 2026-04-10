'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  LogOut,
  ShieldCheck,
  Loader2,
  Settings,
  ChevronRight,
  Home,
  Bell,
} from 'lucide-react'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'
import { usePushNotifications } from '@/hooks/use-push-notifications'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
  role: string
  createdAt: string
  isVerifiedAgent?: boolean
  agentBio?: string | null
  agentCompany?: string | null
  agentLicense?: string | null
  agentSpecialties?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [listingCount, setListingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { isSupported, permission, isSubscribed, isLoading: pushLoading, toggle: togglePush } = usePushNotifications()

  useEffect(() => {
    async function fetchData() {
      try {
        const [sessionRes, favRes, listingRes] = await Promise.all([
          fetch('/api/auth/session'),
          fetch('/api/favorites'),
          fetch('/api/listings'),
        ])

        const sessionData = await sessionRes.json()
        const favData = await favRes.json()
        const listingData = await listingRes.json()

        if (!sessionData.user) {
          router.push('/auth/signin')
          return
        }

        setUser(sessionData.user)
        setFavoriteCount(Array.isArray(favData) ? favData.length : 0)
        setListingCount(Array.isArray(listingData) ? listingData.length : 0)
      } catch {
        router.push('/auth/signin')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-ZM', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <Loader2 className="size-6 text-[#006633] animate-spin" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Header with pattern/texture */}
      <div className="relative bg-[#006633] overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
          >
            <Home className="size-4 text-white" />
          </Link>
          <Link href="/" className="shrink-0 hover:opacity-80">
            <h1 className="text-white font-bold text-lg">Housemate<span className="text-[#4ade80]">.zm</span></h1>
          </Link>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-md mx-auto w-full space-y-4 -mt-4">
        {/* Avatar & Name - gradient background card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {/* Gradient header area */}
          <div className="h-20 bg-gradient-to-br from-[#006633] via-[#005a2c] to-[#0d9488]" />
          <div className="px-6 pb-5 -mt-10 text-center">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-[#006633] border-4 border-white shadow-lg flex items-center justify-center mb-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <span className="text-white text-2xl font-bold">
                  {getInitials(user.name)}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              {user.role === 'admin' && (
                <span className="inline-flex items-center gap-1 bg-[#006633]/10 text-[#006633] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <ShieldCheck className="size-3" />
                  Admin
                </span>
              )}
              <span className="text-sm text-gray-500">{user.email}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Member since {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Stats - premium gradient cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-4 text-center shadow-sm border border-red-100/50 card-premium">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-1.5">
              <Heart className="size-4 text-red-500" />
            </div>
            <p className="text-lg font-extrabold text-gray-900">{favoriteCount}</p>
            <p className="text-[10px] text-gray-500 font-medium">Saved</p>
          </div>
          <Link href="/my-listings" className="bg-gradient-to-br from-[#f0fdf4] to-white rounded-2xl p-4 text-center shadow-sm border border-[#006633]/10 card-premium">
            <div className="w-9 h-9 rounded-xl bg-[#006633]/10 flex items-center justify-center mx-auto mb-1.5">
              <ShieldCheck className="size-4 text-[#006633]" />
            </div>
            <p className="text-lg font-extrabold text-gray-900">{listingCount}</p>
            <p className="text-[10px] text-gray-500 font-medium">Listings</p>
          </Link>
          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-4 text-center shadow-sm border border-amber-100/50 card-premium">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-1.5">
              <Settings className="size-4 text-amber-500" />
            </div>
            <p className="text-lg font-extrabold text-gray-900">0</p>
            <p className="text-[10px] text-gray-500 font-medium">Reviews</p>
          </div>
        </div>

        {/* Info sections - hover slide effects */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          <div className="px-4 py-3.5 flex items-center gap-3 hover:bg-[#f0fdf4] hover:pl-5 group">
            <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-[#006633]/10 flex items-center justify-center shrink-0">
              <User className="size-4 text-gray-500 group-hover:text-[#006633]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Full Name</p>
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            </div>
            <ChevronRight className="size-4 text-gray-300 group-hover:text-[#006633] group-hover:translate-x-0.5" />
          </div>

          <div className="px-4 py-3.5 flex items-center gap-3 hover:bg-[#f0fdf4] hover:pl-5 group">
            <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-[#006633]/10 flex items-center justify-center shrink-0">
              <Mail className="size-4 text-gray-500 group-hover:text-[#006633]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
            </div>
            <ChevronRight className="size-4 text-gray-300 group-hover:text-[#006633] group-hover:translate-x-0.5" />
          </div>

          <div className="px-4 py-3.5 flex items-center gap-3 hover:bg-[#f0fdf4] hover:pl-5 group">
            <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-[#006633]/10 flex items-center justify-center shrink-0">
              <Phone className="size-4 text-gray-500 group-hover:text-[#006633]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Phone</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.phone || 'Not provided'}
              </p>
            </div>
            <ChevronRight className="size-4 text-gray-300 group-hover:text-[#006633] group-hover:translate-x-0.5" />
          </div>

          <div className="px-4 py-3.5 flex items-center gap-3 hover:bg-[#f0fdf4] hover:pl-5 group">
            <div className="w-9 h-9 rounded-xl bg-gray-100 group-hover:bg-[#006633]/10 flex items-center justify-center shrink-0">
              <Calendar className="size-4 text-gray-500 group-hover:text-[#006633]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Joined</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</p>
            </div>
            <ChevronRight className="size-4 text-gray-300 group-hover:text-[#006633] group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Become an Agent / Verified Agent Card */}
        {user.isVerifiedAgent ? (
          <div className="bg-gradient-to-br from-[#f0fdf4] to-white rounded-2xl shadow-sm border border-[#006633]/20 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#006633] flex items-center justify-center">
                  <ShieldCheck className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Verified Agent</h3>
                  <p className="text-[11px] text-[#006633] font-medium">Your account is verified</p>
                </div>
              </div>
              {user.agentCompany && (
                <p className="text-xs text-gray-600 mb-2">{user.agentCompany}</p>
              )}
              {user.agentSpecialties && user.agentSpecialties !== '[]' && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(() => {
                    try {
                      return JSON.parse(user.agentSpecialties).map((s: string) => (
                        <span key={s} className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#006633]/10 text-[#006633] text-[10px] font-semibold">
                          {s}
                        </span>
                      ))
                    } catch { return null }
                  })()}
                </div>
              )}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#006633]/10">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{listingCount}</p>
                  <p className="text-[10px] text-gray-500">Listings</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{favoriteCount}</p>
                  <p className="text-[10px] text-gray-500">Saved</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Link href="/profile/agent-verify" className="block bg-gradient-to-br from-[#f0fdf4] to-white rounded-2xl shadow-sm border border-[#006633]/20 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#006633]/10 flex items-center justify-center">
                  <ShieldCheck className="size-5 text-[#006633]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Become a Verified Agent</h3>
                  <p className="text-[11px] text-gray-500">Grow your business on Housemate ZM</p>
                </div>
              </div>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-[#006633]/10 flex items-center justify-center shrink-0">
                    <span className="text-[#006633] text-[10px] font-bold">1</span>
                  </span>
                  Get a verified badge on your listings
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-[#006633]/10 flex items-center justify-center shrink-0">
                    <span className="text-[#006633] text-[10px] font-bold">2</span>
                  </span>
                  Stand out from other sellers
                </li>
                <li className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-[#006633]/10 flex items-center justify-center shrink-0">
                    <span className="text-[#006633] text-[10px] font-bold">3</span>
                  </span>
                  Build trust with potential buyers
                </li>
              </ul>
              <div className="inline-flex items-center gap-1.5 bg-[#006633] text-white text-xs font-semibold px-4 py-2 rounded-xl">
                Apply Now
                <ChevronRight className="size-3" />
              </div>
            </div>
          </Link>
        )}

        {/* Push Notification Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#006633]/10 flex items-center justify-center">
                <Bell className="size-5 text-[#006633]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900">Push Notifications</h3>
                <p className="text-[11px] text-gray-500">
                  Enable to receive instant notifications about messages, reviews, and listing updates
                </p>
              </div>
              {isSupported ? (
                <Switch
                  checked={isSubscribed}
                  onCheckedChange={togglePush}
                  disabled={pushLoading}
                  aria-label="Toggle push notifications"
                />
              ) : null}
            </div>
            {!isSupported && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-3">
                Push notifications are not supported in this browser.
              </p>
            )}
            {isSupported && permission === 'denied' && !isSubscribed && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-3">
                Notifications are blocked. Please enable them in your browser settings to receive push alerts.
              </p>
            )}
            {isSupported && permission === 'granted' && isSubscribed && (
              <p className="text-xs text-[#006633] bg-[#f0fdf4] rounded-lg px-3 py-2 mt-3">
                Push notifications are active. You&apos;ll receive real-time alerts.
              </p>
            )}
          </div>
        </div>

        {/* Actions - hover slide effects */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          <Link
            href="/saved"
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#f0fdf4] hover:pl-5 group"
          >
            <Heart className="size-4 text-red-500" />
            <span className="text-sm font-medium text-gray-700 flex-1">My Saved Listings</span>
            <ChevronRight className="size-4 text-gray-300 group-hover:text-[#006633] group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/profile/edit"
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#f0fdf4] hover:pl-5 group"
          >
            <Settings className="size-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 flex-1">Account Settings</span>
            <ChevronRight className="size-4 text-gray-300 group-hover:text-[#006633] group-hover:translate-x-0.5" />
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 hover:pl-5 group"
          >
            <LogOut className="size-4 text-red-500" />
            <span className="text-sm font-medium text-red-600 flex-1 text-left">Sign Out</span>
          </button>
        </div>

        {/* App version */}
        <p className="text-center text-[10px] text-gray-400 pt-2 pb-4">
          Housemate ZM v1.0.0
        </p>
      </div>
    </div>
  )
}
