'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface CategoryRow {
  id: string
  name: string
  slug: string
  description: string | null
  product_count?: number
  sort_order: number
  is_active: boolean
}

export default function AdminCategoriesPage() {
  const [list, setList] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', sort_order: 0, is_active: true })
  const [saveLoading, setSaveLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((d) => {
        setList(Array.isArray(d) ? d : d.data ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const openAdd = () => {
    setForm({ name: '', slug: '', description: '', sort_order: 0, is_active: true })
    setEditing(null)
    setModal('add')
  }

  const openEdit = (c: CategoryRow) => {
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? '',
      sort_order: c.sort_order ?? 0,
      is_active: c.is_active ?? true,
    })
    setEditing(c)
    setModal('edit')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    const url = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories'
    const method = editing ? 'PUT' : 'POST'
    const body = editing
      ? { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') }
      : { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') }
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaveLoading(false)
    if (res.ok) {
      setModal(null)
      load()
    } else {
      const err = await res.json()
      alert(err.error || 'Failed to save')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? It will fail if products are linked.')) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setList((prev) => prev.filter((x) => x.id !== id))
      setDeleteId(null)
    } else {
      const err = await res.json()
      alert(err.error || 'Delete failed')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-2xl text-ivory">Categories</h1>
        <Button onClick={openAdd}>Add Category</Button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-smoke">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-smoke">
                <th className="p-3">Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Products</th>
                <th className="p-3">Order</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 text-ivory">{c.name}</td>
                  <td className="p-3 text-smoke">{c.slug}</td>
                  <td className="p-3 text-smoke">{c.product_count ?? 0}</td>
                  <td className="p-3 text-smoke">{c.sort_order}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${c.is_active ? 'bg-green-900/30 text-green-400' : 'bg-white/10 text-smoke'}`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    <button type="button" onClick={() => openEdit(c)} className="text-gold hover:underline text-xs">
                      Edit
                    </button>
                    {deleteId === c.id ? (
                      <button type="button" onClick={() => handleDelete(c.id)} className="text-red-400 hover:underline text-xs">
                        Confirm
                      </button>
                    ) : (
                      <button type="button" onClick={() => setDeleteId(c.id)} className="text-smoke hover:text-red-400 text-xs">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && list.length === 0 && <p className="p-12 text-center text-smoke">No categories.</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setModal(null)}>
          <div className="bg-noir border border-white/10 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg text-ivory mb-4">{editing ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={submit} className="space-y-4">
              <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
              <Input label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto from name" />
              <div>
                <label className="block text-sm text-smoke mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-ivory text-sm"
                  rows={2}
                />
              </div>
              <Input
                label="Sort order"
                type="number"
                value={String(form.sort_order)}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value, 10) || 0 }))}
              />
              <label className="flex items-center gap-2 text-sm text-ivory">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
                Active
              </label>
              <div className="flex gap-2 pt-2">
                <Button type="submit" loading={saveLoading} disabled={saveLoading}>
                  Save
                </Button>
                <Button type="button" variant="outline" onClick={() => setModal(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
