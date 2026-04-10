import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const listing = await db.listing.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true, avatarUrl: true, isVerifiedAgent: true, agentCompany: true, agentBio: true, agentSpecialties: true } },
        _count: { select: { favorites: true } },
      },
    })
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    return NextResponse.json(listing)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
  }
}
