import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { post } from '../../api/client'

export default function ProductNew() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await post('/api/admin/products', {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        category_ids: [],
        variants: [{ size_ml: 50, price: 0, stock_quantity: 0 }],
      })
      navigate('/admin/products')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-display text-ivory mb-6">Add Product</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-')); }}
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
        <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-gold text-noir font-medium disabled:opacity-50">
          {loading ? '…' : 'Create'}
        </button>
      </form>
    </div>
  )
}
