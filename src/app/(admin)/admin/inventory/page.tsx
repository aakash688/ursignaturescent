'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface VariantRow {
  id: string
  product_id: string
  size_ml: number
  sku: string
  stock_quantity: number
  low_stock_threshold: number
  products: { name?: string; slug?: string } | null
}

export default function AdminInventoryPage() {
  const [list, setList] = useState<VariantRow[]>([])
  const [loading, setLoading] = useState(true)
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [adjustingId, setAdjustingId] = useState<string | null>(null)
  const [delta, setDelta] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (lowStockOnly) params.set('low_stock_only', 'true')
    fetch(`/api/admin/inventory?${params}`)
      .then((res) => res.json())
      .then((d) => {
        setList(Array.isArray(d) ? d : d.data ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [lowStockOnly])

  const submitAdjust = async (variantId: string) => {
    const n = parseInt(delta, 10)
    if (Number.isNaN(n) || n === 0) return
    setSubmitting(true)
    const res = await fetch('/api/admin/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variant_id: variantId,
        type: n > 0 ? 'restock' : 'adjustment',
        quantity_change: n,
        note: 'Admin adjustment',
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      setAdjustingId(null)
      setDelta('')
      load()
    } else {
      const err = await res.json()
      alert(err.error || 'Failed')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-8">Inventory</h1>

      <label className="flex items-center gap-2 text-sm text-ivory mb-6">
        <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} />
        Low stock only
      </label>

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-smoke">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-smoke">
                <th className="p-3">Product</th>
                <th className="p-3">Size</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Threshold</th>
                <th className="p-3">Adjust</th>
              </tr>
            </thead>
            <tbody>
              {list.map((v) => (
                <tr key={v.id} className={`border-b border-white/5 hover:bg-white/5 ${v.stock_quantity <= v.low_stock_threshold ? 'bg-red-900/10' : ''}`}>
                  <td className="p-3 text-ivory">{v.products?.name ?? '—'}</td>
                  <td className="p-3 text-smoke">{v.size_ml}ml</td>
                  <td className="p-3 text-smoke">{v.sku}</td>
                  <td className="p-3 text-ivory">{v.stock_quantity}</td>
                  <td className="p-3 text-smoke">{v.low_stock_threshold}</td>
                  <td className="p-3">
                    {adjustingId === v.id ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          value={delta}
                          onChange={(e) => setDelta(e.target.value)}
                          placeholder="+/- qty"
                          className="w-24 bg-white/5 border-white/10 text-ivory text-sm"
                        />
                        <Button size="sm" onClick={() => submitAdjust(v.id)} loading={submitting} disabled={submitting}>
                          Apply
                        </Button>
                        <button type="button" onClick={() => { setAdjustingId(null); setDelta('') }} className="text-smoke text-xs hover:text-ivory">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setAdjustingId(v.id)} className="text-gold hover:underline text-xs">
                        Adjust
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && list.length === 0 && <p className="p-12 text-center text-smoke">No variants found.</p>}
      </div>
    </div>
  )
}
