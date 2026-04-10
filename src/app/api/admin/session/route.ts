import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminFromRequest } from '@/lib/admin-auth'

export async function GET() {
  try {
    const admin = await getAdminFromRequest()

    if (!admin) {
      return NextResponse.json({ user: null })
    }

    const user = await db.user.findUnique({
      where: { id: admin.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        createdAt: true,
      },
    })

    if (!user || user.isBanned) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Admin session error:', error)
    return NextResponse.json({ user: null })
  }
}
