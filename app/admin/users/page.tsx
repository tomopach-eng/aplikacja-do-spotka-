'use client'

import { useEffect, useState } from 'react'
import { Admin } from '@/lib/auth'

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch admins
  useEffect(() => {
    fetchAdmins()
  }, [])

  async function fetchAdmins() {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/admins')
      const data = await response.json()

      if (response.ok) {
        setAdmins(data.admins || [])
      } else {
        setError(data.error || 'Błąd podczas ładowania administratorów')
      }
    } catch (err) {
      setError('Błąd sieciowy')
      console.error('Fetch admins error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsCreating(true)

    try {
      const response = await fetch('/api/auth/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Błąd podczas tworzenia konta')
        return
      }

      // Reset form and refresh list
      setEmail('')
      setPassword('')
      setShowForm(false)
      await fetchAdmins()
    } catch (err) {
      setError('Błąd sieciowy')
      console.error('Create admin error:', err)
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDeleteAdmin(adminId: string) {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/auth/admins/${adminId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Błąd podczas usuwania administratora')
        return
      }

      setDeleteConfirm(null)
      await fetchAdmins()
    } catch (err) {
      setError('Błąd sieciowy')
      console.error('Delete admin error:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Administratorzy</h1>
        <p className="text-gray-600 mt-1">
          Zarządzaj kontami administratorów aplikacji
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Create button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
        >
          + Dodaj administratora
        </button>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Nowy administrator</h2>

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Hasło
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 znaków</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
              >
                {isCreating ? 'Tworzenie...' : 'Dodaj administratora'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins list */}
      {!loading && admins.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Ostatnie logowanie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{admin.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {admin.is_main_admin ? (
                      <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Główny admin
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        Administrator
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {admin.last_login
                      ? new Date(admin.last_login).toLocaleDateString('pl-PL')
                      : 'Nigdy'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!admin.is_main_admin && (
                      <>
                        {deleteConfirm === admin.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteAdmin(admin.id)}
                              disabled={isDeleting}
                              className="text-red-600 hover:text-red-800 font-medium text-sm disabled:opacity-50"
                            >
                              {isDeleting ? 'Usuwanie...' : 'Potwierdź'}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                            >
                              Anuluj
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(admin.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Usuń
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Ładowanie administratorów...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && admins.length === 0 && (
        <div className="text-center py-8 bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-600">Brak administratorów</p>
        </div>
      )}
    </div>
  )
}
