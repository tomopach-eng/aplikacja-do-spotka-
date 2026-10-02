'use client'

import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'

interface Booking {
  id: string
  meeting_type_id: string
  participant_name: string
  participant_email: string
  start_time: string
  end_time: string
  status: string
  created_at: string
  meeting_types?: {
    name: string
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchBookings()
  }, [statusFilter, searchTerm])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/admin/bookings?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'no-show':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Oczekująca'
      case 'confirmed':
        return 'Potwierdzona'
      case 'cancelled':
        return 'Anulowana'
      case 'no-show':
        return 'Brak stawienia'
      default:
        return status
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Rezerwacje</h1>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Szukaj po imienia lub emailu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Wszystkie statusy</option>
          <option value="pending">Oczekująca</option>
          <option value="confirmed">Potwierdzona</option>
          <option value="cancelled">Anulowana</option>
          <option value="no-show">Brak stawienia</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Ładowanie rezerwacji...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              Brak rezerwacji. Rezerwacje pojawią się tutaj.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Imię i nazwisko
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Typ spotkania
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Data i godzina
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {booking.participant_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {booking.participant_email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {booking.meeting_types?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(parseISO(booking.start_time), 'dd MMM yyyy, HH:mm', { locale: pl })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
