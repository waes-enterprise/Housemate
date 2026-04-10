import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

const PAGE_SIZE = 20

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.userId || null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)

    if (!userId) {
      return NextResponse.json({ notifications: [], unreadCount: 0, total: 0 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    const where: Record<string, unknown> = { userId }
    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, unreadCount, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      db.notification.count({
        where: { userId, isRead: false },
      }),
      db.notification.count({ where }),
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
      total,
      page,
      pageSize: PAGE_SIZE,
      hasMore: page * PAGE_SIZE < total,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { userId: targetUserId, type, title, message, link } = body

    if (!targetUserId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, title, message' },
        { status: 400 }
      )
    }

    // Only allow system notifications or notifications for the user's own listings
    if (targetUserId !== userId && type !== 'system') {
      return NextResponse.json({ error: 'Cannot create notification for another user' }, { status: 403 })
    }

    const notification = await db.notification.create({
      data: {
        userId: targetUserId,
        type,
        title,
        message,
        link: link || null,
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}
