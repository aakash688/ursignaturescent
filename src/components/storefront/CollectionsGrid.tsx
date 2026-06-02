'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Category } from '@/types'
import { staggerContainer, fadeUp } from '@/lib/animations'

interface CollectionsGridProps {
  categories: Category[]
}

export function CollectionsGrid({ categories }: CollectionsGridProps) {
  const display = categories.slice(0, 8)

  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="py-12 sm:py-24 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl text-ivory mb-4">
          Explore Collections
        </motion.h2>
        <motion.p variants={fadeUp} className="text-smoke mb-8 sm:mb-12 max-w-xl text-sm sm:text-base">
          From inspired-by-luxury to lifestyle essentials — find your perfect scent.
        </motion.p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {display.map((cat, i) => (
            <motion.div key={cat.id} variants={fadeUp}>
              <Link
                href={`/collections/${cat.slug}`}
                className="block p-4 sm:p-6 rounded-lg border border-white/5 hover:border-gold/30 bg-noir-card hover:bg-noir-elevated transition-all group"
              >
                <h3 className="font-display text-base sm:text-lg text-ivory group-hover:text-gold transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-smoke text-sm mt-1 line-clamp-2">{cat.description}</p>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div variants={fadeUp} className="mt-8 text-center">
          <Link
            href="/collections"
            className="text-gold font-nav text-xs tracking-[0.3em] uppercase hover:text-gold-light transition-colors"
          >
            View All Collections →
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}
