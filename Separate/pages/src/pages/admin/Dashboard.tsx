import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get } from '../../api/client'

type CountRes = { count?: number; data?: unknown[] }

export default function Dashboard() {
  const [productsCount, setProductsCount] = useState<number | null>(null)
  const [ordersCount, setOrdersCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      get<CountRes>('/api/admin/products?limit=1').then((r) => r.count ?? 0),
      get<CountRes>('/api/admin/orders?limit=1').then((r) => r.count ?? 0),
    ])
      .then(([p, o]) => {
        setProductsCount(p)
        setOrdersCount(o)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="text-smoke">Loading…</div>
    )
  }
  if (error) {
    return (
      <div className="text-red-400">{error}</div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-display text-ivory mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          to="/admin/products"
          className="block p-6 rounded-lg border border-white/10 bg-white/5 hover:border-gold/50 transition-colors"
        >
          <p className="text-smoke text-sm mb-1">Products</p>
          <p className="text-2xl font-display text-ivory">{productsCount ?? 0}</p>
        </Link>
        <Link
          to="/admin/orders"
          className="block p-6 rounded-lg border border-white/10 bg-white/5 hover:border-gold/50 transition-colors"
        >
          <p className="text-smoke text-sm mb-1">Orders</p>
          <p className="text-2xl font-display text-ivory">{ordersCount ?? 0}</p>
        </Link>
        <Link
          to="/admin/categories"
          className="block p-6 rounded-lg border border-white/10 bg-white/5 hover:border-gold/50 transition-colors"
        >
          <p className="text-smoke text-sm mb-1">Categories</p>
          <p className="text-2xl font-display text-ivory">—</p>
        </Link>
        <Link
          to="/admin/coupons"
          className="block p-6 rounded-lg border border-white/10 bg-white/5 hover:border-gold/50 transition-colors"
        >
          <p className="text-smoke text-sm mb-1">Coupons</p>
          <p className="text-2xl font-display text-ivory">—</p>
        </Link>
      </div>
      <p className="text-smoke text-sm">
        Use the sidebar to manage products, orders, inventory, and settings. Admin routes require an authenticated admin user (Supabase session).
      </p>
    </div>
  )
}
