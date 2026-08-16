import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithOAuth } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased bg-login-pattern">
      <main className="flex-grow flex items-center justify-center p-sm md:p-gutter">
        <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-xl shadow-[0_10px_15px_rgba(30,64,175,0.1)] p-lg flex flex-col relative overflow-hidden">
          <div className="text-center mb-xl relative z-10">
            <h1 className="font-headline-md text-headline-md text-primary mb-sm font-bold tracking-tight">
              ShopSmart
            </h1>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">
              Selamat Datang Kembali
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Silakan masuk ke akun Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-sm relative z-10">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">
                  mail
                </span>
                <input
                  className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-md text-body-md placeholder-outline-variant"
                  id="email"
                  name="email"
                  placeholder="nama@email.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-xs">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
                  Kata Sandi
                </label>
                <a className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors" href="#">
                  Lupa Kata Sandi?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant pointer-events-none">
                  lock
                </span>
                <input
                  className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant bg-surface text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-body-md text-body-md placeholder-outline-variant"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-error text-body-sm font-body-sm">{error}</p>
            )}

            <button
              className="w-full bg-primary text-on-primary py-sm rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors mt-xs flex items-center justify-center gap-xs"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>

          <div className="flex items-center my-md relative z-10">
            <div className="flex-grow border-t border-outline-variant" />
            <span className="px-sm font-label-sm text-label-sm text-outline">ATAU</span>
            <div className="flex-grow border-t border-outline-variant" />
          </div>

          <div className="flex flex-col gap-sm relative z-10">
            <button
              className="w-full border border-outline-variant bg-surface text-on-surface py-sm rounded-lg font-label-md text-label-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-sm"
              type="button"
              onClick={() => signInWithOAuth('google')}
            >
              <svg
                aria-label="Google"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Masuk dengan Google
            </button>
            <button
              className="w-full border border-outline-variant bg-surface text-on-surface py-sm rounded-lg font-label-md text-label-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-sm"
              type="button"
            >
              <svg
                aria-label="Facebook"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  fill="#1877F2"
                />
              </svg>
              Masuk dengan Facebook
            </button>
          </div>

          <div className="mt-lg text-center font-body-sm text-body-sm text-on-surface-variant relative z-10">
            Belum punya akun?{' '}
            <a className="font-label-md text-label-md text-primary hover:underline" href="/register">
              Daftar di sini
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
