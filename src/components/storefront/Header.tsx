'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingBag, User, Search, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useCartStore } from '@/stores/cart'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { SearchOverlay } from './SearchOverlay'
import { motion, AnimatePresence } from 'framer-motion'
import type { Category } from '@/types'

const staticNavLinks = [
  { href: '/products', label: 'All Fragrances' },
  { href: '/fragrance-finder', label: 'Fragrance Finder' },
  { href: '/about', label: 'About' },
]

interface HeaderProps {
  logoUrl?: string | null
}

export function Header({ logoUrl }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [user, setUser] = useState<{ email?: string; avatar_url?: string } | null>(null)
  const { items, toggleCart, getItemCount } = useCartStore()
  const router = useRouter()

  const itemCount = getItemCount()

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setUser(user ?? null))
  }, [])

  useEffect(() => {
    createClient()
      .from('categories')
      .select('id, name, slug, description')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => setCategories((data ?? []) as Category[]))
  }, [])

  const inspiredBy = categories.filter((c) => c.slug.startsWith('inspired-by-'))
  const lifestyle = categories.filter((c) =>
    ['date-night', 'office-wear', 'weekend-casual', 'all-day-wear', 'gifts', 'arabic-oud'].includes(c.slug)
  )
  const gender = categories.filter((c) => ['men', 'women', 'unisex'].includes(c.slug))

  return (
    <>
      <header className="sticky top-0 z-50 bg-noir/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[4.25rem] sm:h-[4.25rem]">
          <Logo href="/" src={logoUrl} size="xl" variant="brand" />

          <nav className="hidden md:flex items-center gap-6">
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <Link
                href="/collections"
                className="flex items-center gap-1 text-sm text-ivory/80 hover:text-gold transition-colors tracking-wider uppercase"
              >
                Collections
                <ChevronDown size={14} className={megaOpen ? 'rotate-180' : ''} />
              </Link>
              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-1 w-[600px] bg-noir-elevated border border-white/10 rounded-lg shadow-xl overflow-hidden"
                  >
                    <div className="p-6 grid grid-cols-3 gap-6">
                      {inspiredBy.length > 0 && (
                        <div>
                          <p className="text-gold text-xs uppercase tracking-wider mb-3">Inspired By</p>
                          <ul className="space-y-2">
                            {inspiredBy.slice(0, 6).map((c) => (
                              <li key={c.id}>
                                <Link
                                  href={`/collections/${c.slug}`}
                                  className="text-sm text-ivory/90 hover:text-gold transition-colors"
                                >
                                  {c.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {lifestyle.length > 0 && (
                        <div>
                          <p className="text-gold text-xs uppercase tracking-wider mb-3">Lifestyle</p>
                          <ul className="space-y-2">
                            {lifestyle.slice(0, 6).map((c) => (
                              <li key={c.id}>
                                <Link
                                  href={`/collections/${c.slug}`}
                                  className="text-sm text-ivory/90 hover:text-gold transition-colors"
                                >
                                  {c.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {gender.length > 0 && (
                        <div>
                          <p className="text-gold text-xs uppercase tracking-wider mb-3">By Gender</p>
                          <ul className="space-y-2">
                            {gender.map((c) => (
                              <li key={c.id}>
                                <Link
                                  href={`/collections/${c.slug}`}
                                  className="text-sm text-ivory/90 hover:text-gold transition-colors"
                                >
                                  {c.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <Link
                      href="/collections"
                      className="block py-3 px-6 border-t border-white/5 text-center text-gold text-sm hover:bg-gold-ghost"
                    >
                      View All Collections
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {staticNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ivory/80 hover:text-gold transition-colors tracking-wider uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-ivory/80 hover:text-gold transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <Link href={user ? '/account' : '/login'} className="p-2 text-ivory/80 hover:text-gold transition-colors">
              <User size={20} />
            </Link>
            <button onClick={toggleCart} className="relative p-2 text-ivory/80 hover:text-gold transition-colors">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-noir text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-ivory/80 hover:text-gold"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-noir md:hidden">
          <div className="flex flex-col h-full pt-16 px-6">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2">
              <X size={24} />
            </button>
            <Link
              href="/collections"
              onClick={() => setMobileOpen(false)}
              className="py-4 text-lg text-ivory border-b border-white/5"
            >
              Collections
            </Link>
            {staticNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-4 text-lg text-ivory border-b border-white/5"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
