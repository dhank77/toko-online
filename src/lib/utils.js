import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatRupiah(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return "Rp0"
  return rupiahFormatter.format(Math.round(num))
}

function hashString(value) {
  const str = String(value ?? '')
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) % 100003
  }
  return hash
}

// Skema produk belum punya field diskon, jadi badge % Flash Sale
// disimulasikan secara deterministik dari id/slug agar stabil antar-render.
export function getPseudoDiscount(product) {
  if (!product) return 0
  const seed = hashString(product.id ?? product.slug ?? product.name)
  return 10 + (seed % 9) * 5 // 10% - 50%, kelipatan 5
}

export function getOriginalPrice(price, discountPercent) {
  const num = Number(price)
  if (!Number.isFinite(num) || !discountPercent || discountPercent <= 0 || discountPercent >= 100) return null
  const original = num / (1 - discountPercent / 100)
  return Math.round(original / 100) * 100 // bulatkan ke ratusan agar rapi
}

