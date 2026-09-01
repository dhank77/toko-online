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
