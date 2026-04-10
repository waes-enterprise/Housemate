import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')

    if (!idsParam) {
      return NextResponse.json({ error: 'Missing ids parameter' }, { status: 400 })
    }

    const ids = idsParam.split(',').filter(Boolean).slice(0, 3)

    if (ids.length === 0) {
      return NextResponse.json({ error: 'No valid ids provided' }, { status: 400 })
    }

    const listings = await db.listing.findMany({
      where: { id: { in: ids } },
      include: {
        _count: { select: { favorites: true, reviews: true } },
        reviews: {
          select: { rating: true },
        },
      },
    })

    // Compute review stats per listing
    const enriched = listings.map((listing) => {
      const reviews = listing.reviews || []
      const totalReviews = reviews.length
      const avgRating =
        totalReviews > 0
          ? Math.round(
              (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
            ) / 10
          : null

      return {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        priceUnit: listing.priceUnit,
        location: listing.location,
        category: listing.category,
        imageUrl: listing.imageUrl,
        imageUrls: listing.imageUrls,
        tier: listing.tier,
        contactPhone: listing.contactPhone,
        contactEmail: listing.contactEmail,
        isFeatured: listing.isFeatured,
        createdAt: listing.createdAt,
        ownerId: listing.ownerId,
        totalReviews,
        averageRating: avgRating,
        favoriteCount: listing._count.favorites,
      }
    })

    return NextResponse.json(enriched)
  } catch (error) {
    console.error('Error fetching batch listings:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}
