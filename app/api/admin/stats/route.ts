import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Inicjalizacja Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Brak konfiguracji Supabase' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Spotkania dzisiaj
    const today = new Date().toISOString().split('T')[0]
    const { count: todayCount, error: todayError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', `${today}T00:00:00`)
      .lt('start_time', `${today}T23:59:59`)

    if (todayError) {
      console.error('Error fetching today meetings:', todayError)
    }

    // 2. Rezerwacje (ostatnie 30 dni)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    const { count: last30Count, error: last30Error } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .gte('start_time', `${thirtyDaysAgo}T00:00:00`)

    if (last30Error) {
      console.error('Error fetching last 30 days reservations:', last30Error)
    }

    // 3. Liczba typów spotkań
    const { count: meetingTypesCount, error: meetingTypesError } = await supabase
      .from('meeting_types')
      .select('*', { count: 'exact', head: true })

    if (meetingTypesError) {
      console.error('Error fetching meeting types count:', meetingTypesError)
    }

    return NextResponse.json({
      data: {
        todayMeetings: todayCount || 0,
        last30DaysReservations: last30Count || 0,
        meetingTypes: meetingTypesCount || 0,
      },
    })
  } catch (error) {
    console.error('Error in /api/admin/stats:', error)
    return NextResponse.json(
      { error: 'Błąd serwera przy pobieraniu statystyk' },
      { status: 500 }
    )
  }
}
