import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const listing = await db.listing.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const updated = await db.listing.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    })

    return NextResponse.json({ viewCount: updated.viewCount })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 })
  }
}
