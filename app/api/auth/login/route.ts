import { NextRequest, NextResponse } from 'next/server'
import { signInAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email i hasło są wymagane' },
        { status: 400 }
      )
    }

    const result = await signInAdmin(email, password)

    if (!result.success || !result.token) {
      return NextResponse.json(
        { error: result.error || 'Logowanie nie powiodło się' },
        { status: 401 }
      )
    }

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Zalogowano pomyślnie',
    })

    // Set secure HTTP-only cookie
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    )
  }
}
