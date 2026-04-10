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

    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        categoryRef: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        _count: { select: { favorites: true, reviews: true, conversations: true } },
        reviews: { select: { rating: true } },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json({ listing })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin listing GET error:', error)
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

    const existing = await db.listing.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const {
      title,
      description,
      price,
      priceUnit,
      location,
      category,
      imageUrl,
      tier,
      contactPhone,
      contactEmail,
      isFeatured,
      isApproved,
      status,
      ownerId,
      categoryId,
    } = body

    const listing = await db.listing.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(priceUnit !== undefined && { priceUnit }),
        ...(location !== undefined && { location }),
        ...(category !== undefined && { category }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(tier !== undefined && { tier }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isApproved !== undefined && { isApproved }),
        ...(status !== undefined && { status }),
        ...(ownerId !== undefined && { ownerId }),
        ...(categoryId !== undefined && { categoryId }),
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        categoryRef: {
          select: { id: true, name: true, slug: true },
        },
        _count: { select: { favorites: true, reviews: true } },
      },
    })

    await logActivity(
      admin.userId,
      'admin_update_listing',
      { listingId: listing.id, title: listing.title, changes: body },
      ip
    )

    return NextResponse.json({ listing })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin listing PUT error:', error)
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

    const existing = await db.listing.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    await db.favorite.deleteMany({ where: { listingId: id } })
    await db.listing.delete({ where: { id } })

    await logActivity(
      admin.userId,
      'admin_delete_listing',
      { listingId: id, title: existing.title },
      ip
    )

    return NextResponse.json({ message: 'Listing deleted successfully' })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin listing DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
