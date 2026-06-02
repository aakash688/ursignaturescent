import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { get } from '../../api/client'

type Order = { id: string; order_number: string; guest_email?: string; total: number; status: string; payment_status: string }

export default function AdminOrders() {
  const [data, setData] = useState<{ data: Order[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    get<{ data: Order[] }>('/api/admin/orders')
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-smoke">Loading…</div>
  if (error) return <div className="text-red-400">{error}</div>
  const orders = data?.data ?? []

  return (
    <div>
      <h1 className="text-2xl font-display text-ivory mb-6">Orders</h1>
      {orders.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-8 text-center text-smoke">
          No orders yet.
        </div>
      ) : (
      <div className="border border-white/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-smoke bg-white/5">
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-white/5">
                <td className="p-3 text-ivory">{o.order_number}</td>
                <td className="p-3 text-smoke">{o.guest_email || '—'}</td>
                <td className="p-3 text-gold">₹{o.total}</td>
                <td className="p-3">{o.status}</td>
                <td className="p-3">
                  <Link to={`/admin/orders/${o.id}`} className="text-gold">View</Link>
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
