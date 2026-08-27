import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { api } from '../utils/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

const emptyCategory = { name: '', slug: '', icon: '' }

const CATEGORY_ICONS = [
  'shopping_bag', 'devices', 'chair', 'restaurant', 'fitness_center', 'directions_car',
  'pets', 'toys', 'book', 'movie', 'music_note', 'camera', 'computer', 'phone', 'watch',
  'eyeglasses', 'jewelry', 'cake', 'local_florist', 'local_grocery_store', 'local_pharmacy',
  'school', 'flight', 'train', 'directions_bike', 'sports_soccer', 'local_pizza', 'local_cafe',
  'local_dining', 'payments', 'account_balance', 'work', 'home', 'castle', 'forest', 'waves',
  'wb_sunny', 'nightlife', 'coffee', 'store', 'local_mall', 'local_convenience_store',
  'agriculture', 'water_drop', 'energy_savings_leaf', 'medical_services', 'local_hospital',
  'support_agent', 'security', 'code',
]

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ ...emptyCategory })
  const [modalMode, setModalMode] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const loadCategories = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await api.getCategories()
      setCategories(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

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

  const openCreate = () => {
    setModalMode('create')
    setForm({ ...emptyCategory })
  }

  const openEdit = (category) => {
    setModalMode('edit')
    setForm({ id: category.id, name: category.name, slug: category.slug, icon: category.icon || '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (modalMode === 'edit' && form.id) {
        await api.updateCategory(form.id, form)
        toast.success('Category updated successfully')
      } else {
        await api.createCategory(form)
        toast.success('Category created successfully')
      }
      await loadCategories()
      setForm({ ...emptyCategory })
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
      await api.deleteCategory(deleteId)
      toast.success('Category deleted successfully')
      await loadCategories()
      setDeleteId(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
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
          <h1 className="text-2xl font-bold text-foreground mb-1">Master Data</h1>
          <p className="text-sm text-muted-foreground">Manage categories for your store catalog.</p>
        </div>
        <Button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Slug</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider">Icon</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <TableRow key={idx} className="hover:bg-muted/50 transition-colors">
                      <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
                      <TableCell><div className="h-4 bg-muted rounded w-8 animate-pulse ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="4" className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No categories found. Create your first category to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-muted/50 transition-colors group">
                      <TableCell className="text-sm font-medium text-foreground">{category.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{category.slug}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {category.icon ? (
                            <>
                              <span className="material-symbols-outlined text-lg">{category.icon}</span>
                              <span className="text-sm text-muted-foreground">{category.icon}</span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            onClick={() => openEdit(category)}
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-primary"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </Button>
                          <Button
                            onClick={() => setDeleteId(category.id)}
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

      {/* Create / Edit Modal */}
      <Dialog open={!!modalMode} onOpenChange={(open) => { if (!open) { setModalMode(null); setForm({ ...emptyCategory }) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{modalMode === 'edit' ? 'Edit Category' : 'New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                value={form.name}
                onChange={handleNameChange}
                required
                placeholder="Category name"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                required
                placeholder="category-slug"
              />
            </div>
            <div>
              <Label>Icon</Label>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-64 overflow-y-auto p-3 bg-muted/50 border border-border rounded-lg mt-2">
                {CATEGORY_ICONS.map((icon) => {
                  const selected = form.icon === icon
                  return (
                    <Button
                      key={icon}
                      type="button"
                      variant={selected ? "default" : "ghost"}
                      onClick={() => setForm((prev) => ({ ...prev, icon }))}
                      className="flex flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-colors h-auto"
                    >
                      <span className="material-symbols-outlined text-lg">{icon}</span>
                    </Button>
                  )
                })}
              </div>
              {form.icon && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="material-symbols-outlined">{form.icon}</span>
                  <span>Selected: {form.icon}</span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setModalMode(null); setForm({ ...emptyCategory }) }}
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

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
