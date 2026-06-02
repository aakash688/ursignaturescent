import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from './types'
import publicRoutes from './routes/public'
import adminRoutes from './routes/admin'

const app = new Hono<{ Bindings: Env }>()

app.use(
  '*',
  cors({
    origin: (origin) => origin || 'https://ursignature-ui.pages.dev',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: [],
    maxAge: 86400,
    credentials: true,
  })
)

app.route('/api', publicRoutes)
app.route('/api/admin', adminRoutes)

app.get('/api/health', (c) => c.json({ ok: true, service: 'ursignature-api' }))

app.onError((err, c) => {
  const message = err?.message ?? 'Internal Server Error'
  return c.json({ error: message }, 500)
})

export default app
