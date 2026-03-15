'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  id: string
  product_name: string
  product_image: string | null
  size_ml: number
  quantity: number
  unit_price: number
  total_price: number
}

interface OrderDetail {
  id: string
  order_number: string
  guest_email: string | null
  guest_phone: string | null
  status: string
  payment_status: string
  subtotal: number
  discount: number
  shipping_charge: number
  total: number
  shipping_address: { name: string; phone: string; email?: string; address_line1: string; city: string; state: string; pincode: string; country: string }
  admin_notes: string | null
  is_pos: boolean
  created_at: string
  order_items: OrderItem[]
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((res) => res.json())
      .then((d) => {
        setOrder(d)
        setStatus(d.status ?? '')
        setAdminNotes(d.admin_notes ?? '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const save = async () => {
    if (!order) return
    setSaving(true)
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_notes: adminNotes || null }),
    })
    setSaving(false)
    if (res.ok) {
      const d = await res.json()
      setOrder((prev) => (prev ? { ...prev, ...d } : null))
    }
  }

  if (loading || !order) {
    return (
      <div>
        <div className="text-smoke">Loading...</div>
      </div>
    )
  }

  const addr = order.shipping_address || {}

  return (
    <div>
      <Link href="/admin/orders" className="text-gold hover:underline text-sm mb-4 inline-block">
        ← Orders
      </Link>
      <div className="flex justify-between items-start mb-6">
        <h1 className="font-display text-2xl text-ivory">Order {order.order_number}</h1>
        <span className={`px-2 py-1 rounded text-xs ${order.payment_status === 'paid' ? 'bg-green-900/30 text-green-400' : 'bg-white/10 text-smoke'}`}>
          {order.payment_status}
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-lg text-ivory mb-3">Customer</h2>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm space-y-1">
            <p className="text-ivory">{addr.name || '—'}</p>
            <p className="text-smoke">{addr.phone || order.guest_phone || '—'}</p>
            <p className="text-smoke">{addr.email || order.guest_email || '—'}</p>
          </div>

          <h2 className="font-display text-lg text-ivory mt-6 mb-3">Shipping address</h2>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-smoke">
            {addr.address_line1}
            {addr.city ? `, ${addr.city}` : ''} {addr.state ? `, ${addr.state}` : ''} {addr.pincode ? ` - ${addr.pincode}` : ''} {addr.country ? `, ${addr.country}` : ''}
          </div>

          <h2 className="font-display text-lg text-ivory mt-6 mb-3">Status & notes</h2>
          <div className="space-y-3">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-ivory text-sm">
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Admin notes"
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-ivory text-sm min-h-[80px]"
            />
            <Button onClick={save} loading={saving} disabled={saving}>
              Save
            </Button>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg text-ivory mb-3">Items</h2>
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-smoke">
                  <th className="p-3">Product</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.order_items || []).map((item) => (
                  <tr key={item.id} className="border-b border-white/5">
                    <td className="p-3 text-ivory">{item.product_name}</td>
                    <td className="p-3 text-smoke">{item.size_ml}ml</td>
                    <td className="p-3 text-smoke">{item.quantity}</td>
                    <td className="p-3 text-smoke">{formatPrice(item.unit_price)}</td>
                    <td className="p-3 text-gold">{formatPrice(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-1 text-right text-sm">
            <p className="text-smoke">Subtotal: {formatPrice(order.subtotal)}</p>
            {order.discount > 0 && <p className="text-smoke">Discount: -{formatPrice(order.discount)}</p>}
            {order.shipping_charge > 0 && <p className="text-smoke">Shipping: {formatPrice(order.shipping_charge)}</p>}
            <p className="text-ivory font-medium">Total: {formatPrice(order.total)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
