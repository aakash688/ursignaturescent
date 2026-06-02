import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { get, put, del } from '../../api/client'

type Product = { id: string; name: string; slug: string; description?: string }

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    get<Product>(`/api/admin/products/${id}`)
      .then((p) => {
        setProduct(p)
        setName(p.name)
        setSlug(p.slug)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    setError(null)
    try {
      await put(`/api/admin/products/${id}`, { name, slug, variants: [], category_ids: [] })
      navigate('/admin/products')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('Delete this product?')) return
    try {
      await del(`/api/admin/products/${id}`)
      navigate('/admin/products')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  if (loading) return <div className="text-smoke">Loading…</div>
  if (error || !product) return <div className="text-red-400">{error || 'Not found'}</div>

  return (
    <div>
      <h1 className="text-2xl font-display text-ivory mb-6">Edit Product</h1>
      <form onSubmit={handleSave} className="max-w-md space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory placeholder:text-smoke focus:border-gold outline-none"
        />
        <input
          type="text"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory placeholder:text-smoke focus:border-gold outline-none"
        />
        {error && <p className="text-red-400">{error}</p>}
        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-gold text-noir font-medium disabled:opacity-50">
            {saving ? '…' : 'Save'}
          </button>
          <button type="button" onClick={handleDelete} className="px-4 py-2 rounded border border-red-400 text-red-400">
            Delete
          </button>
        </div>
      </form>
    </div>
  )
}
