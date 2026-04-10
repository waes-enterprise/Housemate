import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, logActivity, getClientIp } from '@/lib/admin-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const ip = getClientIp(request)

    const { isBanned, banReason } = body

    if (typeof isBanned !== 'boolean') {
      return NextResponse.json({ error: 'isBanned must be a boolean' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent banning admins (except self is already handled by requiring admin)
    if (existing.role === 'admin' && existing.id !== admin.userId) {
      return NextResponse.json({ error: 'Cannot ban another admin' }, { status: 403 })
    }

    const user = await db.user.update({
      where: { id },
      data: {
        isBanned,
        banReason: isBanned ? banReason || 'No reason provided' : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isBanned: true,
        banReason: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    await logActivity(
      admin.userId,
      isBanned ? 'admin_ban_user' : 'admin_unban_user',
      { targetUserId: id, targetUserName: existing.name, banReason },
      ip
    )

    return NextResponse.json({ user })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin user ban PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
