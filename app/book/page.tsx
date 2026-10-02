'use client'

import { useState, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { pl } from 'date-fns/locale'

interface TimeSlot {
  time: string
  datetime: string
}

interface MeetingType {
  id: string
  name: string
  duration_minutes: number
  description?: string
}

export default function BookingPage() {
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  // Form fields
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [notes, setNotes] = useState('')

  // Fetch meeting types on mount
  useEffect(() => {
    const fetchMeetingTypes = async () => {
      try {
        const response = await fetch('/api/booking/meetings')
        if (response.ok) {
          const data = await response.json()
          setMeetingTypes(data.data || [])
        }
      } catch (err) {
        console.error('Error fetching meeting types:', err)
      }
    }

    fetchMeetingTypes()
  }, [])

  // Fetch time slots when meeting and date change
  useEffect(() => {
    if (!selectedMeeting || !selectedDate) return

    const fetchSlots = async () => {
      setSlotsLoading(true)
      setTimeSlots([])
      setSelectedTime('')
      setError('')

      try {
        const response = await fetch(
          `/api/booking/reservations?meetingTypeId=${selectedMeeting}&date=${selectedDate}`
        )

        if (!response.ok) {
          const errorData = await response.json()
          setError(errorData.error || 'Brak dostępnych terminów')
          return
        }

        const data = await response.json()
        setTimeSlots(data.data?.slots || [])

        if (!data.data?.slots || data.data.slots.length === 0) {
          setError('Brak dostępnych terminów w wybranym dniu')
        }
      } catch (err) {
        console.error('Error fetching time slots:', err)
        setError('Błąd przy ładowaniu dostępnych terminów')
      } finally {
        setSlotsLoading(false)
      }
    }

    fetchSlots()
  }, [selectedMeeting, selectedDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Walidacja wymaganych pól
    if (!customerName.trim()) {
      setError('Imię i nazwisko są wymagane')
      return
    }
    if (!customerEmail.trim()) {
      setError('Email jest wymagany')
      return
    }
    // Walidacja formatu emaila
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customerEmail.trim())) {
      setError('Proszę wpisać poprawny adres email')
      return
    }
    if (!selectedDate) {
      setError('Data jest wymagana')
      return
    }
    if (!selectedTime) {
      setError('Godzina jest wymagana')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/booking/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting_type_id: selectedMeeting,
          customer_name: customerName,
          customer_email: customerEmail,
          scheduled_at: selectedTime,
          notes: notes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Błąd rezerwacji')
      }

      setSuccess(true)
      // Reset form
      setCustomerName('')
      setCustomerEmail('')
      setNotes('')
      setSelectedTime('')
      setSelectedDate('')
      setSelectedMeeting('')
    } catch (err: any) {
      setError(err.message || 'Błąd przy tworzeniu rezerwacji')
    } finally {
      setLoading(false)
    }
  }

  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const maxDate = format(addDays(new Date(), 60), 'yyyy-MM-dd')

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Rezerwacja potwierdzona!</h2>
            <p className="text-gray-300 mb-6">
              Sprawdź swoją skrzynkę email — otrzymałeś potwierdzenie rezerwacji.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold py-3 rounded-full transition-all"
            >
              Zarezerwuj jeszcze raz
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Umów się na spotkanie
          </h1>
          <p className="text-gray-400 text-lg">
            Wybierz wygodny dla siebie termin z dostępnych slotów
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Meeting Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-white mb-4">
                Wybierz typ spotkania
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {meetingTypes.map((meeting) => (
                  <button
                    key={meeting.id}
                    type="button"
                    onClick={() => {
                      setSelectedMeeting(meeting.id)
                      setSelectedDate('')
                      setTimeSlots([])
                      setSelectedTime('')
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedMeeting === meeting.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-purple-500/30 hover:border-purple-500/50 bg-slate-800/50 hover:bg-slate-800'
                    }`}
                  >
                    <p className="font-semibold text-white">{meeting.name}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {meeting.duration_minutes} minut
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {selectedMeeting && (
              <>
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-4">
                    Wybierz datę
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={tomorrow}
                    max={maxDate}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 [color-scheme:dark] cursor-pointer"
                    style={{
                      colorScheme: 'dark'
                    }}
                  />
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-semibold text-white mb-4">
                      Wybierz godzinę
                    </label>

                    {slotsLoading ? (
                      <div className="text-center py-8">
                        <div className="inline-block w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                        <p className="text-gray-400 mt-3">Ładowanie dostępnych terminów...</p>
                      </div>
                    ) : error ? (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400">{error}</p>
                      </div>
                    ) : timeSlots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.datetime}
                            type="button"
                            onClick={() => setSelectedTime(slot.datetime)}
                            className={`p-3 rounded-lg border-2 transition-all font-medium ${
                              selectedTime === slot.datetime
                                ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                                : 'border-purple-500/30 hover:border-purple-500/50 text-gray-300 hover:bg-slate-800'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Booking Details */}
                {selectedTime && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Twoje imię i nazwisko <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        placeholder="Jan Kowalski"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Email <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        placeholder="jan@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Notatki (opcjonalnie)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-800 border border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                        placeholder="Dodaj notatki dotyczące Twojej rezerwacji..."
                      />
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                        <p className="text-red-400">{error}</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:from-purple-500/50 disabled:to-purple-500/50 text-white font-semibold py-4 rounded-full transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Rezerwuję...
                        </>
                      ) : (
                        <>
                          <span>Potwierdź rezerwację</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </>
                )}
              </>
            )}
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Potwierdzenie rezerwacji otrzymasz na podany adres email
          </p>
        </div>
      </div>
    </div>
  )
}
