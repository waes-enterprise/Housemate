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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '30')
    const skip = (page - 1) * limit

    // Verify user is participant
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

    const [messages, total] = await Promise.all([
      db.message.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      db.message.count({ where: { conversationId: id } }),
    ])

    return NextResponse.json({
      messages: messages.reverse(),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { content, fileUrl, fileName, fileSize, fileType } = body

    // Must have either content or file
    if (!content && !fileUrl) {
      return NextResponse.json(
        { error: 'Message must have content or a file attachment' },
        { status: 400 }
      )
    }

    // Verify user is participant
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

    // Create message and update conversation
    const [message] = await db.$transaction([
      db.message.create({
        data: {
          conversationId: id,
          senderId: userId,
          content: content || null,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
          fileSize: fileSize || null,
          fileType: fileType || null,
        },
        include: {
          sender: { select: { id: true, name: true, avatarUrl: true } },
        },
      }),
      db.conversation.update({
        where: { id },
        data: { lastMessageAt: new Date() },
      }),
    ])

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
