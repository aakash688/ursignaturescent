import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderNumber = searchParams.get('orderNumber')
  const email = searchParams.get('email')

  if (!orderNumber?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'orderNumber and email required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()

  const { data: orderByGuest } = await supabase
    .from('orders')
    .select('id, order_number, status, total, tracking_number, tracking_url, courier_name, order_items(product_name, size_ml, quantity, total_price)')
    .eq('order_number', orderNumber.trim())
    .eq('guest_email', email.trim())
    .single()

  if (orderByGuest) return NextResponse.json({ order: orderByGuest })

  if (user?.user?.id) {
    const { data: orderByUser } = await supabase
      .from('orders')
      .select('id, order_number, status, total, tracking_number, tracking_url, courier_name, order_items(product_name, size_ml, quantity, total_price)')
      .eq('order_number', orderNumber.trim())
      .eq('user_id', user.user.id)
      .single()
    if (orderByUser) return NextResponse.json({ order: orderByUser })
  }

  return NextResponse.json({ error: 'Order not found' }, { status: 404 })
}
