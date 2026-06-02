'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  buildHeroSlides,
  resolveSlideCopy,
  resolveSlideFocalClass,
  type HeroSlide,
} from '@/lib/hero-slides'
import { mergeHeroSettings } from '@/lib/hero-settings'

interface HeroSectionProps {
  featuredImage?: string
  hero?: Record<string, string>
  slides?: HeroSlide[]
}

const AUTOPLAY_MS = 5000
const DEFAULT_CTA = { label: 'Shop Collection', href: '/collections' }
const SWIPE_THRESHOLD = 50

type SlideCopy = ReturnType<typeof resolveSlideCopy>

function HeroSlideImage({
  copy,
  focalClass,
  index,
  kenBurns,
  priority,
  animateIn,
}: {
  copy: SlideCopy
  focalClass: string
  index: number
  kenBurns: boolean
  priority?: boolean
  animateIn: boolean
}) {
  if (!copy.imageSrc) return null

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={`${index}-${copy.imageSrc}`}
        className="hero-billboard-slide"
        initial={animateIn ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={copy.imageSrc}
          alt={copy.imageAlt}
          className={`hero-billboard-img ${focalClass}`}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          initial={animateIn && kenBurns ? { scale: 1.08 } : false}
          animate={{ scale: 1 }}
          transition={{ duration: kenBurns ? 7 : 0, ease: 'linear' }}
        />
      </motion.div>
    </AnimatePresence>
  )
}

function HeroSlideCopyBlock({
  copy,
  index,
  ctaLabel,
  ctaUrl,
  variant,
  animateIn,
}: {
  copy: SlideCopy
  index: number
  ctaLabel: string
  ctaUrl: string
  variant: 'mobile' | 'desktop'
  animateIn: boolean
}) {
  const isMobile = variant === 'mobile'

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={`copy-${variant}-${index}`}
          initial={animateIn ? { opacity: 0, y: isMobile ? 12 : 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: isMobile ? -8 : -12 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl w-full"
        >
          <p
            className={
              isMobile
                ? 'font-nav text-[9px] tracking-[0.35em] text-gold uppercase mb-2'
                : 'font-nav text-[10px] tracking-[0.5em] text-gold uppercase mb-5'
            }
          >
            {copy.eyebrow}
          </p>
          <div className="space-y-0.5 sm:space-y-1">
            <h1
              className={`font-display text-ivory italic font-light leading-[0.92]${isMobile ? ' hero-billboard-panel-headline' : ''}`}
              style={isMobile ? undefined : { fontSize: 'clamp(36px, 5vw, 76px)' }}
            >
              {copy.line1}
            </h1>
            <h1
              className={`font-display text-gold-shimmer font-medium leading-[0.92]${isMobile ? ' hero-billboard-panel-headline' : ''}`}
              style={isMobile ? undefined : { fontSize: 'clamp(36px, 5vw, 76px)' }}
            >
              {copy.line2}
            </h1>
          </div>
          <p
            className={
              isMobile
                ? 'font-body text-smoke-light text-xs leading-relaxed mt-2 line-clamp-3'
                : 'font-body text-smoke-light text-sm md:text-base leading-relaxed mt-5 max-w-md'
            }
          >
            {copy.subtitle}
          </p>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={animateIn ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: animateIn ? 0.25 : 0 }}
        className={isMobile ? 'mt-4 w-full' : 'mt-8 w-full sm:w-auto'}
      >
        <Link
          href={ctaUrl}
          className={
            isMobile
              ? 'group relative inline-flex w-full min-h-[48px] px-8 border border-gold text-gold font-nav text-[10px] tracking-[0.2em] uppercase items-center justify-center overflow-hidden transition-colors duration-300 hover:text-noir'
              : 'group relative inline-flex w-full sm:w-auto h-12 px-10 border border-gold text-gold font-nav text-[11px] tracking-[0.25em] uppercase items-center justify-center overflow-hidden transition-colors duration-300 hover:text-noir'
          }
        >
          <span className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
          <span className="relative">{ctaLabel}</span>
        </Link>
      </motion.div>
    </>
  )
}

function HeroSlideDots({
  count,
  index,
  onSelect,
}: {
  count: number
  index: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="hero-billboard-dots flex-wrap" aria-label={`Slide ${index + 1} of ${count}`}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          className={`hero-billboard-dot${i === index ? ' is-active' : ''}`}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === index ? 'true' : undefined}
          onClick={() => onSelect(i)}
        />
      ))}
      <span className="hero-billboard-index w-full text-center mt-1 sm:w-auto sm:mt-0">
        {index + 1} / {count}
      </span>
    </div>
  )
}

export function HeroSection({ featuredImage, hero: heroRaw, slides: slidesProp }: HeroSectionProps) {
  const globals = mergeHeroSettings(heroRaw ?? {})
  const slides = slidesProp?.length
    ? slidesProp
    : buildHeroSlides(globals as Record<string, string>, featuredImage)

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const count = slides.length
  const slide = count ? slides[index % count] : null
  const copy = slide ? resolveSlideCopy(slide, globals as Record<string, string>) : null
  const focalClass = slide ? resolveSlideFocalClass(slide, index) : 'hero-billboard-img--product'

  const ctaLabel = copy?.ctaLabel || DEFAULT_CTA.label
  const ctaUrl = copy?.ctaUrl || DEFAULT_CTA.href

  const go = useCallback(
    (dir: 1 | -1) => {
      if (count <= 1) return
      setIndex((i) => (i + dir + count) % count)
    },
    [count]
  )

  const goTo = useCallback(
    (i: number) => {
      if (count <= 1) return
      setIndex(i % count)
    },
    [count]
  )

  useEffect(() => {
    setHydrated(true)
  }, [])

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setPaused(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      go(delta > 0 ? -1 : 1)
    }
    touchStartX.current = null
    setPaused(false)
  }

  const carouselHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocusCapture: () => setPaused(true),
    onBlurCapture: () => setPaused(false),
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  }

  return (
    <section
      className="hero-billboard hero-billboard--stack relative overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Featured campaigns"
      aria-live="polite"
      {...carouselHandlers}
    >
      {/* Mobile: stacked image band + content panel */}
      <div className="md:hidden flex flex-col">
        <div className="hero-billboard-visual">
          {copy ? (
            <HeroSlideImage
              copy={copy}
              focalClass={focalClass}
              index={index}
              kenBurns={false}
              priority={index === 0}
              animateIn={hydrated}
            />
          ) : (
            <div className="hero-billboard-slide flex items-center justify-center bg-noir-50 text-smoke text-sm">
              Upload hero slides in Admin → Settings
            </div>
          )}
        </div>

        <div className="hero-billboard-panel">
          {copy ? (
            <>
              <HeroSlideCopyBlock
                copy={copy}
                index={index}
                ctaLabel={ctaLabel}
                ctaUrl={ctaUrl}
                variant="mobile"
                animateIn={hydrated}
              />
              {count > 1 && (
                <HeroSlideDots count={count} index={index} onSelect={goTo} />
              )}
            </>
          ) : (
            <p className="text-smoke text-sm">Add hero slides in Admin → Settings</p>
          )}
        </div>
      </div>

      {/* Desktop / tablet: full-bleed overlay */}
      <div className="hidden md:block hero-billboard-overlay">
        <div className="hero-billboard-media">
          {copy ? (
            <HeroSlideImage
              copy={copy}
              focalClass={focalClass}
              index={index}
              kenBurns
              priority={index === 0}
              animateIn={hydrated}
            />
          ) : (
            <div className="hero-billboard-slide flex items-center justify-center bg-noir-50 text-smoke text-sm">
              Upload hero slides in Admin → Settings
            </div>
          )}
        </div>

        <div className="hero-billboard-scrim hero-billboard-scrim--desktop pointer-events-none" aria-hidden />

        <div className="hero-billboard-content">
          {copy ? (
            <HeroSlideCopyBlock
              copy={copy}
              index={index}
              ctaLabel={ctaLabel}
              ctaUrl={ctaUrl}
              variant="desktop"
              animateIn={hydrated}
            />
          ) : (
            <p className="text-smoke">Add hero slides in Admin → Settings</p>
          )}
        </div>

        {count > 1 && (
          <div className="hero-progress hero-progress--desktop" aria-hidden>
            <div
              key={`progress-${index}`}
              className={`hero-progress-bar${paused ? ' is-paused' : ''}`}
              style={{ animationDuration: `${AUTOPLAY_MS}ms` }}
            />
          </div>
        )}

        {hydrated && (
          <motion.div
            className="hero-scroll-cue hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-2 pointer-events-none"
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
        )}
      </div>
    </section>
  )
}
