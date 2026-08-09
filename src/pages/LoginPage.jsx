import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
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
            >
              <img
                alt="Google"
                className="w-5 h-5 object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-JGEgb_6T_4y0vGX7GK_qrVUKCc_mmGhOKLaY4e5-Sj-I_ZSn7tvhtPcjrumnZSw1_th9dAZZtNcsq5dEU4KYoBK0e01UqNs_0P7NIaqkQhaWBzU6wyozR2eeYtPXrokUipQRugz4ENQQmFrPfg-m4dQQZnkhdM7ROZRVaFUvcZOhW-LNMUoQtSlHmsaxzXsbyUd4RTBr-hieKMlmOs6K_bRpmfactYNUNvTAP4fGKGaLDlomVyPv"
              />
              Masuk dengan Google
            </button>
            <button
              className="w-full border border-outline-variant bg-surface text-on-surface py-sm rounded-lg font-label-md text-label-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-sm"
              type="button"
            >
              <img
                alt="Facebook"
                className="w-5 h-5 object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCu2WtGmMi1eLp_bS02YGENbbBV_SK2J5AI_y4IqLerSO5fdAPp1m0Olfq_APcc0SEAsZS2VfO6M6HNYdep6GbYD-C-b7U8Z7_A4BWPuHW0CFDENmmrChDnn9cVyd_OYsy_RZgc53lQw1mWFXjh2nAqIIDrAodpKtu8Pla-toocGtzQxBg0oP3AMGL-JG6WWJHeds12VExsRl1I245V4UUVVEW12e2oA845MkSIAgaPblihWv5GYIDY"
              />
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
