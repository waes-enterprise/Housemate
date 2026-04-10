import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { pushEnabled: true },
    })

    return NextResponse.json({
      enabled: user?.pushEnabled ?? false,
    })
  } catch (error) {
    console.error('Error checking push permission:', error)
    return NextResponse.json({ error: 'Failed to check push permission' }, { status: 500 })
  }
}
