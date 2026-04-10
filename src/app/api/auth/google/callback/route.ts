import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { hashPassword, createToken } from '@/lib/auth'

interface GoogleTokenResponse {
  access_token: string
  id_token?: string
  token_type: string
  expires_in: number
  refresh_token?: string
}

interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name: string
  family_name: string
  picture: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/signin?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/signin?error=no_code', request.url)
    )
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('[Google OAuth] Missing environment variables')
    return NextResponse.redirect(
      new URL('/auth/signin?error=oauth_not_configured', request.url)
    )
  }

  try {
    // Step 1: Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('[Google OAuth] Token exchange failed:', errorData)
      return NextResponse.redirect(
        new URL('/auth/signin?error=token_exchange_failed', request.url)
      )
    }

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse

    // Step 2: Get user info from Google
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    )

    if (!userInfoResponse.ok) {
      console.error('[Google OAuth] Failed to fetch user info')
      return NextResponse.redirect(
        new URL('/auth/signin?error=user_info_failed', request.url)
      )
    }

    const googleUser = (await userInfoResponse.json()) as GoogleUserInfo

    if (!googleUser.email) {
      console.error('[Google OAuth] No email in Google user info')
      return NextResponse.redirect(
        new URL('/auth/signin?error=no_email', request.url)
      )
    }

    // Step 3: Find or create user
    let user = await db.user.findUnique({
      where: { googleId: googleUser.id },
    })

    if (!user) {
      // Check if user exists with this email (account linking)
      const existingUser = await db.user.findUnique({
        where: { email: googleUser.email.toLowerCase() },
      })

      if (existingUser) {
        // Link Google account to existing email user
        user = await db.user.update({
          where: { id: existingUser.id },
          data: {
            googleId: googleUser.id,
            authProvider: existingUser.authProvider, // keep existing provider
            avatarUrl: existingUser.avatarUrl || googleUser.picture || null,
          },
        })
      } else {
        // Create new user from Google profile
        const randomPassword = randomBytes(32).toString('hex')
        const hashedPassword = await hashPassword(randomPassword)

        user = await db.user.create({
          data: {
            name: googleUser.name || `${googleUser.given_name || ''} ${googleUser.family_name || ''}`.trim() || 'Google User',
            email: googleUser.email.toLowerCase(),
            password: hashedPassword,
            googleId: googleUser.id,
            authProvider: 'google',
            avatarUrl: googleUser.picture || null,
          },
        })
      }
    }

    if (!user) {
      console.error('[Google OAuth] Failed to create/retrieve user')
      return NextResponse.redirect(
        new URL('/auth/signin?error=user_creation_failed', request.url)
      )
    }

    // Step 4: Create JWT token and set cookie
    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })

    // Redirect to homepage with cookie set
    const response = NextResponse.redirect(new URL('/', request.url))

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('[Google OAuth] Unexpected error:', err)
    return NextResponse.redirect(
      new URL('/auth/signin?error=internal_error', request.url)
    )
  }
}
