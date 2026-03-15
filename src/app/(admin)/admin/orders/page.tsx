'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { formatPrice } from '@/lib/utils'

interface OrderRow {
  id: string
  order_number: string
  guest_email: string | null
  guest_phone: string | null
  status: string
  payment_status: string
  total: number
  created_at: string
}

export default function AdminOrdersPage() {
  const [data, setData] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [status, setStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [q, setQ] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (status) params.set('status', status)
    if (paymentStatus) params.set('payment_status', paymentStatus)
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (q) params.set('q', q)
    setLoading(true)
    fetch(`/api/admin/orders?${params}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d.data ?? [])
        setTotalPages(d.total_pages ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page, status, paymentStatus, from, to, q])

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-8">Orders</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <Input placeholder="Order #, email, phone" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs bg-white/5 border-white/10 text-ivory" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-ivory text-sm">
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-ivory text-sm">
          <option value="">All payment</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-ivory text-sm" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-ivory text-sm" />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-smoke">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-smoke">
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 text-ivory">{o.order_number}</td>
                  <td className="p-3 text-smoke">{o.guest_email || o.guest_phone || '—'}</td>
                  <td className="p-3 text-gold">{formatPrice(o.total)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${o.payment_status === 'paid' ? 'bg-green-900/30 text-green-400' : 'bg-white/10 text-smoke'}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-ivory">{o.status}</span>
                  </td>
                  <td className="p-3 text-smoke">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Link href={`/admin/orders/${o.id}`} className="text-gold hover:underline text-xs">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && data.length === 0 && <p className="p-12 text-center text-smoke">No orders found.</p>}
      </div>
      {totalPages > 1 && (
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded bg-white/10 text-ivory text-sm disabled:opacity-50">
            Previous
          </button>
          <span className="text-smoke text-sm py-1">
            Page {page} of {totalPages}
          </span>
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 rounded bg-white/10 text-ivory text-sm disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
