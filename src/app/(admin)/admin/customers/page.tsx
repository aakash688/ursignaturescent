'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { formatPrice } from '@/lib/utils'

interface CustomerRow {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  created_at: string
  order_count: number
  total_spent: number
  last_order_at: string | null
}

export default function AdminCustomersPage() {
  const [data, setData] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [q, setQ] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (q) params.set('q', q)
    setLoading(true)
    fetch(`/api/admin/customers?${params}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d.data ?? [])
        setTotalPages(d.total_pages ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page, q])

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-8">Customers</h1>

      <div className="mb-6">
        <Input placeholder="Search by name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs bg-white/5 border-white/10 text-ivory" />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-smoke">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-smoke">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Orders</th>
                <th className="p-3">Total spent</th>
                <th className="p-3">Last order</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 text-ivory">{c.full_name || '—'}</td>
                  <td className="p-3 text-smoke">{c.email}</td>
                  <td className="p-3 text-smoke">{c.phone || '—'}</td>
                  <td className="p-3 text-smoke">{c.order_count}</td>
                  <td className="p-3 text-gold">{formatPrice(c.total_spent)}</td>
                  <td className="p-3 text-smoke">{c.last_order_at ? new Date(c.last_order_at).toLocaleDateString() : '—'}</td>
                  <td className="p-3">
                    <Link href={`/admin/orders?q=${encodeURIComponent(c.email)}`} className="text-gold hover:underline text-xs">
                      View orders
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && data.length === 0 && <p className="p-12 text-center text-smoke">No customers found.</p>}
      </div>
      {totalPages > 1 && (
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded bg-white/10 text-ivory text-sm disabled:opacity-50">
            Previous
          </button>
          <span className="text-smoke text-sm py-1">Page {page} of {totalPages}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 rounded bg-white/10 text-ivory text-sm disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
