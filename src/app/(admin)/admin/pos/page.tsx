'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatPrice } from '@/lib/utils'

interface ProductHit {
  id: string
  name: string
  slug: string
  images: string[]
  product_variants: { id: string; size_ml: number; price: number; stock_quantity: number }[]
}

interface CartLine {
  variant_id: string
  product_name: string
  size_ml: number
  price: number
  quantity: number
}

export default function AdminPOSPage() {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<ProductHit[]>([])
  const [searching, setSearching] = useState(false)
  const [cart, setCart] = useState<CartLine[]>([])
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [discount, setDiscount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [paymentRef, setPaymentRef] = useState('')
  const [completing, setCompleting] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<{ order_number: string } | null>(null)

  const runSearch = useCallback(() => {
    if (!search.trim()) return
    setSearching(true)
    fetch(`/api/admin/products?q=${encodeURIComponent(search.trim())}&limit=20`)
      .then((res) => res.json())
      .then((d) => {
        setProducts(d.data ?? [])
        setSearching(false)
      })
      .catch(() => setSearching(false))
  }, [search])

  useEffect(() => {
    const t = setTimeout(runSearch, 300)
    return () => clearTimeout(t)
  }, [search, runSearch])

  const addToCart = (p: ProductHit, variant: { id: string; size_ml: number; price: number; stock_quantity: number }) => {
    if (variant.stock_quantity < 1) return
    setCart((prev) => {
      const existing = prev.find((x) => x.variant_id === variant.id)
      if (existing) {
        if (existing.quantity >= variant.stock_quantity) return prev
        return prev.map((x) => (x.variant_id === variant.id ? { ...x, quantity: x.quantity + 1 } : x))
      }
      return [...prev, { variant_id: variant.id, product_name: p.name, size_ml: variant.size_ml, price: variant.price, quantity: 1 }]
    })
  }

  const updateQty = (variantId: string, delta: number) => {
    setCart((prev) =>
      prev.map((x) => {
        if (x.variant_id !== variantId) return x
        const q = Math.max(0, x.quantity + delta)
        return q === 0 ? null : { ...x, quantity: q }
      }).filter(Boolean) as CartLine[]
    )
  }

  const removeLine = (variantId: string) => {
    setCart((prev) => prev.filter((x) => x.variant_id !== variantId))
  }

  const subtotal = cart.reduce((s, l) => s + l.price * l.quantity, 0)
  const discountNum = Math.max(0, parseFloat(discount) || 0)
  const total = Math.max(0, subtotal - discountNum)

  const completeSale = async () => {
    if (cart.length === 0) {
      alert('Add items to cart')
      return
    }
    setCompleting(true)
    try {
      const res = await fetch('/api/admin/pos/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((l) => ({ variant_id: l.variant_id, quantity: l.quantity })),
          customer_name: customerName || undefined,
          customer_phone: customerPhone || undefined,
          customer_email: customerEmail || undefined,
          payment_method: paymentMethod,
          payment_reference: paymentRef || undefined,
          discount: discountNum,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setCompletedOrder({ order_number: data.order_number })
        setCart([])
        setDiscount('')
        setPaymentRef('')
      } else {
        alert(data.error || 'Failed to complete sale')
      }
    } finally {
      setCompleting(false)
    }
  }

  const clearCompleted = () => setCompletedOrder(null)

  return (
    <div>
      <h1 className="font-display text-2xl text-ivory mb-6">Point of Sale</h1>

      {completedOrder && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-700/50 rounded-lg text-green-400">
          Sale complete. Order: <strong>{completedOrder.order_number}</strong>
          <button type="button" onClick={clearCompleted} className="ml-4 text-sm underline">Dismiss</button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4 bg-white/5 border-white/10 text-ivory" />
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
            {searching ? (
              <div className="p-6 text-center text-smoke">Searching...</div>
            ) : (
              <div className="p-3 space-y-2">
                {products.map((p) => (
                  <div key={p.id} className="border-b border-white/5 pb-2">
                    <p className="text-ivory font-medium text-sm">{p.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {p.product_variants?.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => addToCart(p, v)}
                          disabled={v.stock_quantity < 1}
                          className="px-3 py-1.5 rounded bg-white/10 text-ivory text-xs hover:bg-gold hover:text-noir disabled:opacity-50"
                        >
                          {v.size_ml}ml — {formatPrice(v.price)} {v.stock_quantity < 1 ? '(out of stock)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {!searching && products.length === 0 && search && <p className="text-smoke text-sm">No products found.</p>}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg text-ivory mb-3">Current sale</h2>
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-smoke">
                  <th className="p-3">Product</th>
                  <th className="p-3">Size</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Price</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {cart.map((l) => (
                  <tr key={l.variant_id} className="border-b border-white/5">
                    <td className="p-3 text-ivory">{l.product_name}</td>
                    <td className="p-3 text-smoke">{l.size_ml}ml</td>
                    <td className="p-3">
                      <button type="button" onClick={() => updateQty(l.variant_id, -1)} className="px-1 text-gold">−</button>
                      <span className="mx-2">{l.quantity}</span>
                      <button type="button" onClick={() => updateQty(l.variant_id, 1)} className="px-1 text-gold">+</button>
                    </td>
                    <td className="p-3 text-gold">{formatPrice(l.price * l.quantity)}</td>
                    <td className="p-3">
                      <button type="button" onClick={() => removeLine(l.variant_id)} className="text-red-400 text-xs">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cart.length === 0 && <p className="p-6 text-smoke text-center">Cart is empty</p>}
          </div>

          <div className="space-y-3 mb-4">
            <Input placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="bg-white/5 border-white/10 text-ivory" />
            <Input placeholder="Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="bg-white/5 border-white/10 text-ivory" />
            <Input placeholder="Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} type="email" className="bg-white/5 border-white/10 text-ivory" />
            <Input placeholder="Discount amount" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="bg-white/5 border-white/10 text-ivory" />
            <div>
              <label className="block text-sm text-smoke mb-1">Payment</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-ivory text-sm">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
            </div>
            {(paymentMethod === 'upi' || paymentMethod === 'card') && (
              <Input placeholder="Reference / Transaction ID" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} className="bg-white/5 border-white/10 text-ivory" />
            )}
          </div>

          <p className="text-ivory font-medium mb-2">Subtotal: {formatPrice(subtotal)}</p>
          {discountNum > 0 && <p className="text-smoke text-sm mb-2">Discount: -{formatPrice(discountNum)}</p>}
          <p className="text-gold font-display text-xl mb-4">Total: {formatPrice(total)}</p>
          <Button onClick={completeSale} loading={completing} disabled={completing || cart.length === 0} size="lg" className="w-full">
            Complete Sale
          </Button>
        </div>
      </div>
    </div>
  )
}
