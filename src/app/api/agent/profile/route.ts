import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'

const AGENT_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
  isVerifiedAgent: true,
  agentBio: true,
  agentCompany: true,
  agentLicense: true,
  agentSpecialties: true,
} as const

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: AGENT_SELECT,
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Agent profile fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch agent profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { bio, company, license, specialties } = body

    const updateData: Record<string, string | null> = {}
    if (bio !== undefined) updateData.agentBio = bio.trim() || null
    if (company !== undefined) updateData.agentCompany = company.trim() || null
    if (license !== undefined) updateData.agentLicense = license?.trim() || null
    if (specialties !== undefined) {
      updateData.agentSpecialties = Array.isArray(specialties) ? JSON.stringify(specialties) : '[]'
    }

    const user = await db.user.update({
      where: { id: payload.userId },
      data: updateData,
      select: AGENT_SELECT,
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Agent profile update error:', error)
    return NextResponse.json({ error: 'Failed to update agent profile' }, { status: 500 })
  }
}
