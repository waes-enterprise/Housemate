import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    googleEnabled: !!(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here'
    ),
  })
}
