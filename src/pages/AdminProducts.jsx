import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { api } from '../utils/api'
import { supabase } from '../utils/supabaseClient'
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

  const loadProducts = async (pageNum = 1) => {
    setLoading(true)
    setError('')
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(pageNum, limit),
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
  }, [page])

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
        toast.success('Product updated successfully')
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
        toast.success('Product created successfully')
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
      toast.success('Product deleted successfully')
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
      toast.success('Variant added')
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
      toast.success('Variant updated')
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
      toast.success('Variant deleted')
      setDeleteVariantId(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setUploading(true)
    setError('')
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }))
      toast.success('Image uploaded')
    } catch (err) {
      setError(err.message || 'Failed to upload image')
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
          <h1 className="text-2xl font-bold text-foreground mb-1">Product Management</h1>
          <p className="text-sm text-muted-foreground">Create and manage products and their variants.</p>
        </div>
        <Button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Product
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs uppercase tracking-wider w-12">Image</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Slug</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Price</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Category</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">In Stock</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-right">Actions</TableHead>
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
                      No products found. Create your first product to get started.
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
                      <TableCell className="text-sm text-muted-foreground">${Number(product.price).toFixed(2)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{product.categories?.name || '-'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${product.in_stock ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                          {product.in_stock ? 'In Stock' : 'Out of Stock'}
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
                            title="Delete"
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
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Button>
        </div>
      )}

      <Dialog open={!!modalMode} onOpenChange={(open) => { if (!open) { setModalMode(null); setForm({ ...emptyProduct }); setVariants([]) } }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{modalMode === 'edit' ? 'Edit Product' : 'New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={handleNameChange}
                  required
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  required
                  placeholder="product-slug"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Product Image</Label>
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
                        {uploading ? 'Uploading...' : 'Click to upload'}
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
                      {uploading ? 'Uploading...' : 'Replace image'}
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
                <Label htmlFor="badge">Badge</Label>
                <Input
                  id="badge"
                  value={form.badge}
                  onChange={(e) => setForm((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="e.g. New, Sale"
                />
              </div>
              <div>
                <Label htmlFor="category_id">Category</Label>
                <select
                  id="category_id"
                  value={form.category_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="">No category</option>
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
                <Label htmlFor="in_stock" className="text-sm font-medium text-foreground">In Stock</Label>
              </div>
            </div>

            {modalMode === 'edit' && (
              <div className="space-y-4 border-t border-border pt-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-2">Variants</h3>
                  <div className="space-y-2">
                    {variants.length === 0 && (
                      <p className="text-xs text-muted-foreground">No variants yet.</p>
                    )}
                    {variants.map((variant) => (
                      <div key={variant.id} className="flex items-center gap-2">
                        <Input
                          value={variant.name}
                          onChange={(e) => handleUpdateVariant(variant.id, { name: e.target.value })}
                          className="flex-1"
                          placeholder="Variant name"
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={variant.price_adjustment}
                          onChange={(e) => handleUpdateVariant(variant.id, { price_adjustment: Number(e.target.value) })}
                          className="w-28"
                          placeholder="Adj."
                        />
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleUpdateVariant(variant.id, { stock: Number(e.target.value) })}
                          className="w-24"
                          placeholder="Stock"
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
                    placeholder="New variant name"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={variantForm.price_adjustment}
                    onChange={(e) => setVariantForm((prev) => ({ ...prev, price_adjustment: e.target.value }))}
                    placeholder="Adj."
                    className="w-28"
                  />
                  <Input
                    type="number"
                    value={variantForm.stock}
                    onChange={(e) => setVariantForm((prev) => ({ ...prev, stock: e.target.value }))}
                    placeholder="Stock"
                    className="w-24"
                  />
                  <Button type="button" onClick={handleAddVariant} disabled={savingVariant} size="sm" className="whitespace-nowrap">
                    {savingVariant ? 'Adding...' : 'Add Variant'}
                  </Button>
                </div>
              </div>
            )}

            <Dialog open={!!deleteVariantId} onOpenChange={(open) => { if (!open) setDeleteVariantId(null) }}>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Delete Variant</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete this variant? This action cannot be undone.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteVariantId(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleDeleteVariant} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? 'Saving...' : modalMode === 'edit' ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
