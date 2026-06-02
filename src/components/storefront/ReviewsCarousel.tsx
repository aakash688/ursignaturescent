'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StarRating } from '@/components/ui/StarRating'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const reviews = [
  {
    name: 'Rahul M.',
    rating: 5,
    text: 'Midnight Black is incredible. Lasts all day and gets compliments every time. Best value for money.',
  },
  {
    name: 'Priya S.',
    rating: 5,
    text: 'Velvet Desire is my new signature. So elegant and long-lasting. URsignature never disappoints.',
  },
  {
    name: 'Arjun K.',
    rating: 5,
    text: 'King\'s Creed — the closest to the original I\'ve tried. Premium quality at a fraction of the price.',
  },
]

export function ReviewsCarousel() {
  const [index, setIndex] = useState(0)
  const r = reviews[index]

  return (
    <section className="py-24 px-4 bg-noir-elevated/30">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-4xl text-ivory mb-4 text-center">
          What Our Customers Say
        </h2>
        <p className="text-smoke text-center mb-12">
          Join thousands who found their signature scent with URsignature.
        </p>

        <div className="relative">
          <Quote className="absolute -top-2 -left-2 text-gold/20 w-12 h-12" />
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center px-8"
            >
              <StarRating rating={r.rating} size={16} className="justify-center mb-4" />
              <p className="font-display text-xl text-ivory mb-6 italic">&ldquo;{r.text}&rdquo;</p>
              <p className="text-gold font-nav text-sm tracking-wider">{r.name}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setIndex((i) => (i - 1 + reviews.length) % reviews.length)}
              className="p-2 border border-white/10 rounded-full text-ivory hover:border-gold hover:text-gold transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % reviews.length)}
              className="p-2 border border-white/10 rounded-full text-ivory hover:border-gold hover:text-gold transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
