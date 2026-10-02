import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export function getAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
  ]

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  })
}

export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export async function getCalendarEvents(accessToken: string, timeMin: string, timeMax: string) {
  oauth2Client.setCredentials({ access_token: accessToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const response = await calendar.events.list({
    calendarId: '780a3e62b3e54540cd4f84e2bd11acc1bdc90cb1584a2e177ae81261ad4d015e@group.calendar.google.com',
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
  })

  // Map Google Calendar events to our CalendarEvent interface
  return (response.data.items || []).map(item => ({
    start: item.start ? { dateTime: item.start.dateTime || undefined } : undefined,
    end: item.end ? { dateTime: item.end.dateTime || undefined } : undefined,
  }))
}

export async function createCalendarEvent(
  accessToken: string,
  eventData: {
    summary: string
    description: string
    startTime: string
    endTime: string
    attendeeEmail?: string
  }
) {
  oauth2Client.setCredentials({ access_token: accessToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const response = await calendar.events.insert({
    calendarId: '780a3e62b3e54540cd4f84e2bd11acc1bdc90cb1584a2e177ae81261ad4d015e@group.calendar.google.com',
    requestBody: {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime,
        timeZone: 'Europe/Warsaw',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: 'Europe/Warsaw',
      },
      attendees: eventData.attendeeEmail ? [{ email: eventData.attendeeEmail }] : [],
    },
  })

  return response.data
}

export function getAuthClient() {
  return oauth2Client
}
