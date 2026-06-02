'use client'

import { useState, useEffect } from 'react'

interface Subscriber {
  id: string
  email: string
  subscribed_at: string
}

export default function AdminNewsletterPage() {
  const [data, setData] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)

  const load = () => {
    setLoading(true)
    fetch(`/api/admin/newsletter?page=${page}&limit=50`)
      .then((res) => res.json())
      .then((d) => {
        setData(d.data ?? [])
        setTotalPages(d.total_pages ?? 0)
        setTotal(d.total ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [page])

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-2">Newsletter subscribers</h1>
      <p className="text-smoke text-sm mb-8">Total: {total} subscriber{total !== 1 ? 's' : ''}</p>

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-smoke">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-smoke">
                <th className="p-3">Email</th>
                <th className="p-3">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-white/5">
                  <td className="p-3 text-ivory">{row.email}</td>
                  <td className="p-3 text-smoke">
                    {row.subscribed_at ? new Date(row.subscribed_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {totalPages > 1 && (
          <div className="p-3 border-t border-white/10 flex justify-between items-center text-sm text-smoke">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded bg-white/10 text-ivory disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded bg-white/10 text-ivory disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
