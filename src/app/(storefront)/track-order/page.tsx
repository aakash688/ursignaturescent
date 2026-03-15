'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatPrice } from '@/lib/utils'

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '')
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [order, setOrder] = useState<{
    order_number: string
    status: string
    total: number
    tracking_number?: string | null
    tracking_url?: string | null
    courier_name?: string | null
    order_items: Array<{ product_name: string; size_ml: number; quantity: number }>
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!orderNumber.trim() || !email.trim()) return
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (data.order) setOrder(data.order)
      else setError('Order not found. Check order number and email.')
    } catch {
      setError('Something went wrong')
    }
    setLoading(false)
  }

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
  const currentIndex = order ? statusSteps.indexOf(order.status) : -1

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-4xl text-ivory mb-2">Track order</h1>
      <p className="text-smoke mb-10">Enter your order number and email to see status.</p>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-12">
        <Input
          placeholder="Order number (e.g. URS-xxx)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" loading={loading} disabled={loading}>{loading ? 'Searching...' : 'Track'}</Button>
      </form>

      {error && <p className="text-red-400 mb-6">{error}</p>}

      {order && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <p className="text-ivory font-display text-lg">{order.order_number}</p>
            <span className="text-gold capitalize">{order.status}</span>
          </div>

          <div className="flex justify-between gap-2">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex-1 text-center">
                <div className={`h-2 rounded-full mb-2 ${i <= currentIndex ? 'bg-gold' : 'bg-white/10'}`} />
                <p className={`text-xs capitalize ${i <= currentIndex ? 'text-gold' : 'text-smoke'}`}>{step}</p>
              </div>
            ))}
          </div>

          {order.tracking_number && (
            <div className="p-4 rounded-lg bg-noir-card border border-white/10">
              <p className="text-smoke text-sm">Tracking: {order.tracking_number}</p>
              {order.courier_name && <p className="text-smoke text-sm">Courier: {order.courier_name}</p>}
              {order.tracking_url && (
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-gold text-sm hover:underline mt-2 inline-block">
                  Open tracking link →
                </a>
              )}
            </div>
          )}

          <div>
            <p className="text-smoke text-sm mb-2">Items</p>
            <ul className="space-y-1">
              {order.order_items?.map((item, i) => (
                <li key={i} className="text-ivory">{item.product_name} {item.size_ml}ml × {item.quantity}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><p className="text-smoke">Loading...</p></div>}>
      <TrackOrderContent />
    </Suspense>
  )
}
