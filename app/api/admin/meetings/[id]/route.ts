import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function formatSupabaseUrl(url: string | undefined): string {
  if (!url) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

// GET single meeting type
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const baseUrl = formatSupabaseUrl(supabaseUrl)
    const restUrl = `${baseUrl}/rest/v1/meeting_types?id=eq.${id}`

    const response = await fetch(restUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Supabase API error: ${response.status}`)
    }

    const data = await response.json()
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Meeting type not found' }, { status: 404 })
    }

    return NextResponse.json({ data: data[0] })
  } catch (error: any) {
    console.error('❌ GET Error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// PUT update meeting type
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

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
      throw new Error('Missing Supabase configuration')
    }

    const baseUrl = formatSupabaseUrl(supabaseUrl)
    const restUrl = `${baseUrl}/rest/v1/meeting_types?id=eq.${id}`

    const updateData = {
      name,
      description: description || null,
      duration_minutes,
      buffer_minutes: buffer_minutes || 15,
      max_bookings_per_day: max_bookings_per_day || null,
      is_active: is_active !== false,
    }

    const response = await fetch(restUrl, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Supabase API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ data: data[0] }, { status: 200 })
  } catch (error: any) {
    console.error('❌ PUT Error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// DELETE meeting type
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const baseUrl = formatSupabaseUrl(supabaseUrl)
    const restUrl = `${baseUrl}/rest/v1/meeting_types?id=eq.${id}`

    const response = await fetch(restUrl, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Supabase API error: ${response.status}`)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('❌ DELETE Error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
