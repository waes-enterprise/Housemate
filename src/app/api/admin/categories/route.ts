import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, logActivity, getClientIp } from '@/lib/admin-auth'

export async function GET() {
  try {
    await requireAdmin()

    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { listings: true },
        },
      },
    })

    return NextResponse.json({ categories })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin categories GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()
    const body = await request.json()
    const ip = getClientIp(request)

    const { name, slug, icon, sortOrder, isActive } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    // Check uniqueness
    const existingName = await db.category.findUnique({ where: { name } })
    if (existingName) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
    }

    const existingSlug = await db.category.findUnique({ where: { slug } })
    if (existingSlug) {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 409 })
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        icon: icon || 'Building2',
        sortOrder: sortOrder !== undefined ? sortOrder : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        _count: {
          select: { listings: true },
        },
      },
    })

    await logActivity(
      admin.userId,
      'admin_create_category',
      { categoryId: category.id, name: category.name, slug: category.slug },
      ip
    )

    return NextResponse.json({ category }, { status: 201 })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin categories POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
