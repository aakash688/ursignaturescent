import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { get } from '../../api/client'

type Product = {
  id: string
  name: string
  slug: string
  description?: string
  images?: string[]
  product_variants?: { size_ml: number; price: number; id: string }[]
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    get<Product>(`/api/products?slug=${encodeURIComponent(slug)}`)
      .then(setProduct)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="p-8 text-smoke">Loading…</div>
  if (error || !product) return <div className="p-8 text-red-400">{error || 'Not found'}</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/products" className="text-sm text-gold mb-6 inline-block">← Products</Link>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full rounded-lg" />
          ) : (
            <div className="w-full aspect-square rounded-lg bg-white/5 flex items-center justify-center text-smoke">No image</div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-display text-ivory mb-4">{product.name}</h1>
          {product.description && <p className="text-smoke mb-6">{product.description}</p>}
          {product.product_variants?.length ? (
            <ul className="space-y-2">
              {product.product_variants.map((v) => (
                <li key={v.id} className="text-ivory">
                  {v.size_ml}ml — ₹{v.price}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  )
}
