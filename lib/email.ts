import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const ADMIN_EMAIL = 'tomopach@gmail.com'
export const APP_NAME = 'AI Lab Booking App'

interface BookingDetails {
  customer_name: string
  customer_email: string
  meeting_name: string
  scheduled_at: string
  duration_minutes: number
  notes?: string
}

// Email template do klienta
function bookingConfirmationEmail(booking: BookingDetails) {
  const date = new Date(booking.scheduled_at)
  const dateStr = date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .details { background: white; padding: 15px; border-left: 4px solid #4f46e5; margin: 15px 0; }
          .footer { color: #666; font-size: 12px; text-align: center; }
          .button { display: inline-block; background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Potwierdzenie rezerwacji</h1>
            <p>${APP_NAME}</p>
          </div>

          <div class="content">
            <p>Cześć ${booking.customer_name},</p>

            <p>Twoja rezerwacja została potwierdzona! Oto szczegóły:</p>

            <div class="details">
              <p><strong>Typ spotkania:</strong><br />${booking.meeting_name}</p>
              <p><strong>Data i godzina:</strong><br />${dateStr} o ${timeStr}</p>
              <p><strong>Czas trwania:</strong><br />${booking.duration_minutes} minut</p>
              ${booking.notes ? `<p><strong>Uwagi:</strong><br />${booking.notes}</p>` : ''}
            </div>

            <p>Jeśli będziesz chciał(a) zmienić lub anulować rezerwację, skontaktuj się z organizatorem.</p>

            <p>
              Do zobaczenia!<br />
              <strong>${APP_NAME}</strong>
            </p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} ${APP_NAME}. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Email template dla Tomka
function bookingNotificationEmail(booking: BookingDetails) {
  const date = new Date(booking.scheduled_at)
  const dateStr = date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .details { background: white; padding: 15px; border-left: 4px solid #059669; margin: 15px 0; }
          .footer { color: #666; font-size: 12px; text-align: center; }
          .button { display: inline-block; background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Nowa rezerwacja!</h1>
            <p>${APP_NAME}</p>
          </div>

          <div class="content">
            <p>Masz nową rezerwację:</p>

            <div class="details">
              <p><strong>Klient:</strong><br />${booking.customer_name}</p>
              <p><strong>Email klienta:</strong><br /><a href="mailto:${booking.customer_email}">${booking.customer_email}</a></p>
              <p><strong>Typ spotkania:</strong><br />${booking.meeting_name}</p>
              <p><strong>Data i godzina:</strong><br />${dateStr} o ${timeStr}</p>
              <p><strong>Czas trwania:</strong><br />${booking.duration_minutes} minut</p>
              ${booking.notes ? `<p><strong>Uwagi od klienta:</strong><br />${booking.notes}</p>` : ''}
            </div>

            <p>
              <a href="http://localhost:3000/admin" class="button">Przejdź do panelu admin</a>
            </p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} ${APP_NAME}. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Email template — anulowanie dla klienta
function bookingCancellationEmail(booking: BookingDetails) {
  const date = new Date(booking.scheduled_at)
  const dateStr = date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .details { background: white; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; }
          .footer { color: #666; font-size: 12px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rezerwacja anulowana</h1>
            <p>${APP_NAME}</p>
          </div>

          <div class="content">
            <p>Cześć ${booking.customer_name},</p>

            <p>Twoja rezerwacja została anulowana:</p>

            <div class="details">
              <p><strong>Typ spotkania:</strong><br />${booking.meeting_name}</p>
              <p><strong>Data i godzina:</strong><br />${dateStr} o ${timeStr}</p>
            </div>

            <p>Jeśli masz pytania, skontaktuj się z organizatorem.</p>

            <p>
              Pozdrawiamy,<br />
              <strong>${APP_NAME}</strong>
            </p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} ${APP_NAME}. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Email template — powiadomienie o anulowaniu dla Tomka
function cancellationNotificationEmail(booking: BookingDetails) {
  const date = new Date(booking.scheduled_at)
  const dateStr = date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .details { background: white; padding: 15px; border-left: 4px solid #dc2626; margin: 15px 0; }
          .footer { color: #666; font-size: 12px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Rezerwacja anulowana</h1>
            <p>${APP_NAME}</p>
          </div>

          <div class="content">
            <p>Rezerwacja została anulowana:</p>

            <div class="details">
              <p><strong>Klient:</strong><br />${booking.customer_name}</p>
              <p><strong>Email klienta:</strong><br /><a href="mailto:${booking.customer_email}">${booking.customer_email}</a></p>
              <p><strong>Typ spotkania:</strong><br />${booking.meeting_name}</p>
              <p><strong>Data i godzina:</strong><br />${dateStr} o ${timeStr}</p>
            </div>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} ${APP_NAME}. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Wysłanie emaila potwierdzenia do klienta
export async function sendBookingConfirmation(booking: BookingDetails) {
  try {
    const result = await resend.emails.send({
      from: `${APP_NAME} <onboarding@resend.dev>`,
      to: booking.customer_email,
      subject: `Potwierdzenie rezerwacji — ${booking.meeting_name}`,
      html: bookingConfirmationEmail(booking),
    })

    console.log('✅ Email potwierdzenia wysłany:', result)
    return result
  } catch (error) {
    console.error('❌ Błąd wysyłania emaila potwierdzenia:', error)
    throw error
  }
}

// Wysłanie emaila powiadomienia do Tomka
export async function sendBookingNotification(booking: BookingDetails) {
  try {
    const result = await resend.emails.send({
      from: `${APP_NAME} <onboarding@resend.dev>`,
      to: ADMIN_EMAIL,
      subject: `Nowa rezerwacja: ${booking.meeting_name} — ${booking.customer_name}`,
      html: bookingNotificationEmail(booking),
    })

    console.log('✅ Email powiadomienia wysłany:', result)
    return result
  } catch (error) {
    console.error('❌ Błąd wysyłania emaila powiadomienia:', error)
    throw error
  }
}

// Wysłanie emaila anulowania do klienta
export async function sendBookingCancellation(booking: BookingDetails) {
  try {
    const result = await resend.emails.send({
      from: `${APP_NAME} <onboarding@resend.dev>`,
      to: booking.customer_email,
      subject: `Anulowanie rezerwacji — ${booking.meeting_name}`,
      html: bookingCancellationEmail(booking),
    })

    console.log('✅ Email anulowania wysłany klientowi:', result)
    return result
  } catch (error) {
    console.error('❌ Błąd wysyłania emaila anulowania:', error)
    throw error
  }
}

// Wysłanie powiadomienia o anulowaniu do Tomka
export async function sendCancellationNotification(booking: BookingDetails) {
  try {
    const result = await resend.emails.send({
      from: `${APP_NAME} <onboarding@resend.dev>`,
      to: ADMIN_EMAIL,
      subject: `Anulowanie rezerwacji: ${booking.meeting_name} — ${booking.customer_name}`,
      html: cancellationNotificationEmail(booking),
    })

    console.log('✅ Email powiadomienia o anulowaniu wysłany:', result)
    return result
  } catch (error) {
    console.error('❌ Błąd wysyłania emaila powiadomienia o anulowaniu:', error)
    throw error
  }
}
