'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  alpha: number
  da: number
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = (canvas.width = window.innerWidth)
    let H = (canvas.height = window.innerHeight)

    const particles: Particle[] = Array.from({ length: 180 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.25 + 0.05,
      alpha: Math.random() * 0.25 + 0.05,
      da: (Math.random() - 0.5) * 0.002,
    }))

    const raf = requestAnimationFrame(function loop() {
      ctx.clearRect(0, 0, W, H)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.alpha += p.da
        if (p.alpha < 0.02 || p.alpha > 0.3) p.da *= -1
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201,168,76,${p.alpha})`
        ctx.fill()
      }
      requestAnimationFrame(loop)
    })

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}

interface HeroSectionProps {
  featuredImage?: string
}

export function HeroSection({ featuredImage }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-noir">
      <ParticleCanvas />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_70%_50%,rgba(201,168,76,0.04)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-16 grid lg:grid-cols-2 items-center gap-12 pt-24 pb-20">
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <p className="font-nav text-[10px] tracking-[0.5em] text-gold uppercase mb-6">
              Premium Inspired Fragrances
            </p>
          </motion.div>

          <div className="space-y-2 overflow-hidden">
            {['Your Scent.', 'Your Identity.'].map((line, i) => (
              <motion.h1
                key={line}
                className={`font-display leading-[0.9] ${
                  i === 0
                    ? 'text-ivory italic font-light'
                    : 'text-gold-shimmer font-medium'
                }`}
                style={{ fontSize: 'clamp(52px, 9vw, 120px)' }}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.4 + i * 0.15,
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {line}
              </motion.h1>
            ))}
          </div>

          <motion.p
            className="font-body text-smoke-light text-lg leading-relaxed max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            The world&apos;s finest fragrances, reimagined for you. Inspired by
            luxury. Priced for real life.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/collections/men"
              className="group relative h-12 px-8 border border-gold text-gold font-nav text-[11px] tracking-[0.3em] uppercase flex items-center justify-center overflow-hidden transition-colors duration-300 hover:text-noir"
            >
              <span className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              <span className="relative">Shop Men</span>
            </Link>
            <Link
              href="/collections/women"
              className="group relative h-12 px-8 border border-gold/40 text-ivory/80 font-nav text-[11px] tracking-[0.3em] uppercase flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-gold hover:text-noir"
            >
              <span className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              <span className="relative">Shop Women</span>
            </Link>
            <Link
              href="/fragrance-finder"
              className="h-12 px-6 text-gold/70 font-nav text-[11px] tracking-[0.3em] uppercase flex items-center gap-2 hover:text-gold transition-colors group"
            >
              <span>Find My Scent</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="relative hidden lg:flex items-center justify-center"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute w-64 h-64 rounded-full bg-gold/6 blur-[80px]" />
          <div className="animate-float relative z-10">
            {featuredImage && (
              <Image
                src={featuredImage}
                alt="URsignature Fragrance"
                width={380}
                height={520}
                className="object-contain drop-shadow-2xl"
                style={{
                  filter:
                    'drop-shadow(0 40px 60px rgba(0,0,0,0.6)) drop-shadow(0 0 40px rgba(201,168,76,0.08))',
                }}
                priority
              />
            )}
          </div>
          <div className="absolute w-[400px] h-[400px] rounded-full border border-gold/6" style={{ animation: 'spin 30s linear infinite' }} />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-gold/4" style={{ animation: 'spin 20s linear infinite reverse' }} />
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="font-nav text-[9px] tracking-[0.4em] text-smoke uppercase">
          Scroll
        </span>
        <motion.div
          className="w-px h-12 bg-gradient-to-b from-gold to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
