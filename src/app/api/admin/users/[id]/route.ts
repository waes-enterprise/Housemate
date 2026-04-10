import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, logActivity, getClientIp } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const user = await db.user.findUnique({
      where: { id },
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
        _count: {
          select: { listings: true, favorites: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const [recentActivity, listings] = await Promise.all([
      db.activityLog.findMany({
        where: { userId: id },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
      db.listing.findMany({
        where: { ownerId: id },
        select: {
          id: true,
          title: true,
          category: true,
          location: true,
          price: true,
          priceUnit: true,
          tier: true,
          status: true,
          isFeatured: true,
          imageUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return NextResponse.json({ user, recentActivity, listings })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin user GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const ip = getClientIp(request)

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { name, email, phone, role } = body

    // Check email uniqueness if changing
    if (email && email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailExists = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      })
      if (emailExists) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      }
    }

    const user = await db.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email: email.toLowerCase() }),
        ...(phone !== undefined && { phone }),
        ...(role !== undefined && { role }),
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
        _count: {
          select: { listings: true, favorites: true },
        },
      },
    })

    await logActivity(
      admin.userId,
      'admin_update_user',
      { targetUserId: id, changes: body },
      ip
    )

    return NextResponse.json({ user })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin user PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const ip = getClientIp(request)

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user favorites
    await db.favorite.deleteMany({ where: { userId: id } })

    // Set listings owner to null
    await db.listing.updateMany({
      where: { ownerId: id },
      data: { ownerId: null },
    })

    // Delete the user
    await db.user.delete({ where: { id } })

    await logActivity(
      admin.userId,
      'admin_delete_user',
      { deletedUserId: id, deletedUserName: existing.name, deletedUserEmail: existing.email },
      ip
    )

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin user DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
