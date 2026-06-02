'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/animations'

const links = [
  {
    title: 'Shop Men',
    desc: 'Bold & masculine',
    href: '/collections/men',
  },
  {
    title: 'Shop Women',
    desc: 'Elegant & sensual',
    href: '/collections/women',
  },
  {
    title: 'Best Sellers',
    desc: 'Most loved scents',
    href: '/collections',
  },
]

export function QuickShopStrip() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="border-b border-white/5 bg-noir"
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {links.map(({ title, desc, href }) => (
            <motion.div key={href} variants={fadeUp}>
              <Link
                href={href}
                className="group flex items-center justify-between gap-4 px-5 py-4 border border-white/8 hover:border-gold/35 bg-noir-elevated/40 hover:bg-noir-elevated/70 transition-all duration-300"
              >
                <div>
                  <p className="font-nav text-[11px] tracking-[0.2em] uppercase text-ivory group-hover:text-gold transition-colors">
                    {title}
                  </p>
                  <p className="text-smoke text-xs mt-1">{desc}</p>
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-smoke group-hover:text-gold shrink-0 transition-colors group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1.5}
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
