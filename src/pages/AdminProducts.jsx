import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { api } from '../utils/api'
import { useAdminSearch } from '../context/AdminSearchContext'
import { supabase } from '../utils/supabaseClient'
import { compressImage, formatFileSize } from '../utils/imageCompress'
import { formatRupiah } from '../lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

const emptyProduct = {
  name: '',
  slug: '',
  description: '',
  price: '',
  image_url: '',
  badge: '',
  category_id: '',
  in_stock: true,
}

const emptyVariant = { name: '', price_adjustment: '', stock: '' }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 12
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ ...emptyProduct })
  const [modalMode, setModalMode] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteVariantId, setDeleteVariantId] = useState(null)
  const [variants, setVariants] = useState([])
  const [variantForm, setVariantForm] = useState({ ...emptyVariant })
  const [savingVariant, setSavingVariant] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  // Kata kunci berasal dari kolom pencarian di header admin (state global),
  // sehingga kolom di halaman ini dan di header selalu sinkron.
  const { query: search, setQuery: setSearch, submitSearch, version: searchVersion } = useAdminSearch()
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortField, setSortField] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Kembali ke halaman 1 setiap kata kunci berubah (termasuk dari header admin).
  useEffect(() => {
    setPage(1)
  }, [search])

  // Tekan Enter di header / pindah menu: langsung terapkan tanpa menunggu debounce.
  useEffect(() => {
    setDebouncedSearch(search)
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchVersion])

  const loadProducts = async (pageNum = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (debouncedSearch) params.search = debouncedSearch
      if (categoryFilter) params.category = categoryFilter
      if (sortField) params.sort = sortField
      if (sortOrder) params.order = sortOrder

      const [productsData, categoriesData] = await Promise.all([
        api.getAdminProducts(pageNum, limit, params),
        api.getCategories(),
      ])
      setProducts(productsData.data)
      setCategories(categoriesData)
      setPage(pageNum)
      setTotalPages(productsData.pagination.totalPages)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts(page)
  }, [page, debouncedSearch, categoryFilter, sortField, sortOrder])

  const generateSlug = (name) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')

  const handleNameChange = (e) => {
    const name = e.target.value
    setForm((prev) => ({ ...prev, name, slug: generateSlug(name) }))
  }

  const openCreate = async () => {
    setModalMode('create')
    setForm({ ...emptyProduct })
    setVariants([])
  }

  const openEdit = async (product) => {
    setModalMode('edit')
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: String(product.price ?? ''),
      image_url: product.image_url || '',
      badge: product.badge || '',
      category_id: product.category_id || '',
      in_stock: product.in_stock ?? true,
    })
    try {
      const data = await api.getVariants(product.id)
      setVariants(data)
    } catch {
      setVariants([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (modalMode === 'edit' && form.id) {
        await api.updateProduct(form.id, {
          name: form.name,
          slug: form.slug,
          description: form.description,
          price: Number(form.price),
          image_url: form.image_url,
          badge: form.badge,
          category_id: form.category_id || null,
          in_stock: form.in_stock,
        })
        toast.success('Produk berhasil diperbarui')
      } else {
        await api.createProduct({
          name: form.name,
          slug: form.slug,
          description: form.description,
          price: Number(form.price),
          image_url: form.image_url,
          badge: form.badge,
          category_id: form.category_id || null,
          in_stock: form.in_stock,
        })
        toast.success('Produk berhasil dibuat')
      }
      await loadProducts(page)
      setForm({ ...emptyProduct })
      setVariants([])
      setModalMode(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setSaving(true)
    setError('')
    try {
      await api.deleteProduct(deleteId)
      toast.success('Produk berhasil dihapus')
      await loadProducts()
      setDeleteId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddVariant = async (e) => {
    e.preventDefault()
    if (!form.id) return
    setSavingVariant(true)
    setError('')
    try {
      const created = await api.createVariant(form.id, {
        name: variantForm.name,
        price_adjustment: Number(variantForm.price_adjustment || 0),
        stock: Number(variantForm.stock || 0),
      })
      setVariants((prev) => [...prev, created])
      setVariantForm({ ...emptyVariant })
      toast.success('Varian berhasil ditambahkan')
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingVariant(false)
    }
  }

  const handleUpdateVariant = async (id, updates) => {
    setError('')
    try {
      const updated = await api.updateVariant(id, updates)
      setVariants((prev) => prev.map((v) => (v.id === id ? updated : v)))
      toast.success('Varian berhasil diperbarui')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteVariant = async () => {
    if (!deleteVariantId) return
    setError('')
    try {
      await api.deleteVariant(deleteVariantId)
      setVariants((prev) => prev.filter((v) => v.id !== deleteVariantId))
      toast.success('Varian berhasil dihapus')
      setDeleteVariantId(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Silakan pilih file gambar')
      return
    }

    const MAX_SIZE = 10 * 1024 * 1024 // 10MB before compression
    if (file.size > MAX_SIZE) {
      toast.error(`Gambar terlalu besar (${formatFileSize(file.size)}). Maksimal ${formatFileSize(MAX_SIZE)}`)
      return
    }

    setUploading(true)
    setError('')
    try {
      // Compress image before upload
      const originalSize = file.size
      const compressed = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.82,
      })
      const compressedSize = compressed.size

      const fileExt = compressed.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, compressed, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }))

      if (compressedSize < originalSize) {
        const saved = ((1 - compressedSize / originalSize) * 100).toFixed(0)
        toast.success(`Gambar dikompresi ${saved}% (${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)})`)
      } else {
        toast.success('Gambar berhasil diunggah')
      }
    } catch (err) {
      setError(err.message || 'Gagal mengunggah gambar')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-destructive/10 text-destructive px-6 py-3 rounded-lg shadow-lg font-medium border border-destructive/20">
          {error}
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Manajemen Produk</h1>
          <p className="text-sm text-muted-foreground">Buat dan kelola produk serta variannya.</p>
        </div>
        <Button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-lg">add</span>
           Produk Baru
        </Button>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
          <Input
             placeholder="Cari nama produk atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitSearch(search) } }}
            className="pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border rounded-md bg-background text-sm"
        >
           <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={sortField}
          onChange={(e) => { setSortField(e.target.value); setPage(1) }}
          className="px-3 py-2 border rounded-md bg-background text-sm"
        >
           <option value="created_at">Urut: Tanggal</option>
           <option value="name">Urut: Nama</option>
           <option value="price">Urut: Harga</option>
           <option value="rating">Urut: Rating</option>
           <option value="review_count">Urut: Ulasan</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => { setSortOrder(e.target.value); setPage(1) }}
          className="px-3 py-2 border rounded-md bg-background text-sm"
        >
           <option value="desc">Menurun</option>
           <option value="asc">Meningkat</option>
        </select>
      </div>

      {!loading && (search.trim() || categoryFilter) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Menampilkan <span className="font-semibold text-foreground">{products.length}</span> produk
            {search.trim() ? <> untuk &quot;{search.trim()}&quot;</> : null}
            {categoryFilter ? <> pada kategori terpilih</> : null} · halaman {page} dari {totalPages}.
          </span>
          <button
            type="button"
            onClick={() => { setSearch(''); setCategoryFilter('') }}
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>Bersihkan pencarian
          </button>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                   <TableHead className="text-xs uppercase tracking-wider w-12">Gambar</TableHead>
                   <TableHead className="text-xs uppercase tracking-wider">Nama</TableHead>
                   <TableHead className="text-xs uppercase tracking-wider">Slug</TableHead>
                   <TableHead className="text-xs uppercase tracking-wider">Harga</TableHead>
                   <TableHead className="text-xs uppercase tracking-wider">Kategori</TableHead>
                   <TableHead className="text-xs uppercase tracking-wider">Stok</TableHead>
                   <TableHead className="text-xs uppercase tracking-wider text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                      <TableCell><div className="h-10 w-10 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-40 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-28 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-12 animate-pulse" /></TableCell>
                      <TableCell><div className="h-8 bg-muted rounded w-16 animate-pulse ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : products.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan="7" className="px-6 py-12 text-center text-sm text-muted-foreground">
                       {search.trim() || categoryFilter
                         ? 'Tidak ada produk yang cocok dengan pencarian/filter Anda.'
                         : 'Tidak ada produk ditemukan. Buat produk pertama Anda untuk memulai.'}
                       {(search.trim() || categoryFilter) && (
                         <div className="mt-3">
                           <Button variant="outline" size="sm" onClick={() => { setSearch(''); setCategoryFilter('') }}>
                             Bersihkan pencarian
                           </Button>
                         </div>
                       )}
                     </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/50 transition-colors group">
                      <TableCell>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-10 w-10 object-cover rounded-md border border-border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md border border-dashed border-border flex items-center justify-center">
                            <span className="material-symbols-outlined text-muted-foreground text-sm">image</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{product.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{product.slug}</TableCell>
                      <TableCell className="text-sm font-semibold text-foreground">{formatRupiah(product.price)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{product.categories?.name || '-'}</TableCell>
                      <TableCell>
                           <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${product.in_stock ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                           {product.in_stock ? 'Stok Tersedia' : 'Stok Habis'}
                         </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            onClick={() => openEdit(product)}
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-primary"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </Button>
                          <Button
                            onClick={() => setDeleteId(product.id)}
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                             title="Hapus"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
             Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">
             Halaman {page} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
             Selanjutnya
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Button>
        </div>
      )}

      <Dialog open={!!modalMode} onOpenChange={(open) => { if (!open) { setModalMode(null); setForm({ ...emptyProduct }); setVariants([]) } }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
             <DialogTitle>{modalMode === 'edit' ? 'Edit Produk' : 'Produk Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={handleNameChange}
                  required
                  placeholder="Nama produk"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  required
                  placeholder="slug-produk"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi produk"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="price">Harga (Rp)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">Rp</span>
                  <Input
                    id="price"
                    type="number"
                    step="1000"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    required
                    placeholder="0"
                    className="pl-9"
                  />
                </div>
                {form.price && <p className="text-xs text-muted-foreground mt-1">{formatRupiah(form.price)}</p>}
              </div>
              <div>
                <Label>Gambar Produk</Label>
                <div className="mt-1.5 space-y-2">
                  {form.image_url ? (
                    <div className="relative group w-full max-w-[200px]">
                      <img
                        src={form.image_url}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-md border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleRemoveImage}
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="product-image-upload"
                      className="flex flex-col items-center justify-center w-full max-w-[200px] h-40 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-muted-foreground mb-1">image</span>
                      <span className="text-xs text-muted-foreground">
                         {uploading ? 'Mengunggah...' : 'Klik untuk mengunggah'}
                      </span>
                    </label>
                  )}
                </div>
                {form.image_url && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="text-xs"
                    >
                      <span className="material-symbols-outlined text-sm mr-1">upload</span>
                       {uploading ? 'Mengunggah...' : 'Ganti gambar'}
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  id="product-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="sr-only"
                />
              </div>
              <div>
                 <Label htmlFor="badge">Lencana</Label>
                <Input
                  id="badge"
                  value={form.badge}
                  onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
                   placeholder="misal: Baru, Diskon"
                />
              </div>
              <div>
                 <Label htmlFor="category_id">Kategori</Label>
                <select
                  id="category_id"
                  value={form.category_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                   <option value="">Tidak ada kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 md:col-span-2">
                <input
                  id="in_stock"
                  type="checkbox"
                  checked={form.in_stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, in_stock: e.target.checked }))}
                  className="h-4 w-4 rounded border-border"
                />
                 <Label htmlFor="in_stock" className="text-sm font-medium text-foreground">Stok Tersedia</Label>
              </div>
            </div>

            {modalMode === 'edit' && (
              <div className="space-y-4 border-t border-border pt-4">
                <div>
                   <h3 className="text-sm font-medium text-foreground mb-2">Varian</h3>
                  <div className="space-y-2">
                    {variants.length === 0 && (
                       <p className="text-xs text-muted-foreground">Belum ada varian.</p>
                    )}
                    {variants.map((variant) => (
                      <div key={variant.id} className="flex items-center gap-2">
                        <Input
                          value={variant.name}
                          onChange={(e) => handleUpdateVariant(variant.id, { name: e.target.value })}
                          className="flex-1"
                           placeholder="Nama varian"
                        />
                        <div className="relative w-32">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">Rp</span>
                          <Input
                            type="number"
                            step="1000"
                            value={variant.price_adjustment}
                            onChange={(e) => handleUpdateVariant(variant.id, { price_adjustment: Number(e.target.value) })}
                            className="pl-7"
                            placeholder="0"
                            title={variant.price_adjustment ? formatRupiah(variant.price_adjustment) : 'Penyesuaian harga'}
                          />
                        </div>
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleUpdateVariant(variant.id, { stock: Number(e.target.value) })}
                          className="w-24"
                           placeholder="Stok"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteVariantId(variant.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={variantForm.name}
                    onChange={(e) => setVariantForm((prev) => ({ ...prev, name: e.target.value }))}
                     placeholder="Nama varian baru"
                    className="flex-1"
                  />
                  <div className="relative w-32">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">Rp</span>
                    <Input
                      type="number"
                      step="1000"
                      value={variantForm.price_adjustment}
                      onChange={(e) => setVariantForm((prev) => ({ ...prev, price_adjustment: e.target.value }))}
                      placeholder="0"
                      className="pl-7"
                    />
                  </div>
                  <Input
                    type="number"
                    value={variantForm.stock}
                    onChange={(e) => setVariantForm((prev) => ({ ...prev, stock: e.target.value }))}
                     placeholder="Stok"
                    className="w-24"
                  />
                  <Button type="button" onClick={handleAddVariant} disabled={savingVariant} size="sm" className="whitespace-nowrap">
                     {savingVariant ? 'Menambahkan...' : 'Tambah Varian'}
                  </Button>
                </div>
              </div>
            )}

            <Dialog open={!!deleteVariantId} onOpenChange={(open) => { if (!open) setDeleteVariantId(null) }}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                   <DialogTitle>Hapus Varian</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                   <p className="text-sm text-muted-foreground">
                     Apakah Anda yakin ingin menghapus varian ini? Tindakan ini tidak dapat dibatalkan.
                   </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteVariantId(null)}>
                     Batal
                  </Button>
                  <Button onClick={handleDeleteVariant} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                     Hapus
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setModalMode(null); setForm({ ...emptyProduct }); setVariants([]) }}
              >
                 Batal
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                 {saving ? 'Menyimpan...' : modalMode === 'edit' ? 'Perbarui' : 'Buat'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
                   <DialogTitle>Hapus Produk</DialogTitle>
          </DialogHeader>
          <div className="py-4">
                   <p className="text-sm text-muted-foreground">
                     Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
                   </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
               Batal
            </Button>
            <Button onClick={handleDelete} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
               {saving ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
