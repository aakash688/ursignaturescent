import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json()
    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json({ error: 'Code and subtotal required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', String(code).toUpperCase().trim())
      .eq('is_active', true)
      .single()

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired coupon' })
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Coupon has expired' })
    }

    if (coupon.min_order_value && subtotal < coupon.min_order_value) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order value is ₹${coupon.min_order_value}`,
      })
    }

    if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' })
    }

    const discount =
      coupon.type === 'percentage'
        ? Math.min((subtotal * coupon.value) / 100, coupon.max_discount ?? Infinity)
        : coupon.value

    return NextResponse.json({
      valid: true,
      discount,
      couponCode: coupon.code,
      message: coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`,
    })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
