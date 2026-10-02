'use client'

import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Spotkania dzisiaj</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Rezerwacje (30 dni)</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Typy spotkań</div>
          <div className="text-3xl font-bold text-gray-900">0</div>
        </div>
      </div>

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
          <Link
            href="/admin/settings#calendar"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Konfiguruj
          </Link>
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
