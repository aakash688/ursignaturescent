'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { buildHeroSlides, resolveSlideCopy, type HeroSlide } from '@/lib/hero-slides'
import { mergeHeroSettings } from '@/lib/hero-settings'

interface HeroSectionProps {
  featuredImage?: string
  hero?: Record<string, string>
  slides?: HeroSlide[]
}

const AUTOPLAY_MS = 5000
const DEFAULT_CTA = { label: 'Shop Collection', href: '/collections' }

export function HeroSection({ featuredImage, hero: heroRaw, slides: slidesProp }: HeroSectionProps) {
  const globals = mergeHeroSettings(heroRaw ?? {})
  const slides = slidesProp?.length
    ? slidesProp
    : buildHeroSlides(globals as Record<string, string>, featuredImage)

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length
  const slide = count ? slides[index % count] : null
  const copy = slide ? resolveSlideCopy(slide, globals as Record<string, string>) : null

  const ctaLabel = copy?.ctaLabel || DEFAULT_CTA.label
  const ctaUrl = copy?.ctaUrl || DEFAULT_CTA.href

  const go = useCallback(
    (dir: 1 | -1) => {
      if (count <= 1) return
      setIndex((i) => (i + dir + count) % count)
    },
    [count]
  )

  useEffect(() => {
    if (count <= 1 || paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [count, paused, index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  return (
    <section
      className="hero-billboard relative bg-noir overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured campaigns"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Full-bleed background slides */}
      <div className="hero-billboard-media">
        <AnimatePresence mode="sync">
          {copy?.imageSrc ? (
            <motion.div
              key={`${index}-${copy.imageSrc}`}
              className="hero-billboard-slide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                src={copy.imageSrc}
                alt={copy.imageAlt}
                className="hero-billboard-img"
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 7, ease: 'linear' }}
              />
            </motion.div>
          ) : (
            <div className="hero-billboard-slide flex items-center justify-center bg-noir-50 text-smoke text-sm">
              Upload hero slides in Admin → Settings
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Readability scrim */}
      <div className="hero-billboard-scrim pointer-events-none" aria-hidden />

      {/* Text overlay — one message + one CTA per slide */}
      <div className="hero-billboard-content">
        {copy ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={`copy-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-xl"
              >
                <p className="font-nav text-[10px] tracking-[0.5em] text-gold uppercase mb-5">
                  {copy.eyebrow}
                </p>
                <div className="space-y-1">
                  <h1
                    className="font-display text-ivory italic font-light leading-[0.92]"
                    style={{ fontSize: 'clamp(36px, 5vw, 76px)' }}
                  >
                    {copy.line1}
                  </h1>
                  <h1
                    className="font-display text-gold-shimmer font-medium leading-[0.92]"
                    style={{ fontSize: 'clamp(36px, 5vw, 76px)' }}
                  >
                    {copy.line2}
                  </h1>
                </div>
                <p className="font-body text-smoke-light text-sm md:text-base leading-relaxed mt-5 max-w-md">
                  {copy.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-8"
            >
              <Link
                href={ctaUrl}
                className="group relative inline-flex h-12 px-10 border border-gold text-gold font-nav text-[11px] tracking-[0.25em] uppercase items-center justify-center overflow-hidden transition-colors duration-300 hover:text-noir"
              >
                <span className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <span className="relative">{ctaLabel}</span>
              </Link>
            </motion.div>
          </>
        ) : (
          <p className="text-smoke">Add hero slides in Admin → Settings</p>
        )}
      </div>

      {count > 1 && (
        <div className="hero-progress" aria-hidden>
          <div
            key={`progress-${index}`}
            className={`hero-progress-bar${paused ? ' is-paused' : ''}`}
            style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
          />
        </div>
      )}

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="font-nav text-[9px] tracking-[0.4em] text-smoke/80 uppercase">Scroll</span>
        <motion.div
          className="w-px h-8 bg-gradient-to-b from-gold/60 to-transparent"
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}
