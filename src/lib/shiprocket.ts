let cachedToken: string | null = null
let tokenExpiry: number = 0

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    }),
  })

  if (!res.ok) throw new Error('Shiprocket auth failed')
  const data = await res.json()
  cachedToken = data.token
  tokenExpiry = Date.now() + 8 * 24 * 60 * 60 * 1000
  return cachedToken!
}

export async function createShiprocketOrder(order: {
  order_number: string
  created_at: string
  shipping_address: Record<string, string>
  order_items: Array<{ product_name: string; variant_id: string; size_ml: number; quantity: number; unit_price: number }>
  subtotal: number
  guest_email?: string | null
}) {
  const token = await getToken()
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
    billing_email: addr.email || order.guest_email || 'customer@ursignature.com',
    billing_phone: addr.phone,
    shipping_is_billing: true,
    order_items: order.order_items.map(item => ({
      name: `${item.product_name} ${item.size_ml}ml`,
      sku: item.variant_id,
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

  const res = await fetch(
    'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  )

  return res.json()
}

export async function trackOrder(shipmentId: string) {
  const token = await getToken()
  const res = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return res.json()
}
