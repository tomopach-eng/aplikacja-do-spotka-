'use client'

import { useEffect, useState } from 'react'
import { MeetingForm, MeetingFormData } from '../../../components/admin/MeetingForm'
import { AvailabilityForm } from '../../../components/admin/AvailabilityForm'

interface MeetingType {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  buffer_minutes: number
  max_bookings_per_day: number | null
  is_active: boolean
  created_at: string
}

const ADMIN_USER_ID = 'b5a11b01-cdf1-48c1-aae3-27d87ebdaca2'

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingType[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false)
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null)
  const [editingMeeting, setEditingMeeting] = useState<MeetingType | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  useEffect(() => {
    fetchMeetings()
  }, [])

  const fetchMeetings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/meetings')
      if (!response.ok) throw new Error('Failed to fetch meetings')
      const { data } = await response.json()
      setMeetings(data || [])
    } catch (error) {
      console.error('Error fetching meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: MeetingFormData) => {
    try {
      const response = await fetch('/api/admin/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create meeting')
      }

      await fetchMeetings()
      setShowForm(false)
      setSuccessMessage('Typ spotkania został utworzony')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      throw error
    }
  }

  const handleEdit = async (formData: MeetingFormData) => {
    if (!editingMeeting) return
    try {
      setError('')
      const response = await fetch(`/api/admin/meetings/${editingMeeting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Nie udało się zaktualizować spotkania')
      }

      await fetchMeetings()
      setEditingMeeting(null)
      setSuccessMessage('Typ spotkania został zaktualizowany')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      setError(error.message || 'Błąd przy aktualizowaniu spotkania')
    }
  }

  const handleDelete = async (meetingId: string) => {
    try {
      setError('')
      const response = await fetch(`/api/admin/meetings/${meetingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Nie udało się usunąć spotkania')
      }

      await fetchMeetings()
      setDeleteConfirmId(null)
      setSuccessMessage('Typ spotkania został usunięty')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error: any) {
      setError(error.message || 'Błąd przy usuwaniu spotkania')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Typy spotkań</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {showForm ? '✕ Zamknij' : '+ Nowe spotkanie'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Dodaj nowy typ spotkania</h2>
          <MeetingForm onSubmit={handleSubmit} isLoading={loading} userId={ADMIN_USER_ID} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {loading && !showForm ? (
          <p className="text-gray-500 text-center py-8">Ładowanie...</p>
        ) : meetings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Brak typów spotkań. Stwórz pierwszy typ, żeby zamieniać się w rezerwacje.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              + Dodaj pierwsze spotkanie
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Spotkania ({meetings.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {meetings.map(meeting => (
                <div
                  key={meeting.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{meeting.name}</h3>
                      {meeting.description && (
                        <p className="text-gray-600 text-sm mt-1">{meeting.description}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        meeting.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {meeting.is_active ? 'Aktywne' : 'Nieaktywne'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-3">
                    <div>
                      <p className="font-medium text-gray-700">Czas trwania</p>
                      <p>{meeting.duration_minutes} minut</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Bufor</p>
                      <p>{meeting.buffer_minutes} minut</p>
                    </div>
                    {meeting.max_bookings_per_day && (
                      <div>
                        <p className="font-medium text-gray-700">Max rezerwacji/dzień</p>
                        <p>{meeting.max_bookings_per_day}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setEditingMeeting(meeting)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm font-medium"
                    >
                      Edytuj
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMeetingId(meeting.id)
                        setShowAvailabilityForm(true)
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm font-medium"
                    >
                      Dostępności
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(meeting.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-medium"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAvailabilityForm && selectedMeetingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Dostępności</h2>
            <AvailabilityForm
              meetingTypeId={selectedMeetingId}
              onSuccess={() => {
                setShowAvailabilityForm(false)
                setSelectedMeetingId(null)
                fetchMeetings()
              }}
              onClose={() => {
                setShowAvailabilityForm(false)
                setSelectedMeetingId(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edytuj typ spotkania</h2>
              <button
                onClick={() => setEditingMeeting(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-light"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <MeetingForm
              onSubmit={handleEdit}
              isLoading={loading}
              userId={ADMIN_USER_ID}
              isEditing={true}
              initialData={{
                name: editingMeeting.name,
                description: editingMeeting.description || '',
                duration_minutes: editingMeeting.duration_minutes,
                buffer_minutes: editingMeeting.buffer_minutes,
                max_bookings_per_day: editingMeeting.max_bookings_per_day,
                is_active: editingMeeting.is_active,
              }}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Potwierdź usunięcie</h2>
            <p className="text-gray-600 mb-6">
              Czy na pewno chcesz usunąć typ spotkania "{meetings.find(m => m.id === deleteConfirmId)?.name}"?
              Tej akcji nie będzie można cofnąć.
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Anuluj
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition font-medium"
              >
                {loading ? 'Usuwanie...' : 'Usuń'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg">
          {successMessage}
        </div>
      )}
    </div>
  )
}