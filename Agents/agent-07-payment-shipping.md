# CURSOR AGENT 07 — Razorpay Payments + Shiprocket Shipping

## Your Role
Integrate Razorpay payment gateway and Shiprocket shipping API. Handle the complete order lifecycle from checkout to delivery.

---

## Step 1: Razorpay Setup `src/lib/razorpay.ts`
```typescript
import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function createRazorpayOrder(amount: number, orderNumber: string) {
  return razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    receipt: orderNumber,
    notes: { store: 'URsignature' },
  })
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + '|' + paymentId
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}
```

---

## Step 2: Create Order API `src/app/api/payment/create-order/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createRazorpayOrder } from '@/lib/razorpay'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const body = await request.json()
  const { items, shippingAddress, couponCode, userId, guestEmail } = body

  // 1. Validate items against DB stock
  const variantIds = items.map((i: any) => i.variant_id)
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, price, stock_quantity, product_id, size_ml, products(name, images)')
    .in('id', variantIds)

  if (!variants) return NextResponse.json({ error: 'Failed to fetch products' }, { status: 400 })

  // 2. Verify stock
  for (const item of items) {
    const v = variants.find(v => v.id === item.variant_id)
    if (!v || v.stock_quantity < item.quantity) {
      return NextResponse.json({ error: `${item.name} is out of stock` }, { status: 400 })
    }
  }

  // 3. Calculate totals
  let subtotal = items.reduce((sum: number, item: any) => {
    const v = variants.find(v => v.id === item.variant_id)!
    return sum + (v.price * item.quantity)
  }, 0)

  // 4. Validate coupon
  let discount = 0
  let couponId = null
  if (couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single()

    if (coupon) {
      if (!coupon.min_order_value || subtotal >= coupon.min_order_value) {
        if (!coupon.usage_limit || coupon.used_count < coupon.usage_limit) {
          discount = coupon.type === 'percentage'
            ? Math.min((subtotal * coupon.value) / 100, coupon.max_discount || Infinity)
            : coupon.value
          couponId = coupon.id
        }
      }
    }
  }

  // 5. Calculate shipping
  const { data: settings } = await supabase.from('settings').select('key,value').in('key', ['free_shipping_threshold', 'default_shipping_charge'])
  const settingsMap = Object.fromEntries(settings?.map(s => [s.key, parseFloat(s.value)]) || [])
  const freeThreshold = settingsMap['free_shipping_threshold'] || 999
  const shippingCharge = (subtotal - discount) >= freeThreshold ? 0 : (settingsMap['default_shipping_charge'] || 99)

  const total = subtotal - discount + shippingCharge
  const orderNumber = generateOrderNumber()

  // 6. Create Razorpay order
  const rzpOrder = await createRazorpayOrder(total, orderNumber)

  // 7. Create pending order in DB
  const orderItemsData = items.map((item: any) => {
    const v = variants.find(v => v.id === item.variant_id)!
    return {
      product_id: v.product_id,
      variant_id: v.id,
      product_name: (v.products as any)?.name || item.name,
      product_image: (v.products as any)?.images?.[0] || null,
      size_ml: v.size_ml,
      quantity: item.quantity,
      unit_price: v.price,
      total_price: v.price * item.quantity,
    }
  })

  const { data: order, error } = await supabase.from('orders').insert({
    order_number: orderNumber,
    user_id: userId || null,
    guest_email: guestEmail || null,
    subtotal,
    discount,
    shipping_charge: shippingCharge,
    total,
    coupon_code: couponCode || null,
    coupon_id: couponId,
    shipping_address: shippingAddress,
    razorpay_order_id: rzpOrder.id,
    status: 'pending',
    payment_status: 'pending',
  }).select().single()

  if (error || !order) return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })

  // Insert order items
  await supabase.from('order_items').insert(orderItemsData.map((item: any) => ({ ...item, order_id: order.id })))

  return NextResponse.json({
    orderId: order.id,
    orderNumber,
    razorpayOrderId: rzpOrder.id,
    amount: total,
    currency: 'INR',
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  })
}
```

---

## Step 3: Payment Verification `src/app/api/payment/verify/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { sendOrderConfirmationTelegram } from '@/lib/telegram'
import { createShiprocketOrder } from '@/lib/shiprocket'

export async function POST(request: NextRequest) {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = await request.json()
  const supabase = createAdminClient()

  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
  
  if (!isValid) {
    await supabase.from('orders').update({ payment_status: 'failed', status: 'cancelled' }).eq('id', orderId)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
  }

  // Update order as paid
  const { data: order } = await supabase.from('orders')
    .update({
      payment_status: 'paid',
      status: 'confirmed',
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    })
    .eq('id', orderId)
    .select('*, order_items(*)')
    .single()

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  // Add status history
  await supabase.from('order_status_history').insert({ order_id: orderId, status: 'confirmed', note: 'Payment received' })

  // Increment coupon usage
  if (order.coupon_id) {
    await supabase.rpc('increment', { table: 'coupons', id: order.coupon_id, field: 'used_count' })
  }

  // Create Shiprocket shipment (async, don't block)
  createShiprocketOrder(order).catch(console.error)

  // Send Telegram notification (async)
  sendOrderConfirmationTelegram(order).catch(console.error)

  return NextResponse.json({ success: true, orderNumber: order.order_number })
}
```

---

## Step 4: Shiprocket Integration `src/lib/shiprocket.ts`
```typescript
let shiprocketToken: string | null = null
let tokenExpiry: Date | null = null

async function getShiprocketToken(): Promise<string> {
  if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) return shiprocketToken

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  })
  const data = await res.json()
  shiprocketToken = data.token
  tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000) // 9 days
  return shiprocketToken!
}

export async function createShiprocketOrder(order: any) {
  const token = await getShiprocketToken()
  const addr = order.shipping_address

  const payload = {
    order_id: order.order_number,
    order_date: new Date(order.created_at).toISOString().split('T')[0],
    pickup_location: 'Primary',
    billing_customer_name: addr.name,
    billing_address: addr.address_line1,
    billing_address_2: addr.address_line2 || '',
    billing_city: addr.city,
    billing_pincode: addr.pincode,
    billing_state: addr.state,
    billing_country: 'India',
    billing_email: addr.email || order.guest_email,
    billing_phone: addr.phone,
    shipping_is_billing: true,
    order_items: order.order_items.map((item: any) => ({
      name: `${item.product_name} ${item.size_ml}ml`,
      sku: `${item.variant_id}`,
      units: item.quantity,
      selling_price: item.unit_price,
    })),
    payment_method: 'Prepaid',
    sub_total: order.subtotal,
    length: 10,
    breadth: 10,
    height: 15,
    weight: 0.3,
  }

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  
  if (data.order_id) {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const supabase = createAdminClient()
    await supabase.from('orders').update({
      shiprocket_order_id: data.order_id.toString(),
      shiprocket_shipment_id: data.shipment_id?.toString(),
    }).eq('order_number', order.order_number)
  }

  return data
}

export async function trackShiprocket(shipmentId: string) {
  const token = await getShiprocketToken()
  const res = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}
```

---

## Step 5: Coupon Validation API `src/app/api/coupons/validate/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { code, subtotal, userId } = await request.json()
  const supabase = createAdminClient()

  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single()

  if (!coupon) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return NextResponse.json({ error: 'Coupon expired' }, { status: 400 })
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
  if (coupon.min_order_value && subtotal < coupon.min_order_value) return NextResponse.json({ error: `Minimum order value ₹${coupon.min_order_value} required` }, { status: 400 })

  if (userId && coupon.per_user_limit) {
    const { count } = await supabase.from('coupon_usages').select('*', { count: 'exact' }).eq('coupon_id', coupon.id).eq('user_id', userId)
    if ((count || 0) >= coupon.per_user_limit) return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 })
  }

  const discount = coupon.type === 'percentage'
    ? Math.min((subtotal * coupon.value) / 100, coupon.max_discount || Infinity)
    : Math.min(coupon.value, subtotal)

  return NextResponse.json({ valid: true, discount, coupon: { id: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value } })
}
```

---

## COMPLETION CRITERIA
- [ ] Razorpay order creation API working
- [ ] Razorpay frontend SDK loaded in checkout page
- [ ] Payment verification API with signature check
- [ ] Order status updated to 'confirmed' + 'paid' after successful payment
- [ ] Stock automatically decremented via DB trigger
- [ ] Shiprocket order created after payment
- [ ] Coupon validation API complete
- [ ] Test full checkout flow end-to-end with Razorpay test mode
