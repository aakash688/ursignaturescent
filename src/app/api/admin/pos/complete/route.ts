import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-admin'
import { createAdminClient } from '@/lib/supabase/server'
import { generateOrderNumber } from '@/lib/utils'
import { sendOrderAlert } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (auth) return auth

  const body = await request.json()
  const { items, customer_name, customer_phone, customer_email, payment_method, payment_reference, discount: discountAmount } = body

  if (!items?.length) {
    return NextResponse.json({ error: 'items array required (variant_id, quantity)' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const variantIds = items.map((i: { variant_id: string }) => i.variant_id)
  const { data: variants, error: vErr } = await supabase
    .from('product_variants')
    .select('id, price, stock_quantity, product_id, size_ml, products(name, images)')
    .in('id', variantIds)

  if (vErr || !variants?.length) {
    return NextResponse.json({ error: 'Invalid or missing variants' }, { status: 400 })
  }

  const variantMap = new Map(variants.map((v) => [v.id, v]))
  let subtotal = 0
  const orderItemsData: Array<{
    product_id: string
    variant_id: string
    product_name: string
    product_image: string | null
    size_ml: number
    quantity: number
    unit_price: number
    total_price: number
  }> = []

  for (const item of items) {
    const v = variantMap.get(item.variant_id)
    if (!v) return NextResponse.json({ error: `Variant ${item.variant_id} not found` }, { status: 400 })
    if (v.stock_quantity < (item.quantity || 1)) {
      return NextResponse.json({ error: `Insufficient stock for ${(v.products as { name?: string })?.name ?? 'item'}` }, { status: 400 })
    }
    const qty = Math.max(1, Number(item.quantity) || 1)
    const product = v.products as { name?: string; images?: string[] } | null
    subtotal += v.price * qty
    orderItemsData.push({
      product_id: v.product_id,
      variant_id: v.id,
      product_name: product?.name ?? 'Product',
      product_image: product?.images?.[0] ?? null,
      size_ml: v.size_ml,
      quantity: qty,
      unit_price: v.price,
      total_price: v.price * qty,
    })
  }

  const discount = Math.max(0, Number(discountAmount) ?? 0)
  const shippingCharge = 0
  const total = Math.max(0, subtotal - discount + shippingCharge)
  const orderNumber = generateOrderNumber()

  const shippingAddress = {
    name: customer_name || 'POS Customer',
    phone: customer_phone || '',
    email: customer_email || '',
    address_line1: 'POS Sale',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'IN',
  }

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: null,
      guest_email: customer_email || null,
      guest_phone: customer_phone || null,
      subtotal,
      discount,
      shipping_charge: shippingCharge,
      total,
      coupon_code: null,
      coupon_id: null,
      shipping_address: shippingAddress,
      razorpay_order_id: null,
      razorpay_payment_id: null,
      razorpay_signature: null,
      status: 'confirmed',
      payment_status: 'paid',
      payment_method: payment_method || 'cash',
      is_pos: true,
    })
    .select()
    .single()

  if (orderErr || !order) {
    return NextResponse.json({ error: orderErr?.message ?? 'Failed to create order' }, { status: 500 })
  }

  await supabase.from('order_items').insert(orderItemsData.map((row) => ({ ...row, order_id: order.id })))

  for (const oi of orderItemsData) {
    const { data: v } = await supabase.from('product_variants').select('stock_quantity').eq('id', oi.variant_id).single()
    if (v) {
      const newQty = Math.max(0, (v.stock_quantity ?? 0) - oi.quantity)
      await supabase.from('product_variants').update({ stock_quantity: newQty, updated_at: new Date().toISOString() }).eq('id', oi.variant_id)
      await supabase.from('inventory_transactions').insert({
        variant_id: oi.variant_id,
        type: 'pos_sale',
        quantity_change: -oi.quantity,
        quantity_after: newQty,
        order_id: order.id,
        note: `POS ${orderNumber}`,
      })
    }
  }

  const orderWithItems = { ...order, order_items: orderItemsData }
  try {
    await sendOrderAlert({
      order_number: orderNumber,
      is_pos: true,
      shipping_address: shippingAddress,
      guest_email: customer_email || null,
      subtotal,
      discount,
      shipping_charge: shippingCharge,
      total,
      created_at: order.created_at,
      order_items: orderItemsData,
    })
  } catch {
    // ignore
  }

  return NextResponse.json(orderWithItems)
}
