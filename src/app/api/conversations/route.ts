import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { sendNewMessageNotification } from '@/lib/email'
import { sendPushToUser } from '@/lib/push-notifications'

async function getUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  return payload?.userId || null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: { select: { id: true, name: true, avatarUrl: true, isVerifiedAgent: true } },
        participant2: { select: { id: true, name: true, avatarUrl: true, isVerifiedAgent: true } },
        listing: { select: { id: true, title: true, imageUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
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
      orderBy: { lastMessageAt: 'desc' },
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { participantId, listingId } = body

    if (!participantId) {
      return NextResponse.json({ error: 'Missing participantId' }, { status: 400 })
    }

    if (participantId === userId) {
      return NextResponse.json({ error: 'Cannot create conversation with yourself' }, { status: 400 })
    }

    // Check if conversation already exists between these two users
    const existing = await db.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: userId,
            participant2Id: participantId,
          },
          {
            participant1Id: participantId,
            participant2Id: userId,
          },
        ],
        ...(listingId ? { listingId } : {}),
      },
      include: {
        participant1: { select: { id: true, name: true, avatarUrl: true, isVerifiedAgent: true } },
        participant2: { select: { id: true, name: true, avatarUrl: true, isVerifiedAgent: true } },
        listing: { select: { id: true, title: true, imageUrl: true } },
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

    if (existing) {
      return NextResponse.json(existing)
    }

    // Fetch listing info for notification
    let listingTitle: string | null = null
    let listingOwnerId: string | null = null
    if (listingId) {
      const listing = await db.listing.findUnique({
        where: { id: listingId },
        select: { title: true, ownerId: true },
      })
      if (listing) {
        listingTitle = listing.title
        listingOwnerId = listing.ownerId
      }
    }

    // Create new conversation
    const conversation = await db.conversation.create({
      data: {
        participant1Id: userId,
        participant2Id: participantId,
        listingId: listingId || null,
      },
      include: {
        participant1: { select: { id: true, name: true, avatarUrl: true, isVerifiedAgent: true } },
        participant2: { select: { id: true, name: true, avatarUrl: true, isVerifiedAgent: true } },
        listing: { select: { id: true, title: true, imageUrl: true } },
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

    // Increment inquiry count for the listing
    if (listingId) {
      try {
        await db.listing.update({
          where: { id: listingId },
          data: { inquiryCount: { increment: 1 } },
        })
      } catch {
        // Non-critical: don't fail the conversation creation
      }
    }

    // Notify the other participant about the new conversation
    const notifyUserId = participantId
    if (notifyUserId) {
      try {
        await db.notification.create({
          data: {
            userId: notifyUserId,
            type: 'new_message',
            title: 'New conversation started',
            message: listingTitle
              ? `Someone started a conversation about your listing: ${listingTitle}`
              : 'Someone started a conversation with you',
            link: '/inbox',
          },
        })
      } catch {
        // Non-critical: don't fail the conversation creation
      }

      // Fire-and-forget email notification
      try {
        const sender = await db.user.findUnique({ where: { id: userId }, select: { name: true } })
        const recipient = await db.user.findUnique({ where: { id: notifyUserId }, select: { name: true, email: true } })
        if (sender && recipient && recipient.email) {
          sendNewMessageNotification(
            recipient.name,
            recipient.email,
            sender.name,
            listingTitle || 'General Inquiry',
          )
        }
      } catch {
        // Non-critical
      }

      // Fire-and-forget push notification
      const sender2 = await db.user.findUnique({ where: { id: userId }, select: { name: true } })
      sendPushToUser(
        notifyUserId,
        'New message from ' + (sender2?.name || 'Someone'),
        listingTitle
          ? `${sender2?.name || 'Someone'} started a conversation about: ${listingTitle}`
          : `${sender2?.name || 'Someone'} started a conversation with you`,
        { url: '/inbox' },
      ).catch(() => {})
    }

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
