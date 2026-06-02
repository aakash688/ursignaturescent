'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { staggerContainer, fadeUp } from '@/lib/animations'

export function FragranceFinderTeaser() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="py-12 sm:py-24 px-4 bg-noir-elevated/50"
    >
      <div className="max-w-3xl mx-auto text-center">
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 text-gold mb-6">
          <Sparkles size={20} />
          <span className="font-nav text-xs tracking-[0.3em] uppercase">Find Your Scent</span>
        </motion.div>
        <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl text-ivory mb-4">
          Not sure which fragrance suits you?
        </motion.h2>
        <motion.p variants={fadeUp} className="text-smoke mb-8 max-w-xl mx-auto">
          Take our quick quiz and discover fragrances tailored to your preferences — occasion, mood, and style.
        </motion.p>
        <motion.div variants={fadeUp}>
          <Link
            href="/fragrance-finder"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gold text-noir font-nav text-xs tracking-[0.3em] uppercase hover:bg-gold-light transition-colors"
          >
            Start Quiz
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}
