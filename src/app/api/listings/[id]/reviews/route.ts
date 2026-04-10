import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { sendNewReviewNotification } from '@/lib/email'
import { sendPushToUser } from '@/lib/push-notifications'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if listing exists
    const listing = await db.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Fetch reviews with user info
    const reviews = await db.review.findMany({
      where: { listingId: id },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate aggregated stats
    const totalReviews = reviews.length
    const avgRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0

    // Distribution by stars
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    for (const r of reviews) {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1
    }

    return NextResponse.json({
      reviews,
      stats: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        distribution,
      },
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if listing exists
    const listing = await db.listing.findUnique({ where: { id } })
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Don't allow reviewing own listing
    if (listing.ownerId === payload.userId) {
      return NextResponse.json(
        { error: 'You cannot review your own listing' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { rating, comment } = body

    // Validate rating (1-5)
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      )
    }

    // Validate comment (min 5 chars)
    if (!comment || typeof comment !== 'string' || comment.trim().length < 5) {
      return NextResponse.json(
        { error: 'Comment must be at least 5 characters' },
        { status: 400 }
      )
    }

    // Check unique constraint (one review per user per listing)
    const existingReview = await db.review.findUnique({
      where: {
        listingId_userId: {
          listingId: id,
          userId: payload.userId,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this listing' },
        { status: 409 }
      )
    }

    // Create the review
    const review = await db.review.create({
      data: {
        listingId: id,
        userId: payload.userId,
        rating: Math.round(rating),
        comment: comment.trim(),
      },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    })

    // Notify listing owner about the new review
    if (listing.ownerId) {
      try {
        await db.notification.create({
          data: {
            userId: listing.ownerId,
            type: 'new_review',
            title: 'New review on your listing',
            message: `New review on your listing: ${listing.title}`,
            link: `/listings/${id}`,
          },
        })
      } catch {
        // Non-critical: don't fail the review creation
      }

      // Fire-and-forget email notification
      try {
        const owner = await db.user.findUnique({
          where: { id: listing.ownerId },
          select: { name: true, email: true },
        })
        if (owner && owner.email) {
          sendNewReviewNotification(owner.name, owner.email, listing.title, Math.round(rating))
        }
      } catch {
        // Non-critical
      }

      // Fire-and-forget push notification
      sendPushToUser(
        listing.ownerId,
        'New review on ' + listing.title,
        `Someone left a ${Math.round(rating)}-star review on your listing`,
        { url: `/listings/${id}` },
      ).catch(() => {})
    }

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
