import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/account')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, total, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const totalSpent = orders?.reduce((sum, o) => sum + (o.total || 0), 0) ?? 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl text-ivory mb-2">Account</h1>
      <p className="text-smoke mb-10">{profile?.full_name || user.email}</p>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        <div className="p-6 rounded-lg border border-white/10 bg-noir-card">
          <p className="text-smoke text-sm">Total orders</p>
          <p className="font-display text-2xl text-ivory">{orders?.length ?? 0}</p>
        </div>
        <div className="p-6 rounded-lg border border-white/10 bg-noir-card">
          <p className="text-smoke text-sm">Total spent</p>
          <p className="font-display text-2xl text-gold">{formatPrice(totalSpent)}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-display text-xl text-ivory mb-4">Recent orders</h2>
        {orders?.length ? (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between p-4 rounded-lg border border-white/10">
                <div>
                  <p className="text-ivory font-medium">{o.order_number}</p>
                  <p className="text-smoke text-sm">{new Date(o.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-gold">{formatPrice(o.total)}</p>
                  <span className={`text-xs capitalize ${o.status === 'delivered' ? 'text-green-400' : 'text-smoke'}`}>{o.status}</span>
                </div>
                <Link href={`/account/orders?highlight=${o.id}`}><Button variant="ghost" size="sm">View</Button></Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-smoke">No orders yet.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/account/orders"><Button variant="outline">All orders</Button></Link>
        <Link href="/account/profile"><Button variant="outline">Profile & addresses</Button></Link>
      </div>
    </div>
  )
}
