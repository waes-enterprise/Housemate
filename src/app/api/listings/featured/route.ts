import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const listings = await db.listing.findMany({
      where: {
        tier: { in: ['premium', 'featured', 'spotlight'] },
      },
      orderBy: [{ createdAt: 'desc' }],
    })

    return NextResponse.json(listings)
  } catch (error) {
    console.error('Error fetching featured listings:', error)
    return NextResponse.json({ error: 'Failed to fetch featured listings' }, { status: 500 })
  }
}
