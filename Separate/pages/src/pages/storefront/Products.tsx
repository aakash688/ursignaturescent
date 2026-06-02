import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get } from '../../api/client'

type Product = { id: string; name: string; slug: string; images?: string[]; tagline?: string }

export default function Products() {
  const [data, setData] = useState<{ data: Product[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    get<{ data: Product[] }>('/api/products')
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-12 text-smoke">Loading…</div>
  if (error) return <div className="max-w-6xl mx-auto px-4 py-12 text-red-400">{error}</div>
  const products = data?.data ?? []

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display text-ivory mb-8">Products</h1>
      {products.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-12 text-center text-smoke">
          <p className="mb-4">No products available at the moment.</p>
          <Link to="/" className="text-gold hover:underline">Back to home</Link>
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((p) => (
          <Link
            key={p.id}
            to={`/product/${p.slug}`}
            className="block rounded-lg border border-white/10 overflow-hidden hover:border-gold/50 transition-colors"
          >
            {p.images?.[0] ? (
              <img src={p.images[0]} alt={p.name} className="w-full aspect-square object-cover" />
            ) : (
              <div className="w-full aspect-square bg-white/5 flex items-center justify-center text-smoke text-sm">No image</div>
            )}
            <div className="p-4">
              <h2 className="font-display text-ivory">{p.name}</h2>
              {p.tagline && <p className="text-sm text-smoke">{p.tagline}</p>}
            </div>
          </Link>
        ))}
      </div>
      )}
    </div>
  )
}
