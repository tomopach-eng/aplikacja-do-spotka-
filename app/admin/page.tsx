'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DashboardStats {
  todayMeetings: number
  last30DaysReservations: number
  meetingTypes: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayMeetings: 0,
    last30DaysReservations: 0,
    meetingTypes: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/admin/stats')
        if (!response.ok) {
          throw new Error('Nie udało się pobrać statystyk')
        }

        const data = await response.json()
        setStats(data.data || {
          todayMeetings: 0,
          last30DaysReservations: 0,
          meetingTypes: 0,
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError(err instanceof Error ? err.message : 'Błąd podczas ładowania danych')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Spotkania dzisiaj</div>
          <div className="text-3xl font-bold text-gray-900">
            {loading ? '...' : stats.todayMeetings}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Rezerwacje (30 dni)</div>
          <div className="text-3xl font-bold text-gray-900">
            {loading ? '...' : stats.last30DaysReservations}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Typy spotkań</div>
          <div className="text-3xl font-bold text-gray-900">
            {loading ? '...' : stats.meetingTypes}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Zarządzaj spotkaniami
          </h2>
          <p className="text-gray-600 mb-6">
            Definiuj typy spotkań, dostępności, pytania i ustawienia
          </p>
          <Link
            href="/admin/meetings"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Przejdź
          </Link>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Przegląd rezerwacji
          </h2>
          <p className="text-gray-600 mb-6">
            Wyświetlaj rezerwacje, potwierdzenia, anulowania
          </p>
          <Link
            href="/admin/bookings"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Przejdź
          </Link>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Integracja kalendarza
          </h2>
          <p className="text-gray-600 mb-6">
            Połącz Google Calendar i Apple Calendar
          </p>
          <button
            onClick={() => {
              window.location.href = '/api/auth/google'
            }}
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Połącz Google Calendar
          </button>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Ustawienia
          </h2>
          <p className="text-gray-600 mb-6">
            Email notyfikacji, strefa czasowa, wygląd
          </p>
          <Link
            href="/admin/settings"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Przejdź
          </Link>
        </div>
      </div>
    </div>
  )
}
