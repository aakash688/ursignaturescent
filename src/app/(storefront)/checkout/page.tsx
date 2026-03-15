'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import type { ShippingAddress } from '@/types'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

const FREE_SHIPPING_THRESHOLD = 999
const DEFAULT_SHIPPING = 99

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, clearCart, closeCart } = useCartStore()
  const [address, setAddress] = useState<ShippingAddress>({
    name: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  })
  const [couponCode, setCouponCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  const subtotal = getSubtotal()
  const shipping = subtotal - appliedDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING
  const total = subtotal - appliedDiscount + shipping

  useEffect(() => {
    closeCart()
  }, [closeCart])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponError(null)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      })
      const data = await res.json()
      if (data.valid) setAppliedDiscount(data.discount)
      else setCouponError(data.error || 'Invalid coupon')
    } catch {
      setCouponError('Could not validate coupon')
    }
  }

  const handlePlaceOrder = async () => {
    if (!items.length) return
    if (!address.name || !address.phone || !address.email || !address.address_line1 || !address.city || !address.state || !address.pincode) {
      alert('Please fill all required address fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            variant_id: i.variant_id,
            name: i.name,
            quantity: i.quantity,
          })),
          shippingAddress: address,
          couponCode: couponCode || undefined,
          guestEmail: address.email,
          guestPhone: address.phone,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Failed to create order')
        setLoading(false)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)

      script.onload = () => {
        const Razorpay = window.Razorpay
        if (!Razorpay) {
          alert('Payment failed to load')
          setLoading(false)
          return
        }
        const rzp = new Razorpay({
          key: data.key,
          amount: data.amount * 100,
          currency: 'INR',
          name: 'URsignature',
          order_id: data.razorpayOrderId,
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              clearCart()
              router.push(`/order-success?orderId=${verifyData.orderId}&orderNumber=${verifyData.orderNumber}`)
            } else {
              alert(verifyData.error || 'Payment verification failed')
            }
            setLoading(false)
          },
          modal: { ondismiss: () => setLoading(false) },
        })
        rzp.open()
      }
    } catch (e) {
      console.error(e)
      alert('Something went wrong')
      setLoading(false)
    }
  }

  if (!items.length && typeof window !== 'undefined') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-2xl text-ivory mb-4">Your cart is empty</h1>
        <Link href="/products"><Button>Continue shopping</Button></Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/" className="inline-block mb-8">
        <Logo size="sm" variant="gold" />
      </Link>
      <h1 className="font-display text-3xl text-ivory mb-8">Checkout</h1>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="font-display text-xl text-ivory mb-4">Shipping address</h2>
          <div className="space-y-4">
            <Input label="Name" required value={address.name} onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))} />
            <Input label="Email" type="email" required value={address.email} onChange={(e) => setAddress((a) => ({ ...a, email: e.target.value }))} />
            <Input label="Phone" required value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} />
            <Input label="Address" required value={address.address_line1} onChange={(e) => setAddress((a) => ({ ...a, address_line1: e.target.value }))} />
            <Input label="City" required value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} />
            <Input label="State" required value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} />
            <Input label="Pincode" required value={address.pincode} onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value }))} />
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xl text-ivory mb-4">Coupon</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value); setCouponError(null) }}
                placeholder="Code"
                className="flex-1 bg-noir-elevated border border-white/10 rounded px-4 py-2 text-ivory"
              />
              <Button type="button" variant="outline" onClick={handleApplyCoupon}>Apply</Button>
            </div>
            {couponError && <p className="text-red-400 text-sm mt-1">{couponError}</p>}
            {appliedDiscount > 0 && <p className="text-gold text-sm mt-1">₹{appliedDiscount} discount applied</p>}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl text-ivory mb-4">Order summary</h2>
          <div className="space-y-3 mb-6">
            {items.map((i) => (
              <div key={i.variant_id} className="flex gap-4 items-center">
                <div className="w-16 h-20 relative rounded overflow-hidden bg-charcoal flex-shrink-0">
                  <Image src={i.image.startsWith('http') ? i.image : i.image.startsWith('/') ? i.image : `/${i.image}`} alt={i.name} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-ivory font-medium truncate">{i.name}</p>
                  <p className="text-smoke text-sm">{i.size_ml}ml × {i.quantity}</p>
                </div>
                <p className="text-gold">{formatPrice(i.price * i.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-smoke">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-gold">
                <span>Discount</span>
                <span>-{formatPrice(appliedDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-smoke">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-ivory font-medium pt-2">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Button className="w-full mt-8" size="lg" onClick={handlePlaceOrder} loading={loading} disabled={loading}>
            {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
          </Button>
          <p className="text-smoke text-xs mt-4 text-center">Prepaid only. You will be redirected to Razorpay.</p>
        </div>
      </div>
    </div>
  )
}
