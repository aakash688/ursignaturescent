import { useState } from 'react'
import { get } from '../../api/client'

type Order = {
  order_number: string
  status: string
  total: number
  tracking_number?: string
  tracking_url?: string
  order_items?: { product_name: string; quantity: number; total_price: number }[]
}

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<{ order: Order } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOrder(null)
    setLoading(true)
    try {
      const res = await get<{ order: Order }>(
        `/api/orders?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`
      )
      setOrder(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Order not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-3xl font-display text-ivory mb-2">Track Order</h1>
      <p className="text-smoke mb-6">Enter your order number and email to see status and tracking.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Order number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
          className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory placeholder:text-smoke focus:border-gold outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 rounded bg-white/5 border border-white/10 text-ivory placeholder:text-smoke focus:border-gold outline-none"
        />
        <button type="submit" disabled={loading} className="w-full py-2 rounded bg-gold text-noir font-medium disabled:opacity-50">
          {loading ? '…' : 'Track'}
        </button>
      </form>
      {error && <p className="mt-4 text-red-400">{error}</p>}
      {order?.order && (
        <div className="mt-8 p-4 rounded border border-white/10">
          <p className="text-gold">Order {order.order.order_number}</p>
          <p className="text-smoke">Status: {order.order.status}</p>
          <p className="text-ivory">Total: ₹{order.order.total}</p>
          {order.order.tracking_url && (
            <a href={order.order.tracking_url} className="text-gold mt-2 inline-block">Track shipment</a>
          )}
        </div>
      )}
    </div>
  )
}
