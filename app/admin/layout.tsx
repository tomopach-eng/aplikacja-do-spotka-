'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/admin/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/admin" className="text-2xl font-bold text-blue-600">
              Booking App
            </Link>
            <div className="flex gap-6 items-center">
              <Link
                href="/admin/meetings"
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Spotkania
              </Link>
              <Link
                href="/admin/bookings"
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Rezerwacje
              </Link>
              <Link
                href="/admin/settings"
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Ustawienia
              </Link>
              <Link
                href="/admin/users"
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Administratorzy
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-gray-600 hover:text-red-600 font-medium transition disabled:opacity-50"
              >
                {isLoggingOut ? 'Wylogowywanie...' : 'Wyloguj'}
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
