import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { get, patch } from '../../api/client'

type Order = {
  id: string
  order_number: string
  status: string
  total: number
  order_items?: { product_name: string; quantity: number; total_price: number }[]
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    get<Order>(`/api/admin/orders/${id}`)
      .then((o) => { setOrder(o); setStatus(o.status); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    if (!id) return
    try {
      const updated = await patch<Order>(`/api/admin/orders/${id}`, { status })
      setOrder(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    }
  }

  if (loading) return <div className="text-smoke">Loading…</div>
  if (error || !order) return <div className="text-red-400">{error || 'Not found'}</div>

  return (
    <div>
      <Link to="/admin/orders" className="text-gold mb-4 inline-block">← Orders</Link>
      <h1 className="text-2xl font-display text-ivory mb-6">Order {order.order_number}</h1>
      <div className="space-y-4">
        <p className="text-smoke">Total: ₹{order.total}</p>
        <div className="flex items-center gap-2">
          <label className="text-smoke">Status</label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory focus:border-gold outline-none"
          />
          <button type="button" onClick={handleSave} className="px-4 py-2 rounded bg-gold text-noir font-medium">Save</button>
        </div>
        {order.order_items?.length ? (
          <ul className="border border-white/10 rounded p-4">
            {order.order_items.map((item, i) => (
              <li key={i} className="text-ivory">{item.product_name} × {item.quantity} — ₹{item.total_price}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
