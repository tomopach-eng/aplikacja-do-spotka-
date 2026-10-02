import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// GET all bookings for admin
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = supabase
      .from('bookings')
      .select('id, meeting_type_id, participant_name, participant_email, start_time, end_time, status, created_at, meeting_types(name)')
      .order('start_time', { ascending: false })

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    // Filter by search term if provided
    let filteredData: any[] = data || []
    if (search) {
      const searchLower = search.toLowerCase()
      filteredData = filteredData.filter(booking =>
        booking.participant_name.toLowerCase().includes(searchLower) ||
        booking.participant_email.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({ data: filteredData })
  } catch (error: any) {
    console.error('❌ Error fetching bookings:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
