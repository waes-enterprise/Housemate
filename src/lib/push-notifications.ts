import { db } from '@/lib/db'

/**
 * Push Notification Utility for Housemate ZM
 *
 * This module handles sending push notifications via the Firebase Cloud Messaging (FCM)
 * protocol. When Firebase/VAPID keys are not configured, all functions gracefully
 * degrade to no-ops with console logging for development.
 */

interface PushPayload {
  title: string
  body: string
  data?: Record<string, unknown>
  icon?: string
  badge?: string
  clickUrl?: string
}

function isPushConfigured(): boolean {
  const hasFirebase = !!process.env.FIREBASE_SERVER_KEY
  const hasVapid = !!process.env.VAPID_PRIVATE_KEY && !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  return hasFirebase || hasVapid
}

/**
 * Send a push notification directly to a subscription.
 * Uses the FCM legacy API when FIREBASE_SERVER_KEY is set.
 */
export async function sendPushNotification(
  subscriptionJson: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (!isPushConfigured()) {
    console.log('[Push] Skipping notification (not configured):', { title, body })
    return
  }

  const serverKey = process.env.FIREBASE_SERVER_KEY
  if (!serverKey) {
    console.log('[Push] No FIREBASE_SERVER_KEY configured, skipping send')
    return
  }

  try {
    const subscription = JSON.parse(subscriptionJson) as {
      endpoint?: string
      keys?: { p256dh?: string; auth?: string }
    }

    // FCM endpoint extraction: strip the subscribe path and use the registration token
    // or use the endpoint directly for FCM
    let to: string
    if (subscription.endpoint?.includes('fcm.googleapis.com')) {
      // Extract the token from the FCM endpoint
      const url = new URL(subscription.endpoint)
      to = url.pathname.split('/').pop() || subscription.endpoint
    } else {
      to = subscription.endpoint || ''
    }

    if (!to) {
      console.warn('[Push] No valid endpoint/token in subscription')
      return
    }

    const payload: PushPayload = {
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      ...(data?.url ? { clickUrl: data.url as string } : {}),
    }

    const fcmBody = {
      notification: {
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        click_action: payload.clickUrl || '/',
      },
      data: data
        ? Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)])
          )
        : undefined,
      to,
    }

    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${serverKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fcmBody),
    })

    if (!response.ok) {
      const result = await response.text()
      console.warn('[Push] FCM request failed:', response.status, result)
    }
  } catch (error) {
    console.error('[Push] Failed to send notification:', error)
  }
}

/**
 * Send a push notification to a specific user by looking up their subscription.
 */
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (!isPushConfigured()) {
    console.log('[Push] Skipping user notification (not configured):', { userId, title })
    return
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { pushEnabled: true, pushSubscription: true },
    })

    if (!user || !user.pushEnabled || !user.pushSubscription) {
      return
    }

    await sendPushNotification(user.pushSubscription, title, body, data)
  } catch (error) {
    console.error('[Push] Failed to send to user:', userId, error)
  }
}

/**
 * Send push notifications to multiple users (batch send).
 */
export async function sendPushToMultiple(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (!isPushConfigured()) {
    console.log('[Push] Skipping batch notification (not configured):', { title, body })
    return
  }

  if (userIds.length === 0) return

  try {
    const users = await db.user.findMany({
      where: {
        id: { in: userIds },
        pushEnabled: true,
        pushSubscription: { not: null },
      },
      select: { id: true, pushSubscription: true },
    })

    // Send all in parallel (fire-and-forget per user)
    await Promise.allSettled(
      users.map((user) =>
        sendPushNotification(user.pushSubscription!, title, body, data)
      )
    )
  } catch (error) {
    console.error('[Push] Failed to send batch notification:', error)
  }
}
