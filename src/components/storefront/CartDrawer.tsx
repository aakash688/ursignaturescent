'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getItemCount } = useCartStore()
  const subtotal = getSubtotal()
  const itemCount = getItemCount()
  const freeShippingThreshold = 999
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100)

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-noir/60 z-50" onClick={closeCart} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-charcoal border-l border-white/10 z-50 flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h2 className="font-display text-xl">Your Cart ({itemCount})</h2>
          <button onClick={closeCart} className="p-2 hover:text-gold">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-smoke text-center py-12">Your cart is empty</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.variant_id} className="flex gap-4 border-b border-white/5 pb-4">
                  <div className="relative w-20 h-24 flex-shrink-0 rounded overflow-hidden bg-white/5">
                    <Image
                      src={item.image.startsWith('http') ? item.image : item.image.startsWith('/') ? item.image : `/${item.image}`}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized={!item.image.startsWith('http')}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.slug}`} onClick={closeCart} className="font-medium text-ivory hover:text-gold">
                      {item.name}
                    </Link>
                    <p className="text-smoke text-sm">{item.size_ml}ml</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.variant_id, item.quantity - 1)} className="p-1 rounded hover:bg-white/10">
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.variant_id, item.quantity + 1)} className="p-1 rounded hover:bg-white/10">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gold">{formatPrice(item.price * item.quantity)}</span>
                        <button onClick={() => removeItem(item.variant_id)} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="p-4 border-t border-white/5 space-y-4">
            {subtotal < freeShippingThreshold && (
              <div className="bg-white/5 rounded p-3">
                <p className="text-sm text-smoke">Add {formatPrice(freeShippingThreshold - subtotal)} more for free shipping</p>
                <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            <div className="flex justify-between text-lg">
              <span>Subtotal</span>
              <span className="text-gold font-medium">{formatPrice(subtotal)}</span>
            </div>
            <Link href="/checkout" onClick={closeCart}>
              <Button fullWidth size="lg">Proceed to Checkout</Button>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
