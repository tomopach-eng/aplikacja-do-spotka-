import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Supabase URL:', supabaseUrl)
console.log('🔍 Service Key exists:', !!supabaseServiceKey)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!')
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

// GET all meeting types
export async function GET(request: NextRequest) {
  try {
    console.log('📍 GET /api/admin/meetings - starting')
    const { data, error } = await supabase
      .from('meeting_types')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('📊 Response:', { data, error })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('❌ GET Error:', error.message)
    return NextResponse.json(
      { error: error.message },
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

    const { data, error } = await supabase
      .from('meeting_types')
      .insert([
        {
          name,
          description: description || null,
          duration_minutes,
          buffer_minutes: buffer_minutes || 15,
          max_bookings_per_day: max_bookings_per_day || null,
          is_active: is_active !== false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    console.log('📊 Response:', { data, error })

    if (error) throw error

    return NextResponse.json({ data: data[0] }, { status: 201 })
  } catch (error: any) {
    console.error('❌ POST Error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}