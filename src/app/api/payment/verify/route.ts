import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyRazorpaySignature } from '@/lib/razorpay'
import { createShiprocketOrder } from '@/lib/shiprocket'
import { sendOrderAlert } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment data' }, { status: 400 })
    }

    const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('razorpay_order_id', razorpay_order_id)
      .single()

    if (fetchErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.order_number })
    }

    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
      })
      .eq('id', order.id)

    for (const item of order.order_items || []) {
      const { data: v } = await supabase.from('product_variants').select('stock_quantity').eq('id', item.variant_id).single()
      if (v) {
        await supabase
          .from('product_variants')
          .update({ stock_quantity: Math.max(0, (v.stock_quantity ?? 0) - item.quantity) })
          .eq('id', item.variant_id)
      }
    }

    const { data: updated } = await supabase.from('orders').select('*').eq('id', order.id).single()
    if (updated) {
      try {
        await createShiprocketOrder({
          order_number: updated.order_number,
          created_at: updated.created_at,
          shipping_address: updated.shipping_address,
          order_items: (order.order_items || []).map((i: { variant_id: string; product_name: string; size_ml: number; quantity: number; unit_price: number }) => ({
            product_name: i.product_name,
            variant_id: i.variant_id,
            size_ml: i.size_ml,
            quantity: i.quantity,
            unit_price: i.unit_price,
          })),
          subtotal: updated.subtotal,
          guest_email: updated.guest_email,
        })
      } catch {
        // Shiprocket optional
      }
      try {
        await sendOrderAlert({
          order_number: updated.order_number,
          shipping_address: updated.shipping_address,
          guest_email: updated.guest_email,
          subtotal: updated.subtotal,
          discount: updated.discount,
          shipping_charge: updated.shipping_charge,
          total: updated.total,
          created_at: updated.created_at,
          order_items: updated.order_items,
        })
      } catch {
        // Telegram optional
      }
    }

    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.order_number })
  } catch (e) {
    console.error('payment verify error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
