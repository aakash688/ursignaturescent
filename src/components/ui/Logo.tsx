'use client'

import Image from 'next/image'
import Link from 'next/link'
import { DEFAULT_HORIZONTAL_LOGO, resolveSiteLogoUrl } from '@/lib/brand-settings'

const heights = { sm: 'h-8', md: 'h-10', lg: 'h-12', xl: 'h-[52px]' }
const widths = { sm: 160, md: 200, lg: 240, xl: 276 }

const filters = {
  gold: 'brightness(0) saturate(100%) invert(75%) sepia(45%) saturate(500%) hue-rotate(5deg)',
  white: 'brightness(0) invert(1)',
  dim: 'brightness(0) saturate(100%) invert(65%) sepia(30%) saturate(400%) hue-rotate(5deg) opacity(0.6)',
}

interface LogoProps {
  /** From settings `site_logo_url` or leave empty for default horizontal logo */
  src?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** `brand` = full-color horizontal logo (no CSS filter) */
  variant?: 'gold' | 'white' | 'dim' | 'brand'
  href?: string
  className?: string
}

export function Logo({
  src,
  size = 'md',
  variant = 'brand',
  href = '/',
  className = '',
}: LogoProps) {
  const resolved = resolveSiteLogoUrl(src)
  const useBrand = variant === 'brand'
  const filterStyle = useBrand ? undefined : { filter: filters[variant] }
  const w = widths[size]
  const hClass = heights[size]
  const imgClass = `${hClass} w-auto object-contain object-left ${className}`

  const img = resolved.startsWith('/r2/') ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt="URsignature"
      width={w}
      height={Math.round(w * 0.28)}
      className={imgClass}
      style={{ ...filterStyle, maxWidth: w }}
    />
  ) : (
    <Image
      src={resolved}
      alt="URsignature"
      width={w}
      height={Math.round(w * 0.28)}
      className={imgClass}
      style={{ ...filterStyle, maxWidth: w }}
      priority
      unoptimized={resolved === DEFAULT_HORIZONTAL_LOGO}
    />
  )

  return href ? (
    <Link href={href} className="flex items-center shrink-0">
      {img}
    </Link>
  ) : (
    <div className="flex items-center shrink-0">{img}</div>
  )
}
