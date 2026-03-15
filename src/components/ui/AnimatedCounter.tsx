'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useSpring } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({ value, duration = 1.5, className = '', prefix = '', suffix = '' }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [displayValue, setDisplayValue] = useState(0)
  const spring = useSpring(0, { stiffness: 75, damping: 15 })

  useEffect(() => {
    if (!isInView) return
    spring.set(value)
  }, [isInView, value, spring])

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => setDisplayValue(Math.round(v)))
    return () => unsubscribe()
  }, [spring])

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}
