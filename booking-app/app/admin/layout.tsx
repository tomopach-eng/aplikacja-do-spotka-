import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/admin" className="text-2xl font-bold text-blue-600">
              Booking App
            </Link>
            <div className="flex gap-6">
              <Link
                href="/admin/meetings"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Spotkania
              </Link>
              <Link
                href="/admin/bookings"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Rezerwacje
              </Link>
              <Link
                href="/admin/settings"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Ustawienia
              </Link>
              <button className="text-gray-600 hover:text-gray-900 font-medium">
                Wyloguj
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
