'use client'

import { motion } from 'framer-motion'
import { staggerContainer, fadeUp } from '@/lib/animations'

const notes = [
  {
    type: 'Top',
    desc: 'First impression — evaporates in 15–30 mins. Citrus, herbs, spices.',
    color: 'border-gold/40 text-gold-light',
  },
  {
    type: 'Heart',
    desc: 'The soul of the fragrance — lasts 2–4 hours. Florals, fruits, spices.',
    color: 'border-gold/50 text-gold',
  },
  {
    type: 'Base',
    desc: 'The lasting trail — 4+ hours. Woods, musk, vanilla, amber.',
    color: 'border-gold-deep/50 text-gold-pale',
  },
]

export function NotesEducation() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="py-24 px-4 border-y border-white/5"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2 variants={fadeUp} className="font-display text-4xl text-ivory mb-4 text-center">
          Understanding Fragrance Notes
        </motion.h2>
        <motion.p variants={fadeUp} className="text-smoke text-center mb-12 max-w-xl mx-auto">
          Every fragrance has three layers that unfold over time. Here&apos;s how they work.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {notes.map(({ type, desc, color }) => (
            <motion.div
              key={type}
              variants={fadeUp}
              className={`p-6 rounded-lg border-l-4 ${color} bg-noir-card`}
            >
              <h3 className="font-display text-xl text-ivory mb-2">{type} Notes</h3>
              <p className="text-smoke text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
