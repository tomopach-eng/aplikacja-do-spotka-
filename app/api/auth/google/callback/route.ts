import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getTokensFromCode } from '@/lib/google-calendar'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const code = request.nextUrl.searchParams.get('code')
    const error = request.nextUrl.searchParams.get('error')

    console.log('OAuth Callback - Params:', {
      code: code ? 'present' : 'MISSING',
      error,
      fullUrl: request.nextUrl.toString(),
    })

    if (error) {
      return NextResponse.redirect(
        new URL(`/admin?google=error&error=${error}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin?google=error&reason=no_code', request.url)
      )
    }

    const tokens = await getTokensFromCode(code)

    const { error: insertError } = await supabase
      .from('google_calendar_tokens')
      .upsert(
        {
          user_id: 'tomek',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (insertError) throw insertError

    return NextResponse.redirect(new URL('/admin?google=success', request.url))
  } catch (error: any) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL(`/admin?google=error&reason=${error.message}`, request.url)
    )
  }
}