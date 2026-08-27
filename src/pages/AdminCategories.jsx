import { useState, useEffect } from 'react'
import { api } from '../utils/api'

const emptyCategory = { name: '', slug: '', icon: '' }

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
      } else {
        await api.createCategory(form)
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
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-error-container text-error px-md py-sm rounded-lg shadow-lg font-label-md">
          {error}
        </div>
      )}

      <div className="mb-lg flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Master Data</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage categories for your store catalog.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-xs bg-primary text-on-primary px-sm py-xs rounded-xl font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Category
        </button>
      </div>

      <div className="glass-card rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container text-on-surface-variant">
                <th className="px-md py-sm font-label-sm text-label-sm uppercase tracking-wider">Name</th>
                <th className="px-md py-sm font-label-sm text-label-sm uppercase tracking-wider">Slug</th>
                <th className="px-md py-sm font-label-sm text-label-sm uppercase tracking-wider">Icon</th>
                <th className="px-md py-sm font-label-sm text-label-sm uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-md py-md"><div className="h-4 bg-surface-variant rounded w-32 animate-pulse" /></td>
                    <td className="px-md py-md"><div className="h-4 bg-surface-variant rounded w-24 animate-pulse" /></td>
                    <td className="px-md py-md"><div className="h-4 bg-surface-variant rounded w-16 animate-pulse" /></td>
                    <td className="px-md py-md"><div className="h-4 bg-surface-variant rounded w-8 animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-md py-xl text-center font-body-md text-body-md text-on-surface-variant">
                    No categories found. Create your first category to get started.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-md py-md font-label-md text-label-md text-on-surface">{category.name}</td>
                    <td className="px-md py-md font-body-sm text-body-sm text-on-surface-variant">{category.slug}</td>
                    <td className="px-md py-md font-body-sm text-body-sm text-on-surface-variant">{category.icon || '-'}</td>
                    <td className="px-md py-md">
                      <div className="flex items-center justify-end gap-xs">
                        <button
                          onClick={() => openEdit(category)}
                          className="p-xs text-on-surface-variant hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteId(category.id)}
                          className="p-xs text-on-surface-variant hover:text-error transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-gutter">
          <div className="bg-surface rounded-xl shadow-elevated w-full max-w-md">
            <div className="p-md border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">{modalMode === 'edit' ? 'Edit Category' : 'New Category'}</h3>
              <button
                onClick={() => { setModalMode(null); setForm({ ...emptyCategory }) }}
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-md space-y-md">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-xs">Name</label>
                <input
                  value={form.name}
                  onChange={handleNameChange}
                  required
                  className="w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-xs">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  required
                  className="w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="category-slug"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-xs">Icon</label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-sm py-xs bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Optional icon name"
                />
              </div>
              <div className="flex justify-end gap-sm pt-sm">
                <button
                  type="button"
                  onClick={() => { setModalMode(null); setForm({ ...emptyCategory }) }}
                  className="px-sm py-xs rounded-lg font-label-md text-label-md text-on-surface-variant border border-outline-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-sm py-xs bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors disabled:opacity-60"
                >
                    {saving ? 'Saving...' : modalMode === 'edit' ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-gutter">
          <div className="bg-surface rounded-xl shadow-elevated w-full max-w-sm">
            <div className="p-md">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Delete Category</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Are you sure you want to delete this category? This action cannot be undone.
              </p>
            </div>
            <div className="p-md border-t border-outline-variant flex justify-end gap-sm">
              <button
                onClick={() => setDeleteId(null)}
                className="px-sm py-xs rounded-lg font-label-md text-label-md text-on-surface-variant border border-outline-variant hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-sm py-xs bg-error text-on-error rounded-lg font-label-md text-label-md hover:bg-error-container transition-colors disabled:opacity-60"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
