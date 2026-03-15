import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { createRazorpayOrder } from '@/lib/razorpay'
import { generateOrderNumber } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const serverSupabase = await createClient()
    const { data: { user } } = await serverSupabase.auth.getUser()
    const body = await request.json()
    const { items, shippingAddress, couponCode, guestEmail, guestPhone } = body
    const userId = user?.id ?? body.userId

    if (!items?.length || !shippingAddress) {
      return NextResponse.json({ error: 'Items and shipping address required' }, { status: 400 })
    }

    const variantIds = items.map((i: { variant_id: string }) => i.variant_id)
    const { data: variants, error: vErr } = await supabase
      .from('product_variants')
      .select('id, price, stock_quantity, product_id, size_ml, products(name, images)')
      .in('id', variantIds)

    if (vErr || !variants?.length) {
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 400 })
    }

    const variantsMap = new Map(variants.map((v) => [v.id, v]))

    for (const item of items) {
      const v = variantsMap.get(item.variant_id)
      if (!v || v.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: v ? `${(v as { products?: { name?: string } }).products?.name || 'Product'} is out of stock` : 'Invalid item' },
          { status: 400 }
        )
      }
    }

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
      const v = variantsMap.get(item.variant_id)!
      const product = v.products as { name?: string; images?: string[] } | null
      subtotal += v.price * item.quantity
      orderItemsData.push({
        product_id: v.product_id,
        variant_id: v.id,
        product_name: product?.name || item.name,
        product_image: product?.images?.[0] || null,
        size_ml: v.size_ml,
        quantity: item.quantity,
        unit_price: v.price,
        total_price: v.price * item.quantity,
      })
    }

    let discount = 0
    let couponId: string | null = null
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', String(couponCode).toUpperCase())
        .eq('is_active', true)
        .single()
      if (coupon) {
        const meetsMin = !coupon.min_order_value || subtotal >= coupon.min_order_value
        const underLimit = !coupon.usage_limit || coupon.used_count < coupon.usage_limit
        if (meetsMin && underLimit) {
          discount =
            coupon.type === 'percentage'
              ? Math.min((subtotal * coupon.value) / 100, coupon.max_discount ?? Infinity)
              : coupon.value
          couponId = coupon.id
        }
      }
    }

    const { data: settingsRows } = await supabase.from('settings').select('key, value').in('key', ['free_shipping_threshold', 'default_shipping_charge'])
    const settings: Record<string, number> = {}
    settingsRows?.forEach((s) => (settings[s.key] = parseFloat(s.value) || 0))
    const freeThreshold = settings.free_shipping_threshold ?? 999
    const shippingCharge = subtotal - discount >= freeThreshold ? 0 : (settings.default_shipping_charge ?? 99)

    const total = subtotal - discount + shippingCharge
    const orderNumber = generateOrderNumber()

    const rzpOrder = await createRazorpayOrder(total, orderNumber)

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId ?? null,
        guest_email: guestEmail ?? null,
        guest_phone: guestPhone ?? null,
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
      })
      .select()
      .single()

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    await supabase.from('order_items').insert(orderItemsData.map((row) => ({ ...row, order_id: order.id })))

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      razorpayOrderId: rzpOrder.id,
      amount: total,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (e) {
    console.error('create-order error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
