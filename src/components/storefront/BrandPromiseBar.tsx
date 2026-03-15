'use client'

import { motion } from 'framer-motion'
import { Award, Sparkles, Truck } from 'lucide-react'
import { staggerContainer, fadeUp } from '@/lib/animations'

const promises = [
  {
    icon: Award,
    title: 'Premium Quality',
    desc: 'Long-lasting formulations',
  },
  {
    icon: Sparkles,
    title: 'Inspired by Luxury',
    desc: 'World-famous inspirations',
  },
  {
    icon: Truck,
    title: 'Free Shipping ₹999+',
    desc: 'On all orders',
  },
]

export function BrandPromiseBar() {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="py-12 border-y border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {promises.map(({ icon: Icon, title, desc }) => (
          <motion.div key={title} variants={fadeUp} className="group">
            <div className="inline-flex p-3 rounded-full border border-gold/20 text-gold mb-4 group-hover:border-gold/50 transition-colors">
              <Icon size={24} />
            </div>
            <h3 className="font-display text-lg text-gold">{title}</h3>
            <p className="text-smoke text-sm mt-1">{desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
