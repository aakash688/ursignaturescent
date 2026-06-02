import type { Context } from 'hono'
import type { Env } from '../types'
import { getAdminClient } from './supabase'

/**
 * Get user from request Cookie (Supabase stores session in sb-*-auth-token).
 * Returns { user } or null if not authenticated.
 */
export async function getAuthFromRequest(request: Request, env: Env): Promise<{ id: string } | null> {
  const cookie = request.headers.get('Cookie') || ''
  const match = cookie.match(/sb-[^-]+-auth-token=([^;]+)/)
  if (!match) return null
  try {
    const payload = JSON.parse(decodeURIComponent(match[1]))
    const token = payload?.access_token
    if (!token) return null
    const supabase = getAdminClient(env)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null
    return { id: user.id }
  } catch {
    return null
  }
}

/**
 * Middleware: require admin. Call after getAuthFromRequest.
 * Returns 401/403 response or null (continue).
 */
export async function requireAdmin(c: Context<{ Bindings: Env }>): Promise<Response | null> {
  const auth = await getAuthFromRequest(c.req.raw, c.env)
  if (!auth) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  const supabase = getAdminClient(c.env)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.id)
    .single()
  if (profile?.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403)
  }
  return null
}
