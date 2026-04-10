import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { subscription } = body

    if (!subscription || typeof subscription !== 'object') {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    const subscriptionJson = JSON.stringify(subscription)

    await db.user.update({
      where: { id: payload.userId },
      data: {
        pushSubscription: subscriptionJson,
        pushEnabled: true,
      },
    })

    return NextResponse.json({ success: true, message: 'Push subscription saved' })
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return NextResponse.json({ error: 'Failed to save push subscription' }, { status: 500 })
  }
}
