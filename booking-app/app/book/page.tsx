'use client'

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Rezerwuj spotkanie
          </h1>
          <p className="text-gray-600 mb-8">
            Wybierz typ spotkania i dostępny termin
          </p>

          <div className="space-y-6">
            {/* Step 1: Choose meeting type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Typ spotkania
              </label>
              <div className="space-y-2">
                <p className="text-gray-500 text-center py-8">
                  Brak dostępnych typów spotkań
                </p>
              </div>
            </div>

            <button
              disabled
              className="w-full px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
            >
              Kontynuuj
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Link do rezerwacji zostanie wkrótce aktywny
          </p>
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 font-semibold mt-4 inline-block"
          >
            Wróć na stronę główną
          </a>
        </div>
      </div>
    </div>
  )
}
