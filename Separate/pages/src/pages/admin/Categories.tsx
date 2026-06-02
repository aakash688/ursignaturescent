import { useEffect, useState } from 'react'
import { get } from '../../api/client'

type Category = { id: string; name: string; slug: string; product_count?: number }

export default function AdminCategories() {
  const [list, setList] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    get<Category[]>('/api/admin/categories').then(setList).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(() => load(), [])

  if (loading) return <div className="text-smoke">Loading…</div>
  if (error) return <div className="text-red-400">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-display text-ivory mb-6">Categories</h1>
      {list.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-8 text-center text-smoke">
          No categories yet.
        </div>
      ) : (
      <div className="border border-white/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-smoke bg-white/5">
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Products</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-b border-white/5">
                <td className="p-3 text-ivory">{c.name}</td>
                <td className="p-3 text-smoke">{c.slug}</td>
                <td className="p-3 text-smoke">{c.product_count ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
