'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'

interface ContactRow {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  is_read: boolean
  created_at: string
}

export default function AdminContactsPage() {
  const [data, setData] = useState<ContactRow[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [selected, setSelected] = useState<ContactRow | null>(null)

  const load = () => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', '20')
    if (unreadOnly) params.set('unread_only', 'true')
    setLoading(true)
    fetch(`/api/admin/contacts?${params}`)
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
  }, [page, unreadOnly])

  const markRead = async (id: string) => {
    const res = await fetch('/api/admin/contacts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_read: true }),
    })
    if (res.ok) {
      setData((prev) => prev.map((c) => (c.id === id ? { ...c, is_read: true } : c)))
      setSelected((prev) => (prev?.id === id ? { ...prev, is_read: true } : prev))
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-8">Contact messages</h1>

      <label className="flex items-center gap-2 text-sm text-ivory mb-6">
        <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
        Unread only
      </label>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-smoke">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-smoke">
                  <th className="p-3">From</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Read</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr
                    key={c.id}
                    className={`border-b border-white/5 hover:bg-white/5 cursor-pointer ${selected?.id === c.id ? 'bg-gold/10' : ''} ${!c.is_read ? 'font-medium' : ''}`}
                    onClick={() => { setSelected(c); if (!c.is_read) markRead(c.id) }}
                  >
                    <td className="p-3 text-ivory">{c.name}</td>
                    <td className="p-3 text-smoke">{c.subject || '—'}</td>
                    <td className="p-3 text-smoke">{new Date(c.created_at).toLocaleString()}</td>
                    <td className="p-3">{c.is_read ? '✓' : '·'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && data.length === 0 && <p className="p-12 text-center text-smoke">No messages.</p>}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          {selected ? (
            <>
              <p className="text-smoke text-sm">From: {selected.name} &lt;{selected.email}&gt;</p>
              {selected.subject && <p className="text-smoke text-sm mt-1">Subject: {selected.subject}</p>}
              <p className="text-smoke text-xs mt-2">{new Date(selected.created_at).toLocaleString()}</p>
              <div className="mt-4 pt-4 border-t border-white/10 text-ivory whitespace-pre-wrap">{selected.message}</div>
            </>
          ) : (
            <p className="text-smoke">Select a message</p>
          )}
        </div>
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
