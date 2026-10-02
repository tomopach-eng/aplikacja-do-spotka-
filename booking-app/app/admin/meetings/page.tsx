'use client'

export default function MeetingsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Typy spotkań</h1>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
          + Nowe spotkanie
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <p className="text-gray-500 text-center py-12">
          Brak typów spotkań. Stwórz pierwszy typ, żeby zamieniać się w rezerwacje.
        </p>
      </div>
    </div>
  )
}
