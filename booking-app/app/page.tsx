export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Booking App
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Zautomatyzuj umawianie spotkań. Pozwól klientom rezerwować terminy
            na Twój kalendarz samodzielnie.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/admin"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Admin Panel
            </a>
            <a
              href="/book"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Rezerwuj spotkanie
            </a>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">🗓️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Elastyczne terminy
              </h3>
              <p className="text-gray-600">
                Definiuj dostępność — konkretne daty, cykliczne okna, bufory
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">📧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Automatyczne powiadomienia
              </h3>
              <p className="text-gray-600">
                Email dla Ciebie i uczestnika + podsumowanie dzienne
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Integracja kalendarza
              </h3>
              <p className="text-gray-600">
                Auto-synchronizacja z Google Calendar i Apple
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
