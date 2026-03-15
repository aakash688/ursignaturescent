'use client'

import { motion } from 'framer-motion'

interface StrengthLevel {
  label: string
  value: number // 0-100
}

interface FragranceStrengthBarsProps {
  top?: number
  heart?: number
  base?: number
  className?: string
}

const defaultStrength = { top: 70, heart: 85, base: 60 }

export function FragranceStrengthBars({
  top = defaultStrength.top,
  heart = defaultStrength.heart,
  base = defaultStrength.base,
  className = '',
}: FragranceStrengthBarsProps) {
  const levels: StrengthLevel[] = [
    { label: 'Top', value: top },
    { label: 'Heart', value: heart },
    { label: 'Base', value: base },
  ]

  return (
    <div className={`space-y-3 ${className}`}>
      {levels.map(({ label, value }, i) => (
        <div key={label}>
          <div className="flex justify-between text-xs text-smoke mb-1">
            <span>{label}</span>
            <span className="text-gold/80">{value}%</span>
          </div>
          <div className="h-1.5 bg-noir-elevated rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gold rounded-full"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
