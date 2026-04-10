import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { bio, company, license, specialties } = body

    if (!bio || bio.trim().length < 10) {
      return NextResponse.json({ error: 'Bio must be at least 10 characters' }, { status: 400 })
    }

    if (!company || company.trim().length < 2) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }

    const specialtiesStr = Array.isArray(specialties) ? JSON.stringify(specialties) : '[]'

    const user = await db.user.update({
      where: { id: payload.userId },
      data: {
        isVerifiedAgent: true,
        agentBio: bio.trim(),
        agentCompany: company.trim(),
        agentLicense: license?.trim() || null,
        agentSpecialties: specialtiesStr,
      },
      select: {
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
      },
    })

    return NextResponse.json({ user, message: 'Successfully verified as an agent!' })
  } catch (error) {
    console.error('Agent verification error:', error)
    return NextResponse.json({ error: 'Failed to verify agent' }, { status: 500 })
  }
}
