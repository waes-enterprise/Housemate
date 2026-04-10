'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Bell, MessageSquare, Star, CheckCircle, XCircle,
  TrendingDown, UserPlus, Info, CheckCheck, Loader2, Home,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'

// ─── Types ───────────────────────────────────────────────────────────

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  link: string | null
  createdAt: string
}

type FilterTab = 'all' | 'unread' | 'messages' | 'reviews' | 'listings'

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'messages', label: 'Messages' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'listings', label: 'Listings' },
]

// ─── Helpers ──────────────────────────────────────────────────────────

function getNotificationIcon(type: string) {
  switch (type) {
    case 'new_message':
      return <MessageSquare className="size-4 text-blue-500" />
    case 'new_review':
      return <Star className="size-4 text-amber-500" />
    case 'listing_approved':
      return <CheckCircle className="size-4 text-green-500" />
    case 'listing_rejected':
      return <XCircle className="size-4 text-red-500" />
    case 'price_drop':
      return <TrendingDown className="size-4 text-orange-500" />
    case 'new_follower':
      return <UserPlus className="size-4 text-purple-500" />
    case 'system':
      return <Info className="size-4 text-gray-500" />
    default:
      return <Bell className="size-4 text-gray-500" />
  }
}

// ─── Page Component ───────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch notifications
  const fetchNotifications = useCallback(async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams({ page: String(page) })
      if (activeTab === 'unread') params.set('unreadOnly', 'true')

      const res = await fetch(`/api/notifications?${params}`)
      const data = await res.json()

      let filtered = data.notifications || []

      // Client-side filter for type-based tabs
      if (activeTab === 'messages') {
        filtered = filtered.filter((n: Notification) => n.type === 'new_message')
      } else if (activeTab === 'reviews') {
        filtered = filtered.filter((n: Notification) => n.type === 'new_review')
      } else if (activeTab === 'listings') {
        filtered = filtered.filter(
          (n: Notification) =>
            n.type === 'listing_approved' ||
            n.type === 'listing_rejected' ||
            n.type === 'price_drop'
        )
      }

      setNotifications((prev) => (append ? [...prev, ...filtered] : filtered))
      setUnreadCount(data.unreadCount ?? 0)
      setHasMore(data.hasMore ?? false)
      setCurrentPage(page)
    } catch {
      // Ignore
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchNotifications(1)
  }, [fetchNotifications])

  // Handle tab change
  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab)
    setNotifications([])
    setCurrentPage(1)
  }

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {
      // Ignore
    }
  }

  // Mark single notification as read and navigate
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await fetch('/api/notifications/read', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: [notification.id] }),
        })
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch {
        // Ignore
      }
    }

    if (notification.link) {
      router.push(notification.link)
    }
  }

  // Load more
  const handleLoadMore = () => {
    fetchNotifications(currentPage + 1, true)
  }

  // ─── Loading State ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        <header className="sticky top-0 z-40 bg-[#006633]">
          <div className="flex items-center px-4 py-3 gap-3">
            <Link href="/" className="shrink-0">
              <Home className="size-5 text-white" />
            </Link>
            <Skeleton className="h-5 w-36 bg-white/20" />
          </div>
        </header>
        <div className="px-4 py-3 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-lg bg-gray-200" />
          ))}
        </div>
        <div className="px-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex gap-3">
                <Skeleton className="size-8 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-gray-200" />
                  <Skeleton className="h-3 w-1/2 bg-gray-200" />
                  <Skeleton className="h-3 w-24 bg-gray-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#006633]">
        <div className="flex items-center px-4 py-3 gap-3">
          <button onClick={() => router.back()} className="shrink-0 hover:opacity-80">
            <ArrowLeft className="size-5 text-white" />
          </button>
          <Link href="/" className="shrink-0 hover:opacity-80">
            <h1 className="text-white font-bold text-lg tracking-tight">Housemate<span className="text-[#4ade80]">.zm</span></h1>
          </Link>
          <div className="flex-1" />
          <span className="text-white/70 text-xs font-medium">Notifications</span>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-none">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-3.5 py-[6px] rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-[#006633] text-white shadow-sm shadow-[#006633]/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mark all read bar */}
      {unreadCount > 0 && (
        <div className="px-4 pb-2">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-medium text-[#006633] hover:text-[#004d26] transition-colors"
          >
            <CheckCheck className="size-3.5" />
            Mark all as read
            <span className="text-gray-400 font-normal ml-1">({unreadCount} unread)</span>
          </button>
        </div>
      )}

      {/* Notifications list */}
      <div className="px-4 pb-8">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Bell className="size-9 text-gray-300" />
            </div>
            <h2 className="text-base font-semibold text-gray-600 mb-1">No notifications yet</h2>
            <p className="text-sm text-gray-400 text-center max-w-[240px]">
              {activeTab === 'unread'
                ? "You're all caught up!"
                : 'Notifications about your listings and activity will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left bg-white rounded-xl p-4 border transition-all duration-200 hover:shadow-sm flex gap-3 ${
                  !notification.isRead
                    ? 'border-[#006633]/20 bg-[#f0fdf4]/30'
                    : 'border-gray-100'
                }`}
              >
                <div className="shrink-0 mt-0.5 h-9 w-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <p className={`text-sm leading-snug flex-1 ${
                      !notification.isRead
                        ? 'font-semibold text-gray-900'
                        : 'font-medium text-gray-700'
                    }`}>
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <span className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-[#006633]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </button>
            ))}

            {/* Load more */}
            {hasMore && (
              <div className="pt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="text-xs font-medium text-[#006633] border-[#006633]/30 hover:bg-[#f0fdf4] rounded-lg"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load more'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
