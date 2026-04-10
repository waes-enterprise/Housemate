import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.userId || null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params

    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        participant1: { select: { id: true, name: true, avatarUrl: true } },
        participant2: { select: { id: true, name: true, avatarUrl: true } },
        listing: { select: { id: true, title: true, imageUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                isRead: false,
              },
            },
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Check user is a participant
    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId
    ) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // Reverse messages so they're in chronological order
    return NextResponse.json({
      ...conversation,
      messages: conversation.messages.reverse(),
    })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params

    const conversation = await db.conversation.findUnique({
      where: { id },
      select: { participant1Id: true, participant2Id: true },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId
    ) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    await db.conversation.delete({ where: { id } })

    return NextResponse.json({ message: 'Conversation deleted' })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 })
  }
}
