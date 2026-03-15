'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

interface ParallaxBannerProps {
  title: string
  subtitle: string
  href: string
  cta: string
  image: string
  alt: string
}

export function ParallaxBanner({ title, subtitle, href, cta, image, alt }: ParallaxBannerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 0.5], [80, -80])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0.6, 1])

  return (
    <section ref={ref} className="relative h-[420px] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <Image
          src={image}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority={false}
          unoptimized={!image.startsWith('http')}
        />
        <div className="absolute inset-0 bg-noir/60" />
      </motion.div>
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
      >
        <h2 className="font-display text-4xl md:text-5xl text-ivory mb-2">{title}</h2>
        <p className="text-smoke-light mb-8 max-w-md">{subtitle}</p>
        <Link
          href={href}
          className="px-8 py-3 border border-gold text-gold font-nav text-xs tracking-[0.3em] uppercase hover:bg-gold hover:text-noir transition-colors"
        >
          {cta}
        </Link>
      </motion.div>
    </section>
  )
}
