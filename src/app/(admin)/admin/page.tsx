import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/admin/StatCard'
import { formatPrice } from '@/lib/utils'

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const [
    { data: revenueRow },
    { count: ordersToday },
    { count: pendingOrders },
    { data: recentOrders },
    { data: lowStockVariants },
  ] = await Promise.all([
    supabase.from('orders').select('total').eq('payment_status', 'paid').gte('created_at', `${today}T00:00:00`).lt('created_at', `${today}T23:59:59.999Z`),
    supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00`).lt('created_at', `${today}T23:59:59.999Z`),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending', 'confirmed', 'processing']),
    supabase.from('orders').select('id, order_number, guest_email, total, status, payment_status, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('product_variants').select('id, product_id, size_ml, stock_quantity, low_stock_threshold, products(name)').limit(500),
  ])

  const todayRevenue = revenueRow?.reduce((s, r) => s + (Number(r.total) || 0), 0) ?? 0
  const lowStockCount = (lowStockVariants ?? []).filter(
    (v: { stock_quantity: number; low_stock_threshold: number }) => v.stock_quantity <= v.low_stock_threshold
  ).length
  const lowStockList = (lowStockVariants ?? []).filter(
    (v: { stock_quantity: number; low_stock_threshold: number }) => v.stock_quantity <= v.low_stock_threshold
  ).slice(0, 20)

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Today's Revenue" value={formatPrice(todayRevenue)} />
        <StatCard title="Orders Today" value={String(ordersToday ?? 0)} />
        <StatCard title="Pending Orders" value={String(pendingOrders ?? 0)} />
        <StatCard title="Low Stock Items" value={String(lowStockCount ?? 0)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="font-display text-lg text-ivory mb-4">Recent Orders</h2>
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-smoke">
                  <th className="p-3">Order</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {(recentOrders ?? []).map((o: { id: string; order_number: string; guest_email: string | null; total: number; status: string; created_at: string }) => (
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 text-ivory">{o.order_number}</td>
                    <td className="p-3 text-smoke">{o.guest_email || '—'}</td>
                    <td className="p-3 text-gold">{formatPrice(o.total)}</td>
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
            {(recentOrders ?? []).length === 0 && (
              <p className="p-6 text-smoke text-center">No orders yet.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-ivory mb-4">Low Stock Alerts</h2>
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-smoke">
                  <th className="p-3">Product</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStockList.map((v) => (
                  <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 text-ivory">{(v.products as { name?: string } | null)?.name ?? '—'}</td>
                    <td className="p-3 text-smoke">{v.size_ml}ml</td>
                    <td className="p-3 text-red-400">{v.stock_quantity}</td>
                    <td className="p-3 text-smoke">{v.low_stock_threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
              {lowStockList.length === 0 && (
              <p className="p-6 text-smoke text-center">No low stock items.</p>
            )}
          </div>
          <p className="mt-2 text-xs text-smoke">
            <Link href="/admin/inventory" className="text-gold hover:underline">Manage inventory →</Link>
          </p>
        </section>
      </div>
    </div>
  )
}
