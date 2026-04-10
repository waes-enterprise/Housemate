import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            favorites: true,
            reviews: true,
          },
        },
        reviews: {
          select: { rating: true },
        },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const now = new Date()
    const createdAt = new Date(listing.createdAt)
    const daysSinceCreation = Math.max(
      1,
      Math.ceil((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    )

    const totalReviews = listing._count.reviews
    const averageRating =
      totalReviews > 0
        ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0

    return NextResponse.json({
      viewCount: listing.viewCount,
      inquiryCount: listing.inquiryCount,
      favoriteCount: listing._count.favorites,
      reviewCount: totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      viewsPerDay: Math.round((listing.viewCount / daysSinceCreation) * 10) / 10,
      daysListed: daysSinceCreation,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
