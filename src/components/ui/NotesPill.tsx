'use client'

import { motion } from 'framer-motion'

interface NotesPillProps {
  notes: string[]
  variant?: 'top' | 'heart' | 'base'
  className?: string
}

const variantStyles = {
  top: 'border-gold/40 bg-gold/5 text-gold-light',
  heart: 'border-gold/30 bg-gold-ghost text-gold',
  base: 'border-gold-deep/40 bg-gold-muted text-gold-pale',
}

export function NotesPill({ notes, variant = 'top', className = '' }: NotesPillProps) {
  if (!notes?.length) return null

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {notes.map((note, i) => (
        <motion.span
          key={note}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]}`}
        >
          {note}
        </motion.span>
      ))}
    </div>
  )
}
