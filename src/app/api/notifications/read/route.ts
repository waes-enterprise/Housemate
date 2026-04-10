import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.userId || null
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId(request)

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { ids, all } = body

    if (all === true) {
      // Mark all as read for this user
      await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      })
      return NextResponse.json({ message: 'All notifications marked as read' })
    }

    if (Array.isArray(ids) && ids.length > 0) {
      // Mark specific notifications as read (only if they belong to this user)
      await db.notification.updateMany({
        where: {
          id: { in: ids },
          userId,
        },
        data: { isRead: true },
      })
      return NextResponse.json({ message: 'Notifications marked as read' })
    }

    return NextResponse.json({ error: 'Provide ids array or all: true' }, { status: 400 })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
  }
}
