import { cookies } from 'next/headers'
import { verifyToken, JWTPayload } from '@/lib/auth'
import { db } from './db'

export async function getAdminFromRequest(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload || payload.role !== 'admin') return null
  return payload
}

export async function requireAdmin(): Promise<JWTPayload> {
  const admin = await getAdminFromRequest()
  if (!admin) {
    const error = new Error('Unauthorized')
    ;(error as any).status = 401
    throw error
  }
  return admin
}

export async function logActivity(
  userId: string | null,
  action: string,
  details?: Record<string, unknown>,
  ipAddress?: string
) {
  try {
    await db.activityLog.create({
      data: {
        userId,
        action,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
      },
    })
  } catch (e) {
    console.error('Failed to log activity:', e)
  }
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}
