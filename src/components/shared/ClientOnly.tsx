'use client'

import { useEffect, useState, type ReactNode } from 'react'

/** Renders children only after mount — avoids SSR/client hydration mismatches. */
export function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return children
}
