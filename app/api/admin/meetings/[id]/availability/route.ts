import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// GET all availability for a meeting type
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('meeting_availability')
      .select('*')
      .eq('meeting_type_id', params.id)
      .order('day_of_week', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST - Create or update availability (bulk)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { availability } = body // array of availability items

    if (!availability || !Array.isArray(availability)) {
      return NextResponse.json(
        { error: 'Availability array is required' },
        { status: 400 }
      )
    }

    // Delete existing availability for this meeting type
    await supabase
      .from('meeting_availability')
      .delete()
      .eq('meeting_type_id', params.id)

    // Insert new availability
    const availabilityData = availability.map((item: any) => ({
      meeting_type_id: params.id,
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      is_available: item.is_available,
    }))

    const { data, error } = await supabase
      .from('meeting_availability')
      .insert(availabilityData)
      .select()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}