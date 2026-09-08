// Utility untuk ensure Midtrans Snap sudah ter-load
export function loadSnapScript() {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.snap) return resolve(window.snap)
    const existing = document.querySelector('script[src*="midtrans.com/snap/snap.js"]')
    if (existing && window.snap) return resolve(window.snap)

    const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true'
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || 'Mid-client-YB3sPx8HmfM2RPD8'
    const src = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'

    const script = document.createElement('script')
    script.src = src
    script.setAttribute('data-client-key', clientKey)
    script.async = true
    script.onload = () => {
      if (window.snap) resolve(window.snap)
      else reject(new Error('Snap gagal dimuat'))
    }
    script.onerror = () => reject(new Error('Gagal memuat script Midtrans Snap'))
    document.head.appendChild(script)
  })
}
