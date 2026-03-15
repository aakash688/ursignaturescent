const API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN || ''}`

export async function sendTelegramMessage(
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<void> {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return

  try {
    await fetch(`${API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: parseMode,
      }),
    })
  } catch (err) {
    console.error('Telegram send failed:', err)
  }
}

export async function sendOrderAlert(order: {
  order_number: string
  is_pos?: boolean
  shipping_address: Record<string, string>
  guest_email?: string | null
  subtotal: number
  discount: number
  shipping_charge: number
  total: number
  created_at: string
  order_items?: Array<{ product_name: string; size_ml: number; quantity: number; total_price: number }>
}) {
  const addr = order.shipping_address
  const tag = order.is_pos ? '🏪 <b>POS SALE</b>' : '🛒 <b>NEW ORDER</b>'

  const items = order.order_items
    ?.map(i => `  • ${i.product_name} ${i.size_ml}ml × ${i.quantity} = ₹${i.total_price}`)
    .join('\n') ?? ''

  const text = `${tag}

🔖 <b>Order:</b> ${order.order_number}
👤 <b>Customer:</b> ${addr.name}
📞 ${addr.phone}
📧 ${addr.email || order.guest_email || 'Guest'}

📦 <b>Items:</b>
${items}

💰 Subtotal: ₹${order.subtotal}${order.discount > 0 ? `\n🏷️ Discount: -₹${order.discount}` : ''}
🚚 Shipping: ₹${order.shipping_charge}
✅ <b>Total: ₹${order.total}</b>

📍 ${addr.city}, ${addr.state} ${addr.pincode}
⏰ ${new Date(order.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`

  await sendTelegramMessage(text)
}

export async function sendLowStockAlert(
  productName: string,
  sizeMl: number,
  currentStock: number
) {
  await sendTelegramMessage(`⚠️ <b>LOW STOCK ALERT</b>

🧴 <b>${productName}</b> (${sizeMl}ml)
📉 Only <b>${currentStock} units</b> remaining

Please restock soon!`)
}

export async function sendDailyReport(stats: {
  revenue: number
  orders: number
  newCustomers: number
  sessions: number
  pendingOrders: number
  lowStockCount: number
  topProduct: string
  conversionRate: string
}) {
  const date = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })

  await sendTelegramMessage(`📊 <b>URsignature Daily Report</b>
📅 ${date}

💰 Revenue: <b>₹${stats.revenue.toLocaleString('en-IN')}</b>
📦 Orders: <b>${stats.orders}</b>
🆕 New Customers: <b>${stats.newCustomers}</b>
👁️ Sessions: <b>${stats.sessions}</b>
📈 Conversion: <b>${stats.conversionRate}%</b>

🏆 Top Product: ${stats.topProduct}
⏳ Pending Orders: ${stats.pendingOrders}
⚠️ Low Stock Items: ${stats.lowStockCount}

<i>Auto-report | URsignature</i>`)
}
