import { useEffect, useState } from 'react'
import { get } from '../../api/client'

type Coupon = { id: string; code: string; type: string; value: number; is_active: boolean }

export default function AdminCoupons() {
  const [list, setList] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    get<Coupon[]>('/api/admin/coupons').then(setList).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-smoke">Loading…</div>
  if (error) return <div className="text-red-400">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-display text-ivory mb-6">Coupons</h1>
      {list.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-8 text-center text-smoke">
          No coupons yet.
        </div>
      ) : (
      <div className="border border-white/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-smoke bg-white/5">
              <th className="p-3">Code</th>
              <th className="p-3">Type</th>
              <th className="p-3">Value</th>
              <th className="p-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-b border-white/5">
                <td className="p-3 text-ivory">{c.code}</td>
                <td className="p-3 text-smoke">{c.type}</td>
                <td className="p-3 text-smoke">{c.value}</td>
                <td className="p-3">{c.is_active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
