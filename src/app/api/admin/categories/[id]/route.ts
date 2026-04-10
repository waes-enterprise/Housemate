import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin, logActivity, getClientIp } from '@/lib/admin-auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const body = await request.json()
    const ip = getClientIp(request)

    const existing = await db.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const { name, slug, icon, sortOrder, isActive } = body

    // Check uniqueness if changing name/slug
    if (name && name !== existing.name) {
      const nameExists = await db.category.findUnique({ where: { name } })
      if (nameExists) {
        return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
      }
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await db.category.findUnique({ where: { slug } })
      if (slugExists) {
        return NextResponse.json({ error: 'Category slug already exists' }, { status: 409 })
      }
    }

    const category = await db.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        _count: {
          select: { listings: true },
        },
      },
    })

    await logActivity(
      admin.userId,
      'admin_update_category',
      { categoryId: id, name: category.name, changes: body },
      ip
    )

    return NextResponse.json({ category })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin category PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin()
    const { id } = await params
    const ip = getClientIp(request)

    const existing = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { listings: true } } },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (existing._count.listings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with linked listings. Remove or reassign listings first.' },
        { status: 409 }
      )
    }

    await db.category.delete({ where: { id } })

    await logActivity(
      admin.userId,
      'admin_delete_category',
      { categoryId: id, name: existing.name },
      ip
    )

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error: any) {
    if (error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Admin category DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
