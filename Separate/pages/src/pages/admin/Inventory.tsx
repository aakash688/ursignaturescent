import { useEffect, useState } from 'react'
import { get } from '../../api/client'

type Variant = { id: string; size_ml: number; sku: string; stock_quantity: number; products?: { name: string } }

export default function AdminInventory() {
  const [list, setList] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    get<Variant[]>('/api/admin/inventory').then(setList).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }
  useEffect(() => load(), [])

  if (loading) return <div className="text-smoke">Loading…</div>
  if (error) return <div className="text-red-400">{error}</div>

  return (
    <div>
      <h1 className="text-2xl font-display text-ivory mb-6">Inventory</h1>
      {list.length === 0 ? (
        <div className="border border-white/10 rounded-lg p-8 text-center text-smoke">
          No inventory variants yet. Add products with variants to see stock here.
        </div>
      ) : (
      <div className="border border-white/10 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-smoke bg-white/5">
              <th className="p-3">Product</th>
              <th className="p-3">Size</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Stock</th>
            </tr>
          </thead>
          <tbody>
            {list.map((v) => (
              <tr key={v.id} className="border-b border-white/5">
                <td className="p-3 text-ivory">{(v.products as { name?: string })?.name ?? '—'}</td>
                <td className="p-3 text-smoke">{v.size_ml}ml</td>
                <td className="p-3 text-smoke">{v.sku}</td>
                <td className="p-3 text-ivory">{v.stock_quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
