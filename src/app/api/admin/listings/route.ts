import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, logActivity, getClientIp } from '@/lib/admin-auth'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const tier = searchParams.get('tier') || ''
    const status = searchParams.get('status') || ''

    const where: Prisma.ListingWhereInput = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (tier) {
      where.tier = tier
    }

    if (status) {
      where.status = status
    }

    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          categoryRef: {
            select: { id: true, name: true, slug: true },
          },
          _count: { select: { favorites: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.listing.count({ where }),
    ])

    return NextResponse.json({
      listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin listings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()
    const ip = getClientIp(request)

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

    if (!title || !description || price === undefined || !location) {
      return NextResponse.json(
        { error: 'Title, description, price, and location are required' },
        { status: 400 }
      )
    }

    const listing = await db.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        priceUnit: priceUnit || 'day',
        location,
        category: category || 'Other',
        imageUrl: imageUrl || '',
        tier: tier || 'standard',
        contactPhone,
        contactEmail,
        isFeatured: isFeatured || false,
        isApproved: isApproved !== undefined ? isApproved : true,
        status: status || 'active',
        ownerId,
        categoryId,
      },
    })

    await logActivity(
      admin.userId,
      'admin_create_listing',
      { listingId: listing.id, title: listing.title },
      ip
    )

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin listings POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
