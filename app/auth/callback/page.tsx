'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<'loading' | 'form' | 'success'>('loading')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  useEffect(() => {
    // Verify recovery token
    verifyToken()
  }, [])

  async function verifyToken() {
    try {
      const type = searchParams.get('type')
      const token = searchParams.get('token')
      const email = searchParams.get('email')

      if (!token || type !== 'recovery') {
        setError('Nieprawidłowy link resetowania hasła')
        setStep('form')
        return
      }

      // Verify the token by creating a session
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email || '',
        token,
        type: 'recovery',
      })

      if (verifyError) {
        setError('Link wygasł lub jest nieprawidłowy. Poproś o nowy link resetowania.')
        setStep('form')
        return
      }

      setStep('form')
    } catch (err) {
      console.error('Token verification error:', err)
      setError('Błąd podczas weryfikacji linku')
      setStep('form')
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('Oba pola są wymagane')
      return
    }

    if (password.length < 8) {
      setError('Hasło musi mieć co najmniej 8 znaków')
      return
    }

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message || 'Błąd podczas zmiany hasła')
        return
      }

      setSuccess(true)
      setStep('success')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/admin/login')
      }, 2000)
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError('Błąd serwera')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto" key={Math.random()}>
        {/* Loading */}
        {step === 'loading' && (
          <div className="text-center py-12">
            <p className="text-gray-400">Weryfikacja linku...</p>
          </div>
        )}

        {/* Form */}
        {step === 'form' && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-2xl p-8">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">
              Resetuj hasło
            </h1>

            {error && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nowe hasło
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  minLength={8}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 8 znaków</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Potwierdź hasło
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-slate-800 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  minLength={8}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition"
              >
                {loading ? 'Zmiana hasła...' : 'Zmień hasło'}
              </button>
            </form>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-green-500/30 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-white mb-2">Hasło zmienione!</h1>
            <p className="text-gray-400 mb-4">
              Twoje hasło zostało pomyślnie zmienione. Zaraz przekierujemy Cię do logowania...
            </p>
            <button
              onClick={() => router.push('/admin/login')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
            >
              Przejdź do logowania
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-400">Ładowanie...</p>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
