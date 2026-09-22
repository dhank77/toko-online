import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AdminSearchContext = createContext(null)

export function AdminSearchProvider({ children }) {
  // query: teks pencarian global dari header admin.
  // version: dinaikkan setiap submit agar halaman yang sedang aktif
  // ikut menerapkan pencarian walau teksnya sama (mis. tekan Enter 2x).
  const [query, setQuery] = useState('')
  const [version, setVersion] = useState(0)

  const submitSearch = useCallback((text) => {
    setQuery(text || '')
    setVersion((v) => v + 1)
  }, [])

  const value = useMemo(() => ({ query, version, submitSearch }), [query, version, submitSearch])
  return <AdminSearchContext.Provider value={value}>{children}</AdminSearchContext.Provider>
}

export function useAdminSearch() {
  return useContext(AdminSearchContext)
}
