// Meeting type
export interface MeetingType {
  id: string
  user_id: string
  name: string
  description: string | null
  duration_minutes: number
  max_bookings_per_day: number
  buffer_minutes: number
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Availability slot
export interface Availability {
  id: string
  meeting_type_id: string
  start_date: string | null
  end_date: string | null
  day_of_week: number | null // 0=Monday, 6=Sunday
  start_time: string
  end_time: string
  is_recurring: boolean
  recurrence_rule: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Meeting question
export interface MeetingQuestion {
  id: string
  meeting_type_id: string
  question_text: string
  question_type: 'text' | 'email' | 'phone' | 'textarea' | 'select'
  options: { label: string; value: string }[] | null
  is_required: boolean
  sort_order: number
  created_at: string
}

// Booking
export interface Booking {
  id: string
  user_id: string
  meeting_type_id: string
  participant_name: string
  participant_email: string
  participant_phone: string | null
  participant_company: string | null
  start_time: string
  end_time: string
  google_event_id: string | null
  status: 'confirmed' | 'cancelled' | 'no-show'
  created_at: string
  updated_at: string
}

// Booking answer
export interface BookingAnswer {
  id: string
  booking_id: string
  question_id: string
  answer_text: string | null
  created_at: string
}

// Email log
export interface EmailLog {
  id: string
  user_id: string
  booking_id: string | null
  email_type: 'booking_confirmation' | 'daily_summary' | 'admin_notification'
  recipient_email: string
  status: 'sent' | 'failed' | 'pending'
  error_message: string | null
  created_at: string
}

// Form data for booking
export interface BookingFormData {
  participant_name: string
  participant_email: string
  participant_phone: string
  participant_company: string
  answers: Record<string, string>
}

// Available time slot for display
export interface TimeSlot {
  start: Date
  end: Date
  available: boolean
}
