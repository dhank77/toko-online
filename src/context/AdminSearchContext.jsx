import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Daftar menu admin yang bisa dicari lewat kolom pencarian di header.
 * - `searchable`: halaman tersebut punya daftar yang bisa disaring.
 * - `placeholder`: teks petunjuk kolom pencarian saat halaman itu aktif.
 * - `keywords`: kata kunci tambahan untuk saran menu (dropdown).
 */
export const ADMIN_SEARCH_TARGETS = [
  {
    to: '/admin/orders',
    label: 'Manajemen Pesanan',
    icon: 'shopping_cart',
    keywords: 'pesanan order transaksi pembeli invoice resi status',
    placeholder: 'Cari No. Pesanan, nama, atau email pembeli...',
    searchable: true,
  },
  {
    to: '/admin/products',
    label: 'Manajemen Produk',
    icon: 'inventory_2',
    keywords: 'produk barang stok varian harga katalog',
    placeholder: 'Cari nama produk atau deskripsi...',
    searchable: true,
  },
  {
    to: '/admin/customers',
    label: 'CRM Pelanggan',
    icon: 'group',
    keywords: 'pelanggan customer pembeli user akun email',
    placeholder: 'Cari nama atau email pelanggan...',
    searchable: true,
  },
  {
    to: '/admin/categories',
    label: 'Data Master',
    icon: 'category',
    keywords: 'kategori master ikon slug',
    placeholder: 'Cari nama kategori atau slug...',
    searchable: true,
  },
  {
    to: '/admin/hero-slides',
    label: 'Hero Carousel',
    icon: 'view_carousel',
    keywords: 'hero slide banner carousel judul',
    placeholder: 'Cari judul atau badge slide...',
    searchable: true,
  },
  {
    to: '/admin/analytics',
    label: 'Analitik',
    icon: 'analytics',
    keywords: 'analitik laporan statistik penjualan omzet',
    placeholder: 'Cari pesanan, pelanggan, atau produk...',
    searchable: false,
  },
  {
    to: '/admin',
    label: 'Dashboard',
    icon: 'dashboard',
    keywords: 'dashboard ringkasan utama home',
    placeholder: 'Cari pesanan, pelanggan, atau produk...',
    searchable: false,
  },
]

export function getAdminSearchTarget(pathname = '') {
  const path = String(pathname).replace(/\/+$/, '') || '/admin'
  return ADMIN_SEARCH_TARGETS.find((t) => t.to === path) || null
}

const AdminSearchContext = createContext(null)

// Nilai aman bila hook dipakai di luar provider (halaman tidak crash).
const FALLBACK = {
  query: '',
  version: 0,
  setQuery: () => {},
  submitSearch: () => {},
  clear: () => {},
}

export function AdminSearchProvider({ children }) {
  const location = useLocation()
  // query: teks pencarian global dari header admin (dibagi ke halaman aktif).
  // version: dinaikkan setiap submit / pindah menu agar halaman aktif dapat
  // bereaksi ulang walau teksnya sama (mis. tekan Enter dua kali).
  const [query, setQuery] = useState('')
  const [version, setVersion] = useState(0)

  const submitSearch = useCallback((text) => {
    setQuery(typeof text === 'string' ? text : '')
    setVersion((v) => v + 1)
  }, [])

  const clear = useCallback(() => {
    setQuery('')
    setVersion((v) => v + 1)
  }, [])

  // Saat berpindah menu: pakai kata kunci yang dikirim halaman sebelumnya
  // (mis. klik saran menu di header), kalau tidak ada dibersihkan supaya
  // kata kunci tidak menyaring halaman yang berbeda.
  useEffect(() => {
    const carried = location.state?.adminQuery
    setQuery(typeof carried === 'string' ? carried : '')
    setVersion((v) => v + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const value = useMemo(
    () => ({ query, version, setQuery, submitSearch, clear }),
    [query, version, submitSearch, clear]
  )

  return <AdminSearchContext.Provider value={value}>{children}</AdminSearchContext.Provider>
}

export function useAdminSearch() {
  return useContext(AdminSearchContext) || FALLBACK
}
