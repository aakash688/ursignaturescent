'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { X, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { mapProductImagesList } from '@/lib/product-images'
import type { Product } from '@/types'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*, product_variants(*), product_images(url, sort_order, is_primary)')
      .eq('is_active', true)
      .or(`name.ilike.%${q}%,tagline.ilike.%${q}%,inspired_by.ilike.%${q}%`)
      .limit(8)
    setResults(mapProductImagesList<Product>(data ?? []) as Product[])
    setLoading(false)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 300)
    return () => clearTimeout(t)
  }, [query, search])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKey)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-noir/95 backdrop-blur-md"
      >
        <div className="max-w-2xl mx-auto pt-24 px-4" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-smoke w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fragrances..."
              autoFocus
              className="w-full pl-12 pr-12 py-4 bg-noir-elevated border border-white/10 rounded-lg text-ivory placeholder:text-smoke focus:outline-none focus:border-gold/50"
            />
            <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-smoke hover:text-ivory">
              <X size={20} />
            </button>
          </div>

          <div className="mt-6 max-h-[60vh] overflow-y-auto">
            {loading && <p className="text-smoke text-sm">Searching...</p>}
            {!loading && query && results.length === 0 && <p className="text-smoke text-sm">No fragrances found.</p>}
            {!loading && results.length > 0 && (
              <div className="space-y-2">
                {results.map((p) => (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={onClose}
                    className="flex gap-4 p-3 rounded-lg hover:bg-gold-ghost transition-colors"
                  >
                    <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0 bg-charcoal">
                      <Image
                        src={p.images?.[0]?.startsWith('/') ? p.images[0] : `/images/products/${p.slug}-1.png`}
                        alt={p.name}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="text-ivory font-medium">{p.name}</p>
                      {p.inspired_by && <p className="text-gold/80 text-xs">Inspired by {p.inspired_by}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
