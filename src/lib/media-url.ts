/** Hostnames that do not reliably serve the bound R2 bucket (custom domain not wired). */
const R2_HOSTS = new Set([
  'media.ursignaturescent.com',
  'media.ursignature.com',
])

/**
 * Turn stored R2 URLs into same-origin `/r2/{key}` paths served by the Worker binding.
 */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (!url?.trim()) return ''
  const trimmed = url.trim()
  if (trimmed.startsWith('/r2/')) return trimmed

  try {
    const parsed = new URL(trimmed, 'https://placeholder.local')
    const host = parsed.hostname
    const key = parsed.pathname.replace(/^\//, '')
    if (!key) return trimmed

    if (R2_HOSTS.has(host) || host.endsWith('.r2.dev')) {
      return `/r2/${key}`
    }
  } catch {
    /* keep relative or invalid as-is */
  }

  return trimmed
}

export function extractR2Key(url: string): string | null {
  const resolved = resolveMediaUrl(url)
  if (!resolved.startsWith('/r2/')) return null
  return resolved.slice('/r2/'.length)
}
