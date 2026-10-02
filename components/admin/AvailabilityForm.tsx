'use client'

import { useState, useEffect } from 'react'

interface AvailabilityItem {
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

interface AvailabilityFormProps {
  meetingTypeId: string
  onSuccess?: () => void
  onClose?: () => void
}

const DAYS = [
  { value: 0, label: 'Poniedziałek' },
  { value: 1, label: 'Wtorek' },
  { value: 2, label: 'Środa' },
  { value: 3, label: 'Czwartek' },
  { value: 4, label: 'Piątek' },
  { value: 5, label: 'Sobota' },
  { value: 6, label: 'Niedziela' },
]

export function AvailabilityForm({
  meetingTypeId,
  onSuccess,
  onClose,
}: AvailabilityFormProps) {
  const [availability, setAvailability] = useState<AvailabilityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch existing availability
  useEffect(() => {
    fetchAvailability()
  }, [meetingTypeId])

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/meetings/${meetingTypeId}/availability`)
      if (!response.ok) throw new Error('Failed to fetch availability')
      const { data } = await response.json()

      if (data && data.length > 0) {
        setAvailability(data)
      } else {
        // Initialize with default availability (9-17 for all days)
        setAvailability(
          DAYS.map(day => ({
            day_of_week: day.value,
            start_time: '09:00',
            end_time: '17:00',
            is_available: true,
          }))
        )
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTimeChange = (dayOfWeek: number, field: 'start_time' | 'end_time', value: string) => {
    setAvailability(prev =>
      prev.map(item =>
        item.day_of_week === dayOfWeek
          ? { ...item, [field]: value }
          : item
      )
    )
  }

  const handleToggle = (dayOfWeek: number) => {
    setAvailability(prev =>
      prev.map(item =>
        item.day_of_week === dayOfWeek
          ? { ...item, is_available: !item.is_available }
          : item
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/meetings/${meetingTypeId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to save availability')
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-center text-gray-500">Ładowanie...</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {DAYS.map(day => {
          const dayData = availability.find(a => a.day_of_week === day.value)
          if (!dayData) return null

          return (
            <div key={day.value} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id={`day-${day.value}`}
                  checked={dayData.is_available}
                  onChange={() => handleToggle(day.value)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor={`day-${day.value}`} className="ml-2 font-medium text-gray-900">
                  {day.label}
                </label>
              </div>

              {dayData.is_available && (
                <div className="flex gap-4 ml-6">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">Od</label>
                    <input
                      type="time"
                      value={dayData.start_time}
                      onChange={(e) => handleTimeChange(day.value, 'start_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-1">Do</label>
                    <input
                      type="time"
                      value={dayData.end_time}
                      onChange={(e) => handleTimeChange(day.value, 'end_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">✅ Dostępność zapisana!</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {saving ? 'Zapisywanie...' : 'Zapisz dostępność'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Zamknij
          </button>
        )}
      </div>
    </form>
  )
}