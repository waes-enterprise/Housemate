import { z } from 'zod/v4'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Please provide a valid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const result = contactSchema.safeParse(body)
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const { name, email, subject, message } = result.data

    // Get client IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Store in database
    await db.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        ipAddress: ip,
      },
    })

    // Also log to console for redundancy
    console.log('[Contact Form Submission]', {
      name,
      email,
      subject,
      message,
      ip,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your message. We will get back to you soon.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
