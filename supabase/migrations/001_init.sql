-- Create tables for booking app

-- Meeting types (spotkania)
CREATE TABLE meeting_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  max_bookings_per_day INT NOT NULL DEFAULT 5,
  buffer_minutes INT NOT NULL DEFAULT 15,
  color VARCHAR(7) DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Available time slots (dostępności)
CREATE TABLE availabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_type_id UUID NOT NULL REFERENCES meeting_types(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  day_of_week INT, -- 0=Monday, 6=Sunday, NULL for specific date
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule VARCHAR(255), -- iCalendar RRULE format
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Questions for booking forms
CREATE TABLE meeting_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_type_id UUID NOT NULL REFERENCES meeting_types(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- 'text', 'email', 'phone', 'textarea', 'select'
  options JSONB, -- For select questions
  is_required BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings (rezerwacje)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  meeting_type_id UUID NOT NULL REFERENCES meeting_types(id) ON DELETE CASCADE,
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255) NOT NULL,
  participant_phone VARCHAR(20),
  participant_company VARCHAR(255),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  google_event_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'confirmed', -- 'confirmed', 'cancelled', 'no-show'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Booking answers (odpowiedzi na pytania)
CREATE TABLE booking_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES meeting_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email logs
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  email_type VARCHAR(50) NOT NULL, -- 'booking_confirmation', 'daily_summary', 'admin_notification'
  recipient_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'failed', 'pending'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_meeting_types_user_id ON meeting_types(user_id);
CREATE INDEX idx_availabilities_meeting_type_id ON availabilities(meeting_type_id);
CREATE INDEX idx_meeting_questions_meeting_type_id ON meeting_questions(meeting_type_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_meeting_type_id ON bookings(meeting_type_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_booking_answers_booking_id ON booking_answers(booking_id);
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
