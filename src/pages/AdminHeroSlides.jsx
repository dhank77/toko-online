import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { api } from '../utils/api'
import { supabase } from '../utils/supabaseClient'
import { compressImage, formatFileSize } from '../utils/imageCompress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

const emptySlide = {
  img: '',
  badge: '',
  title: '',
  description: '',
  cta_label: '',
  cta_href: '',
  secondary_cta_label: '',
  secondary_cta_href: '',
  sort_order: 0,
  is_active: true,
}

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ ...emptySlide })
  const [modalMode, setModalMode] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const loadSlides = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getAdminHeroSlides()
      setSlides(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSlides()
  }, [])

  const openCreate = () => {
    setModalMode('create')
    setForm({ ...emptySlide })
  }

  const openEdit = (slide) => {
    setModalMode('edit')
    setForm({
      id: slide.id,
      img: slide.img || '',
      badge: slide.badge || '',
      title: slide.title || '',
      description: slide.description || '',
      cta_label: slide.cta_label || '',
      cta_href: slide.cta_href || '',
      secondary_cta_label: slide.secondary_cta_label || '',
      secondary_cta_href: slide.secondary_cta_href || '',
      sort_order: slide.sort_order ?? 0,
      is_active: slide.is_active ?? true,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        badge: form.badge || null,
        description: form.description || null,
        cta_label: form.cta_label || null,
        cta_href: form.cta_href || null,
        secondary_cta_label: form.secondary_cta_label || null,
        secondary_cta_href: form.secondary_cta_href || null,
      }
      if (modalMode === 'edit' && form.id) {
        await api.updateHeroSlide(form.id, payload)
        toast.success('Slide berhasil diperbarui')
      } else {
        await api.createHeroSlide(payload)
        toast.success('Slide berhasil dibuat')
      }
      await loadSlides()
      setForm({ ...emptySlide })
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
      await api.deleteHeroSlide(deleteId)
      toast.success('Slide berhasil dihapus')
      await loadSlides()
      setDeleteId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (slide) => {
    try {
      await api.updateHeroSlide(slide.id, { is_active: !slide.is_active })
      toast.success(slide.is_active ? 'Slide dinonaktifkan' : 'Slide diaktifkan')
      await loadSlides()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReorder = async (slide, direction) => {
    const newOrder = slide.sort_order + direction
    if (newOrder < 0) return
    try {
      await api.updateHeroSlide(slide.id, { sort_order: newOrder })
      const adjacent = slides.find(s => s.sort_order === newOrder && s.id !== slide.id)
      if (adjacent) {
        await api.updateHeroSlide(adjacent.id, { sort_order: slide.sort_order })
      }
      await loadSlides()
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
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.82,
      })
      const compressedSize = compressed.size

      const fileExt = compressed.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`
      const filePath = `hero-slides/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, compressed, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      setForm((prev) => ({ ...prev, img: urlData.publicUrl }))

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
    setForm((prev) => ({ ...prev, img: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
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
          <h1 className="text-2xl font-bold text-foreground mb-1">Hero Carousel</h1>
          <p className="text-sm text-muted-foreground">Kelola slide banner di halaman utama toko.</p>
        </div>
        <Button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Slide Baru
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs uppercase tracking-wider w-12">Urutan</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Gambar</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Judul</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Badge</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                      <TableCell><div className="h-4 bg-muted rounded w-8 animate-pulse" /></TableCell>
                      <TableCell><div className="h-10 w-16 bg-muted rounded animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-40 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-8 animate-pulse ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : slides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="6" className="px-6 py-12 text-center text-sm text-muted-foreground">
                      Tidak ada slide ditemukan. Buat slide pertama Anda untuk memulai.
                    </TableCell>
                  </TableRow>
                ) : (
                  slides.map((slide) => (
                    <TableRow key={slide.id} className="hover:bg-muted/50 transition-colors group">
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => handleReorder(slide, -1)}
                            disabled={slide.sort_order === 0}
                          >
                            <span className="material-symbols-outlined text-sm">arrow_upward</span>
                          </Button>
                          <span className="text-sm font-medium text-foreground w-6 text-center">{slide.sort_order}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={() => handleReorder(slide, 1)}
                          >
                            <span className="material-symbols-outlined text-sm">arrow_downward</span>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {slide.img ? (
                          <img
                            src={slide.img}
                            alt={slide.title}
                            className="h-10 w-16 object-cover rounded-md border border-border"
                          />
                        ) : (
                          <div className="h-10 w-16 rounded-md border border-dashed border-border flex items-center justify-center">
                            <span className="material-symbols-outlined text-muted-foreground text-sm">image</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground max-w-xs truncate">
                        {slide.title}
                      </TableCell>
                      <TableCell>
                        {slide.badge ? (
                          <Badge variant="secondary" className="text-xs">{slide.badge}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(slide)}
                          className={`text-xs ${slide.is_active ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          <span className="material-symbols-outlined text-sm mr-1">
                            {slide.is_active ? 'visibility' : 'visibility_off'}
                          </span>
                          {slide.is_active ? 'Aktif' : 'Nonaktif'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            onClick={() => openEdit(slide)}
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-primary"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </Button>
                          <Button
                            onClick={() => setDeleteId(slide.id)}
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

      {/* Create / Edit Modal */}
      <Dialog open={!!modalMode} onOpenChange={(open) => { if (!open) { setModalMode(null); setForm({ ...emptySlide }) } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalMode === 'edit' ? 'Edit Slide' : 'Slide Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <Label>Gambar Slide *</Label>
              <div className="mt-1.5 space-y-2">
                {form.img ? (
                  <div className="relative group w-full max-w-[400px]">
                    <img
                      src={form.img}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-md border border-border"
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
                    htmlFor="hero-slide-image-upload"
                    className="flex flex-col items-center justify-center w-full max-w-[400px] h-48 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-muted-foreground mb-1">image</span>
                    <span className="text-xs text-muted-foreground">
                      {uploading ? 'Mengunggah...' : 'Klik untuk mengunggah gambar'}
                    </span>
                  </label>
                )}
              </div>
              {form.img && (
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
                id="hero-slide-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="sr-only"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Judul Slide *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  required
                  placeholder="Judul utama slide"
                />
              </div>
              <div>
                <Label htmlFor="badge">Badge Label</Label>
                <Input
                  id="badge"
                  value={form.badge}
                  onChange={(e) => updateField('badge', e.target.value)}
                  placeholder="Badge teks (opsional)"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Deskripsi singkat slide"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cta_label">CTA Utama - Label</Label>
                <Input
                  id="cta_label"
                  value={form.cta_label}
                  onChange={(e) => updateField('cta_label', e.target.value)}
                  placeholder="Teks tombol CTA"
                />
              </div>
              <div>
                <Label htmlFor="cta_href">CTA Utama - Link</Label>
                <Input
                  id="cta_href"
                  value={form.cta_href}
                  onChange={(e) => updateField('cta_href', e.target.value)}
                  placeholder="#kategori atau /url"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="secondary_cta_label">CTA Sekunder - Label</Label>
                <Input
                  id="secondary_cta_label"
                  value={form.secondary_cta_label}
                  onChange={(e) => updateField('secondary_cta_label', e.target.value)}
                  placeholder="Teks tombol sekunder (opsional)"
                />
              </div>
              <div>
                <Label htmlFor="secondary_cta_href">CTA Sekunder - Link</Label>
                <Input
                  id="secondary_cta_href"
                  value={form.secondary_cta_href}
                  onChange={(e) => updateField('secondary_cta_href', e.target.value)}
                  placeholder="#flash-sale atau /url"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sort_order">Urutan Tampil</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => updateField('sort_order', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => updateField('is_active', e.target.checked)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm font-medium text-foreground">Aktif</span>
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setModalMode(null); setForm({ ...emptySlide }) }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={saving || uploading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? 'Menyimpan...' : modalMode === 'edit' ? 'Perbarui' : 'Buat'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Slide</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus slide ini? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
