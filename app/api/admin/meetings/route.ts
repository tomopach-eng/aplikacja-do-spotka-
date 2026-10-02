import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Ensure URL has https:// protocol
function formatSupabaseUrl(url: string | undefined): string {
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

console.log('🔍 API Init - URL exists:', !!supabaseUrl, 'Service Key exists:', !!supabaseServiceKey)

// GET all meeting types
export async function GET(request: NextRequest) {
  try {
    console.log('📍 GET /api/admin/meetings - starting')
    console.log('Config check - URL:', !!supabaseUrl, 'Key:', !!supabaseServiceKey)

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase config')
      throw new Error('Missing Supabase configuration')
    }

    const baseUrl = formatSupabaseUrl(supabaseUrl)
    const restUrl = `${baseUrl}/rest/v1/meeting_types?select=*&order=created_at.desc`

    console.log('API URL (redacted):', restUrl.replace(supabaseUrl, '[URL]'))
    console.log('Service Key first 10 chars:', supabaseServiceKey.substring(0, 10))

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
      throw new Error(`Supabase API error: ${response.status} - ${errorText.substring(0, 200)}`)
    }

    const data = await response.json()
    console.log('✅ Fetched:', data?.length || 0, 'meeting types')
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('❌ GET Error:', error.message)
    console.error('Stack:', error.stack)
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}

// POST create new meeting type
export async function POST(request: NextRequest) {
  try {
    console.log('📍 POST /api/admin/meetings - starting')
    const body = await request.json()
    console.log('📤 Body:', body)

    const {
      name,
      description,
      duration_minutes,
      buffer_minutes,
      max_bookings_per_day,
      is_active,
    } = body

    if (!name || !duration_minutes) {
      return NextResponse.json(
        { error: 'Name and duration are required' },
        { status: 400 }
      )
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing config - URL:', !!supabaseUrl, 'Key:', !!supabaseServiceKey)
      throw new Error('Missing Supabase configuration')
    }

    const baseUrl = formatSupabaseUrl(supabaseUrl)
    const restUrl = `${baseUrl}/rest/v1/meeting_types?select=*`
    const insertData = {
      name,
      description: description || null,
      duration_minutes,
      buffer_minutes: buffer_minutes || 15,
      max_bookings_per_day: max_bookings_per_day || null,
      is_active: is_active !== false,
      created_at: new Date().toISOString(),
    }

    console.log('API URL (redacted):', restUrl.replace(supabaseUrl, '[URL]'))
    console.log('Service Key first 10 chars:', supabaseServiceKey.substring(0, 10))

    const response = await fetch(restUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(insertData),
    })

    console.log('📊 Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ REST API Error:', response.status, errorText)
      throw new Error(`Supabase API error: ${response.status} - ${errorText.substring(0, 200)}`)
    }

    const data = await response.json()
    console.log('✅ Created meeting type:', data?.[0]?.id)
    return NextResponse.json({ data: data[0] }, { status: 201 })
  } catch (error: any) {
    console.error('❌ POST Error:', error.message)
    console.error('Stack:', error.stack)
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}