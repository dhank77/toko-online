import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok')
      return
    }

    if (!terms) {
      setError('Anda harus menyetujui syarat dan ketentuan')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, { full_name: fullName, phone })
      alert('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.')
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col items-center justify-center py-lg px-sm">
      <main className="w-full max-w-[480px] bg-surface rounded-xl ambient-shadow-2 p-md md:p-lg">
        <header className="text-center mb-lg">
          <h1 className="font-headline-md text-headline-md text-primary mb-xs">ShopSmart</h1>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Buat Akun Baru</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Mulai pengalaman berbelanja terbaik Anda hari ini.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-sm">
          <div className="flex flex-col gap-base">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="fullName">Nama Lengkap</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 transform -translate-y-1/2 text-outline">person</span>
              <input
                className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary-fixed focus:outline-none transition-all ambient-shadow-1 font-body-md text-body-md text-on-surface"
                id="fullName"
                name="fullName"
                placeholder="Masukkan nama lengkap"
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-base">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 transform -translate-y-1/2 text-outline">mail</span>
              <input
                className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary-fixed focus:outline-none transition-all ambient-shadow-1 font-body-md text-body-md text-on-surface"
                id="email"
                name="email"
                placeholder="contoh@email.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-base">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="phone">Nomor Telepon</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 transform -translate-y-1/2 text-outline">phone</span>
              <input
                className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary-fixed focus:outline-none transition-all ambient-shadow-1 font-body-md text-body-md text-on-surface"
                id="phone"
                name="phone"
                placeholder="081234567890"
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-base">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Kata Sandi</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 transform -translate-y-1/2 text-outline">lock</span>
              <input
                className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary-fixed focus:outline-none transition-all ambient-shadow-1 font-body-md text-body-md text-on-surface"
                id="password"
                name="password"
                placeholder="Minimal 8 karakter"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="absolute right-sm top-1/2 transform -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none" type="button">
                <span className="material-symbols-outlined">visibility_off</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-base">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-sm top-1/2 transform -translate-y-1/2 text-outline">lock</span>
              <input
                className="w-full pl-xl pr-sm py-sm rounded-lg border border-outline-variant bg-surface-container-lowest focus:border-primary focus:ring-2 focus:ring-primary-fixed focus:outline-none transition-all ambient-shadow-1 font-body-md text-body-md text-on-surface"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Ulangi kata sandi"
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-start gap-xs mt-sm">
            <div className="flex items-center h-5">
              <input
                checked={terms}
                className="w-[18px] h-[18px] rounded border-outline-variant text-primary focus:ring-primary-fixed focus:ring-2 bg-surface-container-lowest transition-colors cursor-pointer"
                id="terms"
                name="terms"
                required
                type="checkbox"
                onChange={(e) => setTerms(e.target.checked)}
              />
            </div>
            <label className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer" htmlFor="terms">
              Saya setuju dengan <a className="text-primary hover:underline font-label-md text-label-md" href="#">Syarat dan Ketentuan</a> serta <a className="text-primary hover:underline font-label-md text-label-md" href="#">Kebijakan Privasi</a>.
            </label>
          </div>

          {error && (
            <p className="text-error text-body-sm font-body-sm">{error}</p>
          )}

          <button
            className="w-full mt-md bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-sm rounded-lg transition-colors duration-200 ambient-shadow-1 flex justify-center items-center gap-xs"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="flex items-center my-md">
          <div className="flex-grow border-t border-outline-variant" />
          <span className="mx-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">atau</span>
          <div className="flex-grow border-t border-outline-variant" />
        </div>

        <div className="space-y-sm">
          <button className="w-full flex items-center justify-center gap-sm py-[14px] px-sm bg-surface-container-lowest border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors duration-200 font-label-md text-label-md text-on-surface ambient-shadow-1" type="button">
            <img
              alt="Google"
              className="w-5 h-5 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFfGjDjYgVS4XP0UFEH7KwWJCvwWJ-NvSYQoEBYjQxJurJeIDJgnZhDrgc8SqzemszFUJv-vk23kNfgWbYNHarPyzaKvfJ36okoAk_oVQsq-5LhC71uq6wQC_CVcQVB6riWH-EWbg0zJ8-zRCuNCCSg8xZfz10RC9HvC3K42ol6qEPVG0Chy4WHKp2_JQI_7X6D5zL8849nMKTmtr9QDtUdE5hTHZqHv0uxNal86UxKpj4amWOvsmn"
            />
            Daftar dengan Google
          </button>
          <button className="w-full flex items-center justify-center gap-sm py-[14px] px-sm bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg transition-colors duration-200 font-label-md text-label-md ambient-shadow-1 border border-transparent" type="button">
            <img
              alt="Facebook"
              className="w-5 h-5 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdy_OICvAe3qlqB-SwnTRoCbzyz-rFVoKAq3RMopK4ChCCxyiCOUz9--AMknvU5_r_rSdeIKyKjlA5W12J9tMd6n1YfZTa_H-6ngAyW2SyhWDOFv1OsA7lPl8CFBHiwT7vCDXw4mbXmPQfilxPNn58hniu2x77PqiiZrydu4WWvUBBFWilo75D3t1uMUIxY0g87iE0jdKP4KKjdTU93lmPu8WcNdtvnZwbUKrLoLDdcTHa8fgrZMja"
            />
            Daftar dengan Facebook
          </button>
        </div>

        <div className="mt-lg text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Sudah punya akun? <a className="text-primary font-label-md text-label-md hover:underline" href="/login">Masuk di sini</a>
          </p>
        </div>
      </main>
    </div>
  )
}
