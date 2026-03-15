'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface ReviewRow {
  id: string
  product_id: string
  rating: number
  title: string | null
  body: string | null
  author_name: string | null
  author_email: string | null
  is_approved: boolean
  created_at: string
  products: { id: string; name: string; slug: string } | null
}

export default function AdminReviewsPage() {
  const [data, setData] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = () => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', '20')
    if (filter === 'approved') params.set('approved', 'true')
    if (filter === 'pending') params.set('approved', 'false')
    setLoading(true)
    fetch(`/api/admin/reviews?${params}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d.data ?? [])
        setTotalPages(d.total_pages ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page, filter])

  const setApproved = async (id: string, is_approved: boolean) => {
    setUpdatingId(id)
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_approved }),
    })
    setUpdatingId(null)
    if (res.ok) load()
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-8">Reviews</h1>

      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded text-sm uppercase ${filter === f ? 'bg-gold text-noir' : 'bg-white/10 text-smoke hover:text-ivory'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-smoke">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-smoke">
                <th className="p-3">Product</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Author</th>
                <th className="p-3">Review</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 text-ivory">
                    {r.products ? (
                      <Link href={`/product/${r.products.slug}`} className="text-gold hover:underline">
                        {r.products.name}
                      </Link>
                    ) : '—'}
                  </td>
                  <td className="p-3 text-gold">{r.rating} ★</td>
                  <td className="p-3 text-smoke">{r.author_name || r.author_email || '—'}</td>
                  <td className="p-3 text-smoke max-w-[200px] truncate">{r.title || r.body || '—'}</td>
                  <td className="p-3 text-smoke">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${r.is_approved ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'}`}>
                      {r.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2">
                    {r.is_approved ? (
                      <Button size="sm" variant="outline" onClick={() => setApproved(r.id, false)} loading={updatingId === r.id} disabled={updatingId !== null}>
                        Reject
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setApproved(r.id, true)} loading={updatingId === r.id} disabled={updatingId !== null}>
                        Approve
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && data.length === 0 && <p className="p-12 text-center text-smoke">No reviews.</p>}
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
