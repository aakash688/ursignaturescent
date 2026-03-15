'use client'

import Image from 'next/image'
import Link from 'next/link'

const sizes = { sm: 'h-7', md: 'h-9', lg: 'h-12' }
const filters = {
  gold: 'brightness(0) saturate(100%) invert(75%) sepia(45%) saturate(500%) hue-rotate(5deg)',
  white: 'brightness(0) invert(1)',
  dim: 'brightness(0) saturate(100%) invert(65%) sepia(30%) saturate(400%) hue-rotate(5deg) opacity(0.6)',
}

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'gold' | 'white' | 'dim'
  href?: string
  className?: string
}

export function Logo({ size = 'md', variant = 'gold', href = '/', className = '' }: LogoProps) {
  const img = (
    <Image
      src="/logo.png"
      alt="URsignature"
      width={120}
      height={40}
      className={`${sizes[size]} w-auto object-contain ${className}`}
      style={{ filter: filters[variant] }}
      priority
    />
  )

  return href ? (
    <Link href={href} className="flex items-center gap-2">
      {img}
    </Link>
  ) : (
    <div className="flex items-center gap-2">{img}</div>
  )
}
