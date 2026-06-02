'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ShoppingBag, User, Search, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { useCartStore } from '@/stores/cart'
import { createClient } from '@/lib/supabase/client'
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
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false)
  const [cartHydrated, setCartHydrated] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [user, setUser] = useState<{ email?: string; avatar_url?: string } | null>(null)
  const { toggleCart, getItemCount } = useCartStore()

  const itemCount = cartHydrated ? getItemCount() : 0

  useEffect(() => {
    setCartHydrated(true)
  }, [])

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

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setMobileCollectionsOpen(false)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const inspiredBy = categories.filter((c) => c.slug.startsWith('inspired-by-'))
  const lifestyle = categories.filter((c) =>
    ['date-night', 'office-wear', 'weekend-casual', 'all-day-wear', 'gifts', 'arabic-oud'].includes(c.slug)
  )
  const gender = categories.filter((c) => ['men', 'women', 'unisex'].includes(c.slug))

  const closeMobile = () => setMobileOpen(false)

  const iconBtnClass =
    'inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-ivory/80 hover:text-gold transition-colors'

  return (
    <>
      <header className="sticky top-0 z-50 bg-noir/95 backdrop-blur-md border-b border-white/5 pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-16 gap-1 sm:gap-2">
          <div className="shrink-0">
            <Logo href="/" src={logoUrl} size="lg" variant="brand" className="md:hidden" />
            <Logo href="/" src={logoUrl} size="xl" variant="brand" className="hidden md:block" />
          </div>

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

          <div className="flex items-center gap-0 sm:gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className={iconBtnClass}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <Link href={user ? '/account' : '/login'} className={iconBtnClass} aria-label="Account">
              <User size={20} />
            </Link>
            <button onClick={toggleCart} className={`relative ${iconBtnClass}`} aria-label="Cart">
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute top-2 right-2 bg-gold text-noir text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className={`md:hidden ${iconBtnClass}`}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-noir md:hidden">
          <div
            className="flex flex-col h-full overflow-y-auto pt-[calc(4rem+env(safe-area-inset-top,0px))] px-4 pb-[env(safe-area-inset-bottom,0px)]"
          >
            <button
              onClick={closeMobile}
              className="absolute top-[calc(0.75rem+env(safe-area-inset-top,0px))] right-3 min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>

            <div className="border-b border-white/5">
              <button
                type="button"
                onClick={() => setMobileCollectionsOpen((o) => !o)}
                className="flex w-full items-center justify-between py-4 text-lg text-ivory min-h-[48px]"
              >
                Collections
                <ChevronDown size={18} className={`transition-transform ${mobileCollectionsOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileCollectionsOpen && (
                <div className="pb-4 pl-2 space-y-4">
                  {inspiredBy.length > 0 && (
                    <div>
                      <p className="text-gold text-xs uppercase tracking-wider mb-2">Inspired By</p>
                      <ul className="space-y-2">
                        {inspiredBy.slice(0, 6).map((c) => (
                          <li key={c.id}>
                            <Link
                              href={`/collections/${c.slug}`}
                              onClick={closeMobile}
                              className="block py-1.5 text-sm text-ivory/90 hover:text-gold"
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
                      <p className="text-gold text-xs uppercase tracking-wider mb-2">Lifestyle</p>
                      <ul className="space-y-2">
                        {lifestyle.slice(0, 6).map((c) => (
                          <li key={c.id}>
                            <Link
                              href={`/collections/${c.slug}`}
                              onClick={closeMobile}
                              className="block py-1.5 text-sm text-ivory/90 hover:text-gold"
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
                      <p className="text-gold text-xs uppercase tracking-wider mb-2">By Gender</p>
                      <ul className="space-y-2">
                        {gender.map((c) => (
                          <li key={c.id}>
                            <Link
                              href={`/collections/${c.slug}`}
                              onClick={closeMobile}
                              className="block py-1.5 text-sm text-ivory/90 hover:text-gold"
                            >
                              {c.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Link
                    href="/collections"
                    onClick={closeMobile}
                    className="inline-block text-gold text-sm tracking-wider uppercase pt-2"
                  >
                    View All Collections →
                  </Link>
                </div>
              )}
            </div>

            {staticNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="py-4 text-lg text-ivory border-b border-white/5 min-h-[48px] flex items-center"
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
