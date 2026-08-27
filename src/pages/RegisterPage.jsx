import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

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
    <div className="bg-background text-foreground font-sans min-h-screen flex flex-col items-center justify-center py-10 px-4">
      <main className="w-full max-w-[480px] bg-background rounded-xl border border-border p-6 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-xl font-bold text-primary mb-1">ShopSmart</h1>
          <h2 className="text-2xl md:text-3xl text-foreground">Buat Akun Baru</h2>
          <p className="text-sm text-muted-foreground mt-2">Mulai pengalaman berbelanja terbaik Anda hari ini.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">person</span>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Masukkan nama lengkap"
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">mail</span>
              <Input
                id="email"
                name="email"
                placeholder="contoh@email.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">phone</span>
              <Input
                id="phone"
                name="phone"
                placeholder="081234567890"
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">lock</span>
              <Input
                id="password"
                name="password"
                placeholder="Minimal 8 karakter"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none" type="button">
                <span className="material-symbols-outlined">visibility_off</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">lock</span>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Ulangi kata sandi"
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 mt-2">
            <div className="flex items-center h-5">
              <Checkbox
                checked={terms}
                onCheckedChange={setTerms}
                id="terms"
                name="terms"
                required
              />
            </div>
            <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
              Saya setuju dengan <a className="text-primary hover:underline font-medium" href="#">Syarat dan Ketentuan</a> serta <a className="text-primary hover:underline font-medium" href="#">Kebijakan Privasi</a>.
            </Label>
          </div>

          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}

          <Button
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg transition-colors duration-200 flex justify-center items-center gap-2"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
          </Button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-border" />
          <span className="mx-4 text-xs text-muted-foreground uppercase tracking-wider">atau</span>
          <div className="flex-grow border-t border-border" />
        </div>

        <div className="space-y-3">
          <Button variant="outline" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg hover:bg-muted transition-colors duration-200 font-medium" type="button">
            <img alt="Google" className="w-5 h-5 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFfGjDjYgVS4XP0UFEH7KwWJCvwWJ-NvSYQoEBYjQxJurJeIDJgnZhDrgc8SqzemszFUJv-vk23kNfgWbYNHarPyzaKvfJ36okoAk_oVQsq-5LhC71uq6wQC_CVcQVB6riWH-EWbg0zJ8-zRCuNCCSg8xZfz10RC9HvC3K42ol6qEPVG0Chy4WHKp2_JQI_7X6D5zL8849nMKTmtr9QDtUdE5hTHZqHv0uxNal86UxKpj4amWOvsmn" />
            Daftar dengan Google
          </Button>
          <Button variant="outline" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg hover:bg-[#1877F2] hover:text-white transition-colors duration-200 font-medium border-[#1877F2] text-[#1877F2]" type="button">
            <img alt="Facebook" className="w-5 h-5 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdy_OICvAe3qlqB-SwnTRoCbzyz-rFVoKAq3RMopK4ChCCxyiCOUz9--AMknvU5_r_rSdeIKyKjlA5W12J9tMd6n1YfZTa_H-6ngAyW2SyhWDOFv1OsA7lPl8CFBHiwT7vCDXw4mbXmPQfilxPNn58hniu2x77PqiiZrydu4WWvUBBFWilo75D3t1uMUIxY0g87iE0jdKP4KKjdTU93lmPu8WcNdtvnZwbUKrLoLDdcTHa8fgrZMja" />
            Daftar dengan Facebook
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Sudah punya akun? <a className="text-primary font-medium hover:underline" href="/login">Masuk di sini</a>
          </p>
        </div>
      </main>
    </div>
  )
}
