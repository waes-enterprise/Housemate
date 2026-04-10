import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params

  // Authenticate
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Verify user is participant
  const conversation = await db.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [
        { participant1Id: payload.userId },
        { participant2Id: payload.userId },
      ],
    },
  })

  if (!conversation) {
    return new Response('Not found', { status: 404 })
  }

  const encoder = new TextEncoder()
  let lastChecked = new Date()
  let intervalId: ReturnType<typeof setInterval> | null = null
  let isAlive = true

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', conversationId })}\n\n`))

      // Poll for new messages every 2 seconds
      intervalId = setInterval(async () => {
        if (!isAlive) return

        try {
          const newMessages = await db.message.findMany({
            where: {
              conversationId,
              createdAt: { gt: lastChecked },
            },
            include: {
              sender: {
                select: { id: true, name: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          })

          if (newMessages.length > 0) {
            lastChecked = new Date()
            for (const msg of newMessages) {
              const data = JSON.stringify({ type: 'new_message', message: msg })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Send heartbeat every 15 seconds
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch {
          // DB error, keep stream alive
        }
      }, 2000)

      // Clean up on abort
      request.signal.addEventListener('abort', () => {
        isAlive = false
        if (intervalId) clearInterval(intervalId)
        controller.close()
      })
    },
    cancel() {
      isAlive = false
      if (intervalId) clearInterval(intervalId)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
