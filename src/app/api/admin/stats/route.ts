import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET() {
  try {
    await requireAdmin()

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [
      totalUsers,
      totalListings,
      activeListings,
      pendingListings,
      totalCategories,
      totalFavorites,
      recentSignups,
      recentListings,
      listingsByCategory,
      listingsByTier,
      listingsByLocation,
      recentActivity,
    ] = await Promise.all([
      db.user.count(),
      db.listing.count(),
      db.listing.count({ where: { status: 'active' } }),
      db.listing.count({ where: { status: 'pending' } }),
      db.category.count(),
      db.favorite.count(),
      db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      db.listing.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      db.listing.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
      }),
      db.listing.groupBy({
        by: ['tier'],
        _count: { tier: true },
      }),
      db.listing.groupBy({
        by: ['location'],
        _count: { location: true },
        orderBy: { _count: { location: 'desc' } },
        take: 10,
      }),
      db.activityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
    ])

    return NextResponse.json({
      totalUsers,
      totalListings,
      activeListings,
      pendingListings,
      totalCategories,
      totalFavorites,
      recentSignups,
      recentListings,
      listingsByCategory: listingsByCategory.map((item) => ({
        category: item.category,
        count: item._count.category,
      })),
      listingsByTier: listingsByTier.map((item) => ({
        tier: item.tier,
        count: item._count.tier,
      })),
      listingsByLocation: listingsByLocation.map((item) => ({
        location: item.location,
        count: item._count.location,
      })),
      recentActivity,
    })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
