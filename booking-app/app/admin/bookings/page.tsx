'use client'

export default function BookingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Rezerwacje</h1>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Szukaj po imienia lub emailu..."
          className="px-4 py-2 border border-gray-300 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option>Wszystkie status</option>
          <option>Potwierdzone</option>
          <option>Anulowane</option>
          <option>Brak stawienia</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <p className="text-gray-500 text-center py-12">
          Brak rezerwacji. Rezerwacje pojawią się tutaj.
        </p>
      </div>
    </div>
  )
}
