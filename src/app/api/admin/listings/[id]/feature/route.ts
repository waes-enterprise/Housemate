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
    const ip = getClientIp(request)

    const existing = await db.listing.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const listing = await db.listing.update({
      where: { id },
      data: { isFeatured: !existing.isFeatured },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        categoryRef: {
          select: { id: true, name: true, slug: true },
        },
        _count: { select: { favorites: true } },
      },
    })

    await logActivity(
      admin.userId,
      'admin_toggle_featured',
      {
        listingId: id,
        title: listing.title,
        isFeatured: listing.isFeatured,
      },
      ip
    )

    return NextResponse.json({ listing })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin listing feature PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
