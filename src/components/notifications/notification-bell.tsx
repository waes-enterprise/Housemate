'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, MessageSquare, Star, CheckCircle, XCircle, TrendingDown, UserPlus, Info, CheckCheck } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  link: string | null
  createdAt: string
}

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

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/unread')
      const data = await res.json()
      setUnreadCount(data.count ?? 0)
    } catch {
      // Ignore
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications?page=1')
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch {
      // Ignore
    } finally {
      setLoading(false)
    }
  }, [])

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  // Fetch notifications when sheet opens
  useEffect(() => {
    if (sheetOpen) {
      fetchNotifications()
    }
  }, [sheetOpen, fetchNotifications])

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
      setSheetOpen(false)
      router.push(notification.link)
    }
  }

  return (
    <>
      <button
        onClick={() => setSheetOpen(true)}
        className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="size-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 min-w-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-2 flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-base font-bold text-gray-900">Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-xs text-[#006633] hover:text-[#004d26] hover:bg-[#f0fdf4] h-7 px-2"
              >
                <CheckCheck className="size-3.5 mr-1" />
                Mark all read
              </Button>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="size-6 border-2 border-[#006633]/20 border-t-[#006633] rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <Bell className="size-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">You&apos;ll see updates here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-[#f0fdf4]/50' : ''
                    }`}
                  >
                    <div className="shrink-0 mt-0.5 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p className={`text-sm leading-snug ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-[#006633]" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-3">
              <Link
                href="/notifications"
                onClick={() => setSheetOpen(false)}
                className="block w-full text-center text-sm font-medium text-[#006633] hover:text-[#004d26] transition-colors"
              >
                View all notifications
              </Link>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
