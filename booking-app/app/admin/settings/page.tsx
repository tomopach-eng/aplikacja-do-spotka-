'use client'

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Ustawienia</h1>

      <div className="space-y-8">
        {/* Calendar Integration */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Integracja kalendarza
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Calendar
              </label>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                Połącz Google Calendar
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apple Calendar (CalDAV)
              </label>
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">
                Skonfiguruj CalDAV
              </button>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Email notyfikacje
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email do powiadomień
              </label>
              <input
                type="email"
                defaultValue="tomopach@gmail.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm text-gray-700">
                  Otrzymuj email po każdej rezerwacji
                </span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-sm text-gray-700">
                  Otrzymuj podsumowanie dzienne o 18:00
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Ogólne ustawienia
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Strefa czasowa
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Europe/Warsaw</option>
                <option>Europe/London</option>
                <option>Europe/Berlin</option>
              </select>
            </div>

            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
              Zapisz ustawienia
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
