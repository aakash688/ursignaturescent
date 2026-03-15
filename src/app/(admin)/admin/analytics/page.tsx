'use client'

import { useState, useEffect } from 'react'
import { StatCard } from '@/components/admin/StatCard'
import { formatPrice } from '@/lib/utils'

type Range = 'today' | '7d' | '30d'

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<Range>('7d')
  const [data, setData] = useState<{ revenue: number; orders: number; aov: number; byStatus: Record<string, number>; byDate: { date: string; revenue: number; orders: number }[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const from = new Date()
    if (range === 'today') from.setHours(0, 0, 0, 0)
    else if (range === '7d') from.setDate(from.getDate() - 7)
    else from.setDate(from.getDate() - 30)
    const fromStr = from.toISOString()

    fetch(`/api/admin/orders?from=${fromStr.slice(0, 10)}&limit=500`)
      .then((res) => res.json())
      .then((d) => {
        const orders = d.data ?? []
        const paid = orders.filter((o: { payment_status: string }) => o.payment_status === 'paid')
        const revenue = paid.reduce((s: number, o: { total: number }) => s + (Number(o.total) || 0), 0)
        const byStatus: Record<string, number> = {}
        paid.forEach((o: { status: string }) => {
          byStatus[o.status] = (byStatus[o.status] || 0) + 1
        })
        const byDateMap: Record<string, { revenue: number; orders: number }> = {}
        paid.forEach((o: { created_at: string; total: number }) => {
          const day = o.created_at.slice(0, 10)
          if (!byDateMap[day]) byDateMap[day] = { revenue: 0, orders: 0 }
          byDateMap[day].revenue += Number(o.total) || 0
          byDateMap[day].orders += 1
        })
        const byDate = Object.entries(byDateMap)
          .map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }))
          .sort((a, b) => a.date.localeCompare(b.date))
        setData({
          revenue,
          orders: paid.length,
          aov: paid.length ? revenue / paid.length : 0,
          byStatus,
          byDate,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [range])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-2xl text-ivory">Analytics</h1>
        <div className="flex gap-2">
          {(['today', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded text-sm uppercase ${range === r ? 'bg-gold text-noir' : 'bg-white/10 text-smoke hover:text-ivory'}`}
            >
              {r === 'today' ? 'Today' : r === '7d' ? '7 days' : '30 days'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-smoke">Loading...</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <StatCard title="Revenue" value={formatPrice(data.revenue)} />
            <StatCard title="Orders" value={String(data.orders)} />
            <StatCard title="AOV" value={formatPrice(data.aov)} />
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="font-display text-lg text-ivory mb-4">Orders by status</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <ul className="space-y-2 text-sm">
                  {Object.entries(data.byStatus).map(([status, count]) => (
                    <li key={status} className="flex justify-between text-ivory">
                      <span className="capitalize">{status}</span>
                      <span className="text-gold">{count}</span>
                    </li>
                  ))}
                  {Object.keys(data.byStatus).length === 0 && <li className="text-smoke">No orders in this period</li>}
                </ul>
              </div>
            </div>
            <div>
              <h2 className="font-display text-lg text-ivory mb-4">Revenue over time</h2>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-smoke">
                      <th className="p-2">Date</th>
                      <th className="p-2">Orders</th>
                      <th className="p-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.byDate.slice(-14).map((row) => (
                      <tr key={row.date} className="border-b border-white/5">
                        <td className="p-2 text-ivory">{row.date}</td>
                        <td className="p-2 text-smoke">{row.orders}</td>
                        <td className="p-2 text-gold">{formatPrice(row.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
