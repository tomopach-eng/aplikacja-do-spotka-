import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  // Only protect /admin routes (except /admin/login)
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Check for auth token
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // Redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verify token with Supabase
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token)

      if (error || !user) {
        // Token is invalid or expired
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.set('auth-token', '', { maxAge: 0 })
        return response
      }

      // Check if user is in admins table
      const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const response = await fetch(
        `${adminUrl}/rest/v1/admins?id=eq.${user.id}&select=id`,
        {
          method: 'GET',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // Token is valid, proceed
      return NextResponse.next()
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // If trying to access /admin/login but already authenticated, redirect to /admin
  if (pathname === '/admin/login') {
    const token = request.cookies.get('auth-token')?.value
    if (token) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
