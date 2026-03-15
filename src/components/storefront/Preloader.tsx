'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Preloader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('preloader-done')) {
      setVisible(false)
      return
    }
    const t = setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('preloader-done', '1')
    }, 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#080808] flex flex-col items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <p className="font-display text-[120px] leading-none text-gold-shimmer tracking-tight">UR</p>
            <p className="font-nav text-[11px] tracking-[0.5em] text-ivory/40 uppercase mt-2">Signature</p>
          </motion.div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 60 }}
            transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-px bg-gold mt-8"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
