import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, logActivity, getClientIp } from '@/lib/admin-auth'

export async function GET() {
  try {
    await requireAdmin()

    const settings = await db.siteSetting.findMany({
      orderBy: { key: 'asc' },
    })

    const settingsMap: Record<string, string> = {}
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json({ settings: settingsMap })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()
    const ip = getClientIp(request)

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Settings object is required' }, { status: 400 })
    }

    const entries = Object.entries(body) as [string, string][]

    if (entries.length === 0) {
      return NextResponse.json({ error: 'No settings to update' }, { status: 400 })
    }

    // Upsert each setting
    await Promise.all(
      entries.map(([key, value]) =>
        db.siteSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    )

    await logActivity(
      admin.userId,
      'admin_update_settings',
      { updatedKeys: entries.map(([key]) => key), settings: body },
      ip
    )

    // Return updated settings
    const allSettings = await db.siteSetting.findMany({
      orderBy: { key: 'asc' },
    })

    const settingsMap: Record<string, string> = {}
    for (const setting of allSettings) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json({ settings: settingsMap, message: 'Settings updated successfully' })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin settings PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
