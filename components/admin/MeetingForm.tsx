'use client'

import { useState } from 'react'

interface MeetingFormProps {
  onSubmit: (data: MeetingFormData) => Promise<void>
  isLoading?: boolean
  userId?: string
  initialData?: Partial<MeetingFormData>
  isEditing?: boolean
}

export interface MeetingFormData {
  name: string
  description: string
  duration_minutes: number
  buffer_minutes: number
  max_bookings_per_day: number | null
  is_active: boolean
}

export function MeetingForm({ onSubmit, isLoading = false, initialData, isEditing = false }: MeetingFormProps) {
  const [formData, setFormData] = useState<MeetingFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    duration_minutes: initialData?.duration_minutes || 30,
    buffer_minutes: initialData?.buffer_minutes || 15,
    max_bookings_per_day: initialData?.max_bookings_per_day || null,
    is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }))
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value ? Number(value) : null,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    try {
      await onSubmit(formData)
      setFormData({
        name: '',
        description: '',
        duration_minutes: 30,
        buffer_minutes: 15,
        max_bookings_per_day: null,
        is_active: true,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Błąd przy dodawaniu spotkania')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nazwa spotkania *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="np. Konsultacja biznesowa"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Opis
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Opisz o czym będzie rozmowa..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
          Czas trwania (minuty) *
        </label>
        <select
          id="duration_minutes"
          name="duration_minutes"
          value={formData.duration_minutes}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={15}>15 minut</option>
          <option value={30}>30 minut</option>
          <option value={45}>45 minut</option>
          <option value={60}>1 godzina</option>
          <option value={90}>1,5 godziny</option>
          <option value={120}>2 godziny</option>
        </select>
      </div>

      {/* Buffer */}
      <div>
        <label htmlFor="buffer_minutes" className="block text-sm font-medium text-gray-700 mb-2">
          Bufor między spotkaniami (minuty)
        </label>
        <select
          id="buffer_minutes"
          name="buffer_minutes"
          value={formData.buffer_minutes}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={0}>Brak bufora</option>
          <option value={15}>15 minut (domyślnie)</option>
          <option value={30}>30 minut</option>
          <option value={60}>1 godzina</option>
        </select>
      </div>

      {/* Max bookings per day */}
      <div>
        <label htmlFor="max_bookings_per_day" className="block text-sm font-medium text-gray-700 mb-2">
          Max rezerwacji dziennie (puste = brak limitu)
        </label>
        <input
          type="number"
          id="max_bookings_per_day"
          name="max_bookings_per_day"
          value={formData.max_bookings_per_day || ''}
          onChange={handleChange}
          placeholder="np. 5"
          min="1"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Active status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
          Aktywne (dostępne do rezerwacji)
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">✅ Spotkanie dodane pomyślnie!</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading ? (isEditing ? 'Aktualizowanie...' : 'Dodawanie...') : (isEditing ? 'Zaktualizuj spotkanie' : 'Dodaj spotkanie')}
      </button>
    </form>
  )
}