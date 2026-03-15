import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

export default async function AccountOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/account/orders')

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, total, status, payment_status, created_at, order_items(product_name, size_ml, quantity, total_price)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl text-ivory mb-10">Orders</h1>

      {!orders?.length ? (
        <p className="text-smoke mb-8">No orders yet.</p>
      ) : (
        <ul className="space-y-6">
          {orders.map((o) => (
            <li key={o.id} className="p-6 rounded-lg border border-white/10 bg-noir-card">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-ivory font-display text-lg">{o.order_number}</p>
                  <p className="text-smoke text-sm">{new Date(o.created_at).toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm capitalize px-2 py-1 rounded ${o.status === 'delivered' ? 'bg-green-900/30 text-green-400' : 'bg-gold/10 text-gold'}`}>{o.status}</span>
                  <p className="text-gold font-medium">{formatPrice(o.total)}</p>
                </div>
              </div>
              <ul className="text-smoke text-sm space-y-1 mb-4">
                {(o.order_items as Array<{ product_name: string; size_ml: number; quantity: number; total_price: number }>)?.map((item, i) => (
                  <li key={i}>{item.product_name} {item.size_ml}ml × {item.quantity} — {formatPrice(item.total_price)}</li>
                ))}
              </ul>
              <Link href={`/track-order?orderNumber=${o.order_number}&email=${encodeURIComponent(user.email || '')}`}>
                <Button variant="outline" size="sm">Track order</Button>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link href="/account" className="inline-block mt-8">
        <Button variant="ghost">← Back to account</Button>
      </Link>
    </div>
  )
}
