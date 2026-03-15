# CURSOR AGENT 09 — Telegram Bot Integration

## Your Role
Build the complete Telegram bot for URsignature. This bot handles: new order alerts, low stock warnings, daily reports, and order lookups via chat commands.

---

## Step 1: `src/lib/telegram.ts`
```typescript
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!

export async function sendTelegramMessage(message: string, parseMode: 'HTML' | 'Markdown' = 'HTML') {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: parseMode }),
  })
}

export async function sendOrderConfirmationTelegram(order: any) {
  const addr = order.shipping_address
  const items = order.order_items?.map((i: any) =>
    `  • ${i.product_name} ${i.size_ml}ml × ${i.quantity} = ₹${i.total_price}`
  ).join('\n')

  const tag = order.is_pos ? '🏪 [POS SALE]' : '🛒 [NEW ORDER]'
  
  const message = `
${tag} <b>${order.order_number}</b>

👤 <b>Customer:</b> ${addr.name}
📞 ${addr.phone}
📧 ${addr.email || order.guest_email || 'Guest'}

📦 <b>Items:</b>
${items}

💰 <b>Subtotal:</b> ₹${order.subtotal}
${order.discount > 0 ? `🏷️ <b>Discount:</b> -₹${order.discount}\n` : ''}🚚 <b>Shipping:</b> ₹${order.shipping_charge}
✅ <b>Total:</b> ₹${order.total}

📍 <b>Ship to:</b>
${addr.address_line1}${addr.address_line2 ? ', ' + addr.address_line2 : ''}
${addr.city}, ${addr.state} - ${addr.pincode}

⏰ ${new Date(order.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
`.trim()

  await sendTelegramMessage(message)
}

export async function sendLowStockAlert(productName: string, sizeMl: number, currentStock: number) {
  const message = `
⚠️ <b>LOW STOCK ALERT</b>

🧴 <b>${productName}</b> (${sizeMl}ml)
📉 Current Stock: <b>${currentStock} units</b>

Please restock soon to avoid losing sales!
`.trim()
  await sendTelegramMessage(message)
}

export async function sendDailyReport(report: DailyReport) {
  const message = `
📊 <b>URsignature Daily Report</b>
📅 ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full', timeZone: 'Asia/Kolkata' })}

💰 <b>Revenue:</b> ₹${report.revenue.toLocaleString('en-IN')}
📦 <b>Orders:</b> ${report.orders}
🆕 <b>New Customers:</b> ${report.newCustomers}
👁️ <b>Sessions:</b> ${report.sessions}
🔄 <b>Conversion:</b> ${report.conversionRate}%

📈 <b>Top Product:</b> ${report.topProduct}

🟡 <b>Pending Orders:</b> ${report.pendingOrders}
⚠️ <b>Low Stock Items:</b> ${report.lowStockCount}

<i>Sent automatically at 11:59 PM IST</i>
`.trim()
  await sendTelegramMessage(message)
}

interface DailyReport {
  revenue: number
  orders: number
  newCustomers: number
  sessions: number
  conversionRate: string
  topProduct: string
  pendingOrders: number
  lowStockCount: number
}
```

---

## Step 2: Telegram Webhook `src/app/api/telegram/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  const update = await request.json()
  const message = update.message

  if (!message?.text) return NextResponse.json({ ok: true })

  const text = message.text.trim()
  const chatId = message.chat.id.toString()

  // Security: only respond to the configured chat
  if (chatId !== process.env.TELEGRAM_CHAT_ID) return NextResponse.json({ ok: true })

  const supabase = createAdminClient()

  // /orders — show last 5 orders
  if (text === '/orders') {
    const { data: orders } = await supabase
      .from('orders')
      .select('order_number, total, status, payment_status, created_at, shipping_address')
      .order('created_at', { ascending: false })
      .limit(5)

    const list = orders?.map(o =>
      `• <b>${o.order_number}</b> — ₹${o.total} — ${o.status} (${o.payment_status})`
    ).join('\n')

    await sendTelegramMessage(`📦 <b>Last 5 Orders:</b>\n\n${list || 'No orders found'}`)
  }

  // /order URS-XXXXX — lookup specific order
  else if (text.startsWith('/order ')) {
    const orderNum = text.replace('/order ', '').trim().toUpperCase()
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNum)
      .single()

    if (!order) {
      await sendTelegramMessage(`❌ Order <b>${orderNum}</b> not found`)
    } else {
      const addr = order.shipping_address
      const items = order.order_items?.map((i: any) =>
        `  • ${i.product_name} ${i.size_ml}ml × ${i.quantity}`
      ).join('\n')

      await sendTelegramMessage(`
🔍 <b>Order: ${order.order_number}</b>
Status: <b>${order.status}</b> | Payment: <b>${order.payment_status}</b>

👤 ${addr.name} | ${addr.phone}
📦 ${items}
💰 Total: ₹${order.total}
📍 ${addr.city}, ${addr.state} ${addr.pincode}
${order.tracking_number ? `🚚 Tracking: ${order.tracking_number}` : ''}
      `.trim())
    }
  }

  // /stock — show low stock items
  else if (text === '/stock') {
    const { data: variants } = await supabase
      .from('product_variants')
      .select('stock_quantity, size_ml, low_stock_threshold, products(name)')
      .order('stock_quantity', { ascending: true })
      .limit(15)

    const list = variants?.map(v => {
      const name = (v.products as any)?.name
      const alert = v.stock_quantity <= v.low_stock_threshold ? '⚠️' : '✅'
      return `${alert} ${name} ${v.size_ml}ml: <b>${v.stock_quantity} units</b>`
    }).join('\n')

    await sendTelegramMessage(`📦 <b>Inventory Status:</b>\n\n${list}`)
  }

  // /revenue — today's revenue
  else if (text === '/revenue') {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('orders')
      .select('total')
      .eq('payment_status', 'paid')
      .gte('created_at', today)

    const total = data?.reduce((sum, o) => sum + o.total, 0) || 0
    const count = data?.length || 0
    await sendTelegramMessage(`💰 <b>Today's Revenue:</b> ₹${total.toLocaleString('en-IN')}\n📦 <b>Orders:</b> ${count}`)
  }

  // /pending — list pending orders
  else if (text === '/pending') {
    const { data: orders } = await supabase
      .from('orders')
      .select('order_number, total, created_at, shipping_address')
      .in('status', ['pending', 'confirmed'])
      .order('created_at', { ascending: true })

    if (!orders?.length) {
      await sendTelegramMessage('✅ No pending orders!')
    } else {
      const list = orders.map(o => `• <b>${o.order_number}</b> — ₹${o.total} — ${(o.shipping_address as any)?.name}`).join('\n')
      await sendTelegramMessage(`⏳ <b>Pending Orders (${orders.length}):</b>\n\n${list}`)
    }
  }

  // /help
  else if (text === '/help') {
    await sendTelegramMessage(`
🤖 <b>URsignature Bot Commands:</b>

/orders — Last 5 orders
/order URS-XXXX — Lookup specific order
/stock — Inventory status
/revenue — Today's revenue
/pending — Pending orders
/help — This menu
    `.trim())
  }

  else {
    await sendTelegramMessage(`Unknown command. Type /help for available commands.`)
  }

  return NextResponse.json({ ok: true })
}
```

---

## Step 3: Daily Report Cron `src/app/api/cron/daily-report/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendDailyReport } from '@/lib/telegram'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const [ordersRes, customersRes, stockRes, analyticsRes] = await Promise.all([
    supabase.from('orders').select('total, status').eq('payment_status', 'paid').gte('created_at', today),
    supabase.from('profiles').select('id').eq('role', 'customer').gte('created_at', today),
    supabase.from('product_variants').select('stock_quantity, low_stock_threshold').filter('stock_quantity', 'lte', 'low_stock_threshold'),
    supabase.from('analytics_events').select('event_type').gte('created_at', today),
  ])

  const orders = ordersRes.data || []
  const revenue = orders.reduce((s, o) => s + o.total, 0)
  const sessions = analyticsRes.data?.filter(e => e.event_type === 'page_view').length || 0
  const conversionRate = sessions > 0 ? ((orders.length / sessions) * 100).toFixed(1) : '0.0'

  // Top product today
  const { data: topItems } = await supabase
    .from('order_items')
    .select('product_name, quantity')
    .gte('created_at', today)
    .order('quantity', { ascending: false })
    .limit(1)

  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['pending', 'confirmed', 'processing'])

  await sendDailyReport({
    revenue,
    orders: orders.length,
    newCustomers: customersRes.data?.length || 0,
    sessions,
    conversionRate,
    topProduct: topItems?.[0]?.product_name || 'N/A',
    pendingOrders: pendingOrders || 0,
    lowStockCount: stockRes.data?.length || 0,
  })

  return NextResponse.json({ success: true })
}
```

---

## Step 4: Low Stock Check Cron `src/app/api/cron/stock-check/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendLowStockAlert } from '@/lib/telegram'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: variants } = await supabase
    .from('product_variants')
    .select('stock_quantity, size_ml, low_stock_threshold, products(name)')
    .filter('stock_quantity', 'lte', 'low_stock_threshold')
    .gt('stock_quantity', 0)

  for (const v of variants || []) {
    await sendLowStockAlert((v.products as any)?.name, v.size_ml, v.stock_quantity)
  }

  return NextResponse.json({ checked: variants?.length || 0 })
}
```

---

## Step 5: Set Up Telegram Webhook
Add this to your admin settings page or run as a one-time script:
```typescript
// Call once to register webhook with Telegram
fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: `${APP_URL}/api/telegram/webhook`,
    allowed_updates: ['message'],
  }),
})
```

## Step 6: Set Up Cloudflare Cron Triggers (in `wrangler.toml`)
```toml
[triggers]
crons = ["59 23 * * *"]  # Daily report at 11:59 PM UTC (= 5:29 AM IST next day — adjust as needed)
# For IST 11:59 PM: "29 18 * * *"
```

---

## COMPLETION CRITERIA
- [ ] `sendTelegramMessage` utility working (test with a manual message)
- [ ] New order notifications firing after successful payment
- [ ] POS sale notifications with [POS] tag
- [ ] Webhook route handling all 6 commands
- [ ] Daily report cron route secured with CRON_SECRET
- [ ] Low stock check cron route working
- [ ] Webhook registered with Telegram
- [ ] Test all bot commands in Telegram group
