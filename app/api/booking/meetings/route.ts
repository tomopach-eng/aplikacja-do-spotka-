import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Ensure URL has https:// protocol
function formatSupabaseUrl(url: string | undefined): string {
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

// GET all active meeting types for public booking
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching meeting types via REST API...')
    console.log('Raw URL:', supabaseUrl)
    console.log('Service Key exists:', !!supabaseServiceKey)

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const baseUrl = formatSupabaseUrl(supabaseUrl)
    console.log('Formatted URL:', baseUrl)

    const restUrl = `${baseUrl}/rest/v1/meeting_types?is_active=eq.true&order=created_at.desc&select=id,name,description,duration_minutes,buffer_minutes,max_bookings_per_day,is_active`

    console.log('📍 REST URL (redacted):', restUrl.replace(supabaseUrl, '[URL]'))

    const response = await fetch(restUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📊 Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ REST API Error:', response.status, errorText)
      throw new Error(`Supabase API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Successfully fetched meeting types:', data?.length || 0)
    return NextResponse.json({ data: data || [] })
  } catch (error: any) {
    console.error('❌ API Error:', error.message)
    console.error('Error type:', error.constructor.name)
    console.error('Full error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meeting types' },
      { status: 500 }
    )
  }
}