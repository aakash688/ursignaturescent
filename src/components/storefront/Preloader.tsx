'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClientOnly } from '@/components/shared/ClientOnly'

function PreloaderOverlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('preloader-done')) return

    setVisible(true)
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
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <div className="text-center">
            <p className="font-display text-[120px] leading-none text-gold-shimmer tracking-tight">UR</p>
            <p className="font-nav text-[11px] tracking-[0.5em] text-ivory/40 uppercase mt-2">Signature</p>
          </div>
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

export function Preloader() {
  return (
    <ClientOnly>
      <PreloaderOverlay />
    </ClientOnly>
  )
}
