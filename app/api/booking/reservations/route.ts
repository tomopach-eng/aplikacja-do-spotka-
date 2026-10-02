import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getCalendarEvents, createCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar'
import { sendBookingConfirmation, sendBookingNotification, ADMIN_EMAIL } from '@/lib/email'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TimeSlot {
  time: string
  datetime: string
}

interface Booking {
  start_time: string
}

interface CalendarEvent {
  start?: { dateTime?: string }
  end?: { dateTime?: string }
}

// Helper function to generate available time slots
function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  bufferMinutes: number,
  date: string,
  bookings: Booking[],
  calendarEvents: CalendarEvent[] = []
): TimeSlot[] {
  const slots: TimeSlot[] = []
  const totalDurationMinutes = durationMinutes + bufferMinutes

  // Parse times
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  const startTotalMin = startHour * 60 + startMin
  const endTotalMin = endHour * 60 + endMin

  // Create booked slots from existing bookings
  const bookedSlots = bookings.map(b => {
    const dateTime = new Date(b.start_time)
    return {
      start: dateTime.getHours() * 60 + dateTime.getMinutes(),
      duration: durationMinutes,
    }
  })

  // Create booked slots from Google Calendar events
  const googleBookedSlots = calendarEvents
    .filter(event => event.start?.dateTime && event.end?.dateTime)
    .map(event => {
      const startDateTime = new Date(event.start!.dateTime!)
      const endDateTime = new Date(event.end!.dateTime!)
      return {
        start: startDateTime.getHours() * 60 + startDateTime.getMinutes(),
        duration: Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)),
      }
    })

  const allBookedSlots = [...bookedSlots, ...googleBookedSlots]

  // Generate available slots
  let currentMin = startTotalMin
  while (currentMin + durationMinutes <= endTotalMin) {
    const slotEnd = currentMin + durationMinutes

    // Check if this slot conflicts with any bookings
    const isBooked = allBookedSlots.some(b => {
      const bookingEnd = b.start + b.duration
      // Check overlap: slot starts before booking ends and slot ends after booking starts
      return currentMin < bookingEnd && slotEnd > b.start
    })

    if (!isBooked) {
      const slotHour = Math.floor(currentMin / 60)
      const slotMinute = currentMin % 60
      const time = `${String(slotHour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')}`
      const datetime = `${date}T${time}:00`

      slots.push({ time, datetime })
    }

    currentMin += totalDurationMinutes
  }

  return slots
}

// GET available time slots for a meeting type on a specific date
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const meetingTypeId = searchParams.get('meetingTypeId')
    const date = searchParams.get('date')

    if (!meetingTypeId || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters: meetingTypeId, date' },
        { status: 400 }
      )
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Validate that the date is not in the past and is at least tomorrow
    const requestedDate = new Date(date + 'T00:00:00Z')
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    if (requestedDate < today) {
      return NextResponse.json(
        { error: 'Cannot book appointments in the past' },
        { status: 400 }
      )
    }

    const tomorrow = new Date(today)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

    if (requestedDate.getTime() === today.getTime()) {
      return NextResponse.json(
        { error: 'Appointments can only be booked starting tomorrow' },
        { status: 400 }
      )
    }

    // Get meeting type
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_types')
      .select('duration_minutes, buffer_minutes')
      .eq('id', meetingTypeId)
      .single()

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: 'Meeting type not found' },
        { status: 404 }
      )
    }

    // Get day of week (0 = Sunday, need 0 = Monday)
    const dateObj = new Date(date + 'T00:00:00Z')
    const dayOfWeek = (dateObj.getUTCDay() + 6) % 7 // Convert to 0 = Monday

    // Get availability for this day of week
    const { data: availability, error: availError } = await supabase
      .from('meeting_availability')
      .select('start_time, end_time, is_available')
      .eq('meeting_type_id', meetingTypeId)
      .eq('day_of_week', dayOfWeek)
      .single()

    if (availError || !availability || !availability.is_available) {
      return NextResponse.json(
        { data: { slots: [] } },
        { status: 200 }
      )
    }

    // Get existing bookings for this date
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('start_time')
      .eq('meeting_type_id', meetingTypeId)
      .gte('start_time', date + 'T00:00:00Z')
      .lt('start_time', new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString())
      .eq('status', 'pending')

    if (bookingError) throw bookingError

    // Get Google Calendar events for this date
    let calendarEvents: CalendarEvent[] = []
    try {
      const { data: tokenData } = await supabase
        .from('google_calendar_tokens')
        .select('access_token')
        .eq('user_id', 'tomek')
        .single()

      if (tokenData?.access_token) {
        const timeMin = new Date(date + 'T00:00:00Z').toISOString()
        const timeMax = new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000).toISOString()
        calendarEvents = await getCalendarEvents(tokenData.access_token, timeMin, timeMax)
      }
    } catch (googleError) {
      console.log('Could not fetch Google Calendar events:', googleError)
      // Continue without calendar events if retrieval fails
    }

    // Generate available slots
    const slots = generateTimeSlots(
      availability.start_time,
      availability.end_time,
      meeting.duration_minutes,
      meeting.buffer_minutes,
      date,
      bookings || [],
      calendarEvents
    )

    return NextResponse.json({ data: { slots } })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      meeting_type_id,
      customer_name,
      customer_email,
      scheduled_at,
      notes,
    } = body

    // Validation
    if (!meeting_type_id || !customer_name || !customer_email || !scheduled_at) {
      return NextResponse.json(
        { error: 'Missing required fields: meeting_type_id, customer_name, customer_email, scheduled_at' },
        { status: 400 }
      )
    }

    // Validate that the scheduled time is not in the past and is at least tomorrow
    const scheduledDateTime = new Date(scheduled_at)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    tomorrow.setUTCHours(0, 0, 0, 0)

    if (scheduledDateTime < tomorrow) {
      return NextResponse.json(
        { error: 'Cannot book appointments in the past or for today' },
        { status: 400 }
      )
    }

    // Verify meeting type exists
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_types')
      .select('id, name, duration_minutes')
      .eq('id', meeting_type_id)
      .single()

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: 'Meeting type not found' },
        { status: 404 }
      )
    }

    // Check if slot is available (no conflicting booking)
    const scheduledDate = new Date(scheduled_at)
    const endTimeDate = new Date(scheduledDate.getTime() + meeting.duration_minutes * 60 * 1000)

    const { data: conflictingBookings, error: conflictError } = await supabase
      .from('bookings')
      .select('id')
      .eq('meeting_type_id', meeting_type_id)
      .gte('start_time', scheduled_at)
      .lt('start_time', endTimeDate.toISOString())
      .eq('status', 'pending')

    if (conflictError) throw conflictError

    if (conflictingBookings && conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      )
    }

    // Calculate end_time based on duration
    const startTimeDate = new Date(scheduled_at)
    const endTimeForBooking = new Date(startTimeDate.getTime() + meeting.duration_minutes * 60 * 1000)

    // Create booking in database
    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          meeting_type_id,
          participant_name: customer_name.trim(),
          participant_email: customer_email.trim(),
          start_time: scheduled_at,
          end_time: endTimeForBooking.toISOString(),
          status: 'pending',
          user_id: null,
        },
      ])
      .select()

    if (error) throw error

    // Try to add event to Google Calendar
    let calendarEventId: string | null = null
    try {
      const { data: tokenData } = await supabase
        .from('google_calendar_tokens')
        .select('access_token')
        .eq('user_id', 'tomek')
        .single()

      if (tokenData?.access_token) {
        const eventResult = await createCalendarEvent(tokenData.access_token, {
          summary: `${meeting.name} - ${customer_name}`,
          description: `Rezerwacja: ${customer_name}\nEmail: ${customer_email}\nUwagi: ${notes || 'brak'}`,
          startTime: scheduled_at,
          endTime: endTimeForBooking.toISOString(),
          attendeeEmail: customer_email,
        })
        calendarEventId = eventResult.id
      }
    } catch (googleError) {
      console.log('Could not create Google Calendar event:', googleError)
      // Booking is created in DB even if calendar event fails
    }

    // Send confirmation emails
    try {
      await sendBookingConfirmation({
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim(),
        meeting_name: meeting.name,
        scheduled_at,
        duration_minutes: meeting.duration_minutes,
        notes,
      })

      await sendBookingNotification({
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim(),
        meeting_name: meeting.name,
        scheduled_at,
        duration_minutes: meeting.duration_minutes,
        notes,
      })
    } catch (emailError) {
      console.error('Error sending emails:', emailError)
      // Booking is created even if email fails
    }

    return NextResponse.json({ data: data[0] }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// PUT update booking
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, scheduled_at } = body

    if (!id || !scheduled_at) {
      return NextResponse.json(
        { error: 'Missing required fields: id, scheduled_at' },
        { status: 400 }
      )
    }

    // Get existing booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, start_time, end_time, meeting_type_id, participant_name, participant_email')
      .eq('id', id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Get meeting type
    const { data: meeting, error: meetingError } = await supabase
      .from('meeting_types')
      .select('id, name, duration_minutes')
      .eq('id', booking.meeting_type_id)
      .single()

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: 'Meeting type not found' },
        { status: 404 }
      )
    }

    // Calculate new end time
    const newEndTime = new Date(new Date(scheduled_at).getTime() + meeting.duration_minutes * 60 * 1000)

    // Update booking
    const { data: updated, error: updateError } = await supabase
      .from('bookings')
      .update({
        start_time: scheduled_at,
        end_time: newEndTime.toISOString(),
      })
      .eq('id', id)
      .select()

    if (updateError) throw updateError

    // Try to update Google Calendar event
    try {
      const { data: tokenData } = await supabase
        .from('google_calendar_tokens')
        .select('access_token')
        .eq('user_id', 'tomek')
        .single()

      if (tokenData?.access_token) {
        // Note: You'll need to add updateCalendarEvent function to google-calendar.ts
        console.log('Calendar event update not yet implemented')
      }
    } catch (googleError) {
      console.log('Could not update Google Calendar event:', googleError)
    }

    return NextResponse.json({ data: updated[0] }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// DELETE cancel booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      )
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, start_time, end_time, meeting_type_id, participant_name, participant_email')
      .eq('id', id)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Get meeting type
    const { data: meeting } = await supabase
      .from('meeting_types')
      .select('name')
      .eq('id', booking.meeting_type_id)
      .single()

    // Delete booking from database
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    // Try to delete Google Calendar event
    try {
      const { data: tokenData } = await supabase
        .from('google_calendar_tokens')
        .select('access_token')
        .eq('user_id', 'tomek')
        .single()

      if (tokenData?.access_token) {
        // Note: You'll need to implement deleteCalendarEvent in google-calendar.ts
        console.log('Calendar event deletion not yet implemented')
      }
    } catch (googleError) {
      console.log('Could not delete Google Calendar event:', googleError)
    }

    // Send cancellation emails
    try {
      // Email to customer
      await sendBookingCancellation({
        customer_name: booking.participant_name,
        customer_email: booking.participant_email,
        meeting_name: meeting?.name || 'Spotkanie',
        scheduled_at: booking.start_time,
        duration_minutes: 0,
      })

      // Email to admin
      await sendCancellationNotification({
        customer_name: booking.participant_name,
        customer_email: booking.participant_email,
        meeting_name: meeting?.name || 'Spotkanie',
        scheduled_at: booking.start_time,
        duration_minutes: 0,
      })
    } catch (emailError) {
      console.error('Error sending cancellation emails:', emailError)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Email functions for cancellation
async function sendBookingCancellation(booking: any) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #f9fafb; padding: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rezerwacja anulowana</h1>
          </div>

          <div class="content">
            <p>Cześć ${booking.customer_name},</p>
            <p>Twoja rezerwacja na <strong>${booking.meeting_name}</strong> została anulowana.</p>
            <p>Jeśli masz pytania, skontaktuj się z organizatorem.</p>
          </div>
        </div>
      </body>
    </html>
  `

  // Use resend to send email (implementation similar to sendBookingConfirmation)
  console.log('Sending cancellation email to:', booking.customer_email)
}

async function sendCancellationNotification(booking: any) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #f9fafb; padding: 20px; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rezerwacja anulowana</h1>
          </div>

          <div class="content">
            <p>Rezerwacja <strong>${booking.meeting_name}</strong> od <strong>${booking.customer_name}</strong> została anulowana.</p>
            <p>Email: ${booking.customer_email}</p>
          </div>
        </div>
      </body>
    </html>
  `

  console.log('Sending cancellation notification to:', ADMIN_EMAIL)
}
