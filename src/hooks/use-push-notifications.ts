'use client'

import { useState, useEffect, useCallback } from 'react'

interface UsePushNotificationsReturn {
  isSupported: boolean
  permission: NotificationPermission | 'unsupported'
  isSubscribed: boolean
  isLoading: boolean
  toggle: () => Promise<void>
}

/**
 * Hook that manages browser push notification subscription.
 *
 * 1. Checks for ServiceWorker and Push API support
 * 2. Reads the current Notification permission
 * 3. Fetches the server-side subscription state
 * 4. Provides a toggle to subscribe / unsubscribe
 */
export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    setIsSupported(supported)

    if (!supported) {
      setPermission('unsupported')
      setIsLoading(false)
      return
    }

    setPermission(Notification.permission)

    // Fetch server-side push enabled state
    async function fetchPushState() {
      try {
        const res = await fetch('/api/notifications/push/permission')
        if (res.ok) {
          const data = await res.json()
          setIsSubscribed(data.enabled === true)
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false)
      }
    }

    fetchPushState()
  }, [])

  const toggle = useCallback(async () => {
    if (!isSupported) return

    setIsLoading(true)

    try {
      if (isSubscribed) {
        // --- Unsubscribe ---
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        if (subscription) {
          await subscription.unsubscribe()
        }

        const res = await fetch('/api/notifications/push/unsubscribe', { method: 'POST' })
        if (res.ok) {
          setIsSubscribed(false)
        }
      } else {
        // --- Subscribe ---
        let currentPermission = Notification.permission

        if (currentPermission === 'default') {
          currentPermission = await Notification.requestPermission()
          setPermission(currentPermission)
        }

        if (currentPermission !== 'granted') {
          setIsLoading(false)
          return
        }

        // Register service worker (idempotent)
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' })

        // Create or retrieve push subscription
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        const subscribeOptions: PushSubscriptionOptionsInit = {
          userVisibleOnly: true,
          ...(vapidKey ? { applicationServerKey: urlBase64ToUint8Array(vapidKey) } : {}),
        }

        const subscription = await registration.pushManager.subscribe(subscribeOptions)

        // Send subscription to server
        const res = await fetch('/api/notifications/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription.toJSON()),
        })

        if (res.ok) {
          setIsSubscribed(true)
        }
      }
    } catch (error) {
      console.error('[usePushNotifications] Error toggling subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isSupported, isSubscribed])

  return { isSupported, permission, isSubscribed, isLoading, toggle }
}

/**
 * Convert a base64 VAPID key to a Uint8Array for PushManager.subscribe().
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
