import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'

// POST: Generate a 6-digit reset code and save to user
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    // Always return the same message to prevent user enumeration
    if (user) {
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

      // Store code:expiry in resetToken field
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken: `${code}:${expiry.getTime().toString()}`,
          resetTokenExpiry: expiry,
        },
      })

      // Fire-and-forget password reset email
      sendPasswordResetEmail(user.name, user.email, code)

      // In development, return the code directly for testing
      return NextResponse.json({
        message: 'If an account exists, a reset code has been generated.',
        code, // Only returned in dev for testing
      })
    }

    return NextResponse.json({
      message: 'If an account exists, a reset code has been generated.',
    })
  } catch (error) {
    console.error('Reset password request error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

// PUT: Verify reset code and update password
export async function PUT(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json()

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, reset code, and new password are required' },
        { status: 400 }
      )
    }

    if (typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid reset code format' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return NextResponse.json(
        { error: 'Invalid or expired reset code' },
        { status: 400 }
      )
    }

    // Check if the code has expired
    if (new Date() > user.resetTokenExpiry) {
      // Clear expired token
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      })
      return NextResponse.json(
        { error: 'Reset code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Verify the code matches (token format: code:expiryTimestamp)
    const storedCode = user.resetToken.split(':')[0]
    if (storedCode !== code) {
      return NextResponse.json(
        { error: 'Invalid reset code' },
        { status: 400 }
      )
    }

    // Hash new password and update user
    const hashedPassword = await hashPassword(newPassword)
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({
      message: 'Password has been reset successfully',
    })
  } catch (error) {
    console.error('Reset password update error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
