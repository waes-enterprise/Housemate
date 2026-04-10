import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

// Simple in-memory rate limiting store for Edge runtime
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10

const RATE_LIMITED_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/reset-password',
]

// Contact form rate limit: 5 per hour
const CONTACT_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const CONTACT_RATE_LIMIT_MAX_REQUESTS = 5

function isRateLimited(pathname: string): boolean {
  return RATE_LIMITED_PATHS.some((p) => pathname.startsWith(p))
}

function isContactRoute(pathname: string): boolean {
  return pathname === '/api/contact'
}

function checkRateLimit(
  ip: string,
  windowMs: number = RATE_LIMIT_WINDOW_MS,
  maxRequests: number = RATE_LIMIT_MAX_REQUESTS
): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return false
  }

  entry.count++
  return entry.count > maxRequests
}

// Security headers applied to every response
function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    'X-XSS-Protection': '1; mode=block',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https: https://maps.wikimedia.org https://tile.openstreetmap.org https://basemaps.cartocdn.com data: blob:",
      "connect-src 'self' https:",
      "frame-src 'self' https:",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
    'Access-Control-Allow-Origin': 'https://housemate.zm',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle CORS preflight for API routes
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    const response = new NextResponse(null, { status: 204 })
    const headers = getSecurityHeaders()
    for (const [key, value] of Object.entries(headers)) {
      if (key.startsWith('Access-Control-')) {
        response.headers.set(key, value)
      }
    }
    return response
  }

  // Rate limiting for auth endpoints
  if (isRateLimited(pathname)) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  // Rate limiting for contact form
  if (isContactRoute(pathname) && request.method === 'POST') {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (checkRateLimit(ip, CONTACT_RATE_LIMIT_WINDOW_MS, CONTACT_RATE_LIMIT_MAX_REQUESTS)) {
      return NextResponse.json(
        { error: 'Too many contact form submissions. Please try again later.' },
        { status: 429 }
      )
    }
  }

  // Admin route protection
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const payload = await verifyToken(token)

    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next()
  const securityHeaders = getSecurityHeaders()
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|listings/|icons/|logo.svg|sw.js|manifest.json).*)',
  ],
}
