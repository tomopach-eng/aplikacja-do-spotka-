import { getAuthUrl } from '@/lib/google-calendar'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const authUrl = await getAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error: any) {
    console.error('Auth URL error:', error)
    return NextResponse.redirect(
      new URL(`/admin?google=error&reason=${error.message}`, 'http://localhost:3000')
    )
  }
}