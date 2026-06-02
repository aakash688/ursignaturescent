import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get, del } from '../../api/client'

type Product = { id: string; name: string; slug: string; is_active?: boolean }

export default function AdminProducts() {
  const [data, setData] = useState<{ data: Product[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    get<{ data: Product[] }>('/api/admin/products')
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try {
      await del(`/api/admin/products/${id}`)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  if (loading) return <div className="text-smoke">Loading…</div>
  if (error) return <div className="text-red-400">{error}</div>
  const products = data?.data ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display text-ivory">Products</h1>
        <Link to="/admin/products/new" className="px-4 py-2 rounded bg-gold text-noir font-medium hover:opacity-90">Add Product</Link>
      </div>
      {products.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-8 text-center text-smoke">
          <p className="mb-4">No products yet.</p>
          <Link to="/admin/products/new" className="text-gold hover:underline">Add your first product</Link>
        </div>
      ) : (
      <div className="border border-white/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-smoke bg-white/5">
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="p-3 text-ivory">{p.name}</td>
                <td className="p-3 text-smoke">{p.slug}</td>
                <td className="p-3">{p.is_active ? 'Active' : 'Inactive'}</td>
                <td className="p-3">
                  <Link to={`/admin/products/${p.id}`} className="text-gold mr-4">Edit</Link>
                  <button type="button" onClick={() => handleDelete(p.id)} className="text-red-400">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
