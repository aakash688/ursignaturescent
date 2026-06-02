/**
 * API client for the Workers API.
 * Base URL from VITE_WORKERS_API_URL (no trailing slash).
 * Use credentials: 'include' so cookies (Supabase session) are sent for admin routes.
 */

const baseUrl = (import.meta.env.VITE_WORKERS_API_URL as string) || ''

function url(path: string, params?: Record<string, string>): string {
  const p = path.startsWith('/') ? path : `/${path}`
  const full = `${baseUrl.replace(/\/$/, '')}${p}`
  if (!params || Object.keys(params).length === 0) return full
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => v != null && v !== '' && search.set(k, v))
  const q = search.toString()
  return q ? `${full}?${q}` : full
}

export async function get<T = unknown>(path: string, params?: Record<string, string>): Promise<T> {
  const res = await fetch(url(path, params), { method: 'GET', credentials: 'include' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function post<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(url(path), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body != null ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function put<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(url(path), {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body != null ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function patch<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(url(path), {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body != null ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function del(path: string): Promise<void> {
  const res = await fetch(url(path), { method: 'DELETE', credentials: 'include' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error?: string }).error || res.statusText)
  }
}

export function getBaseUrl(): string {
  return baseUrl.replace(/\/$/, '')
}
