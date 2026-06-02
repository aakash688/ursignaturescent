/**
 * Upload hero campaign banners to R2 and set hero_slides in Supabase settings.
 * Run: node --env-file=.env.local scripts/upload-hero-banners.mjs
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

try {
  const { config } = await import('dotenv')
  config({ path: join(root, '.env.local') })
  config({ path: join(root, '.env') })
} catch {
  /* use --env-file */
}

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'ursignature-media'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('Missing R2 credentials in .env.local')
  process.exit(1)
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const BRAND_SLIDE = {
  file: 'All combined.png',
  slug: 'all-fragrances',
  alt: 'UR Signature — Premium Inspired Fragrances',
  eyebrow: 'Premium Inspired Fragrances',
  title_line1: 'Your Scent.',
  title_line2: 'Your Identity.',
  subtitle:
    "The world's finest fragrances, reimagined for you. Inspired by luxury. Priced for real life.",
  cta_label: 'Shop Collection',
  cta_url: '/collections',
}

const SLIDES = [
  {
    file: 'Deep Blue.png',
    slug: 'deep-blue',
    alt: 'Deep Blue — UR Signature',
    eyebrow: "MEN'S COLLECTION",
    title_line1: 'Deep Blue.',
    title_line2: 'Ocean Fresh.',
    subtitle: 'Inspired by Bleu de Chanel. Elegant versatility from boardroom to bar.',
    cta_label: 'Shop Deep Blue',
    cta_url: '/product/deep-blue',
  },
  {
    file: 'midnight black.png',
    slug: 'midnight-black',
    alt: 'Midnight Black — UR Signature',
    eyebrow: "MEN'S COLLECTION",
    title_line1: 'Midnight Black.',
    title_line2: 'Fearless Fresh.',
    subtitle: 'Inspired by Dior Sauvage. Bold masculine freshness for the fearless.',
    cta_label: 'Shop Midnight Black',
    cta_url: '/product/midnight-black',
  },
  {
    file: 'king creed.png',
    slug: 'kings-creed',
    alt: "King's Creed — UR Signature",
    eyebrow: "MEN'S COLLECTION",
    title_line1: "King's Creed.",
    title_line2: 'Power Distilled.',
    subtitle: 'Inspired by Creed Aventus. The signature of ambition and success.',
    cta_label: "Shop King's Creed",
    cta_url: '/product/kings-creed',
  },
  {
    file: 'urbanedge.png',
    slug: 'urban-edge',
    alt: 'Urban Edge — UR Signature',
    eyebrow: "MEN'S COLLECTION",
    title_line1: 'Urban Edge.',
    title_line2: 'Modern Signature.',
    subtitle: 'Inspired by YSL Y. The modern professional\'s signature scent.',
    cta_label: 'Shop Urban Edge',
    cta_url: '/product/urban-edge',
  },
  {
    file: 'Game on.png',
    slug: 'game-on',
    alt: 'Game On — UR Signature',
    eyebrow: "MEN'S COLLECTION",
    title_line1: 'Game On.',
    title_line2: 'Never Stop.',
    subtitle: 'Energy that never quits. For those who live at full speed.',
    cta_label: 'Shop Game On',
    cta_url: '/product/game-on',
  },
  {
    file: 'bloom kiss.png',
    slug: 'bloom-kiss',
    alt: 'Bloom Kiss — UR Signature',
    eyebrow: "WOMEN'S COLLECTION",
    title_line1: 'Bloom Kiss.',
    title_line2: 'Romance Bottled.',
    subtitle: 'Inspired by Gucci Flora. Light, floral, and unforgettable.',
    cta_label: 'Shop Bloom Kiss',
    cta_url: '/product/bloom-kiss',
  },
  {
    file: 'velvet desire.png',
    slug: 'velvet-desire',
    alt: 'Velvet Desire — UR Signature',
    eyebrow: "WOMEN'S COLLECTION",
    title_line1: 'Velvet Desire.',
    title_line2: 'Nights Remembered.',
    subtitle: 'Inspired by Good Girl. For nights that linger in memory.',
    cta_label: 'Shop Velvet Desire',
    cta_url: '/product/velvet-desire',
  },
  {
    file: 'Flirt Rush.png',
    slug: 'flirt-rush',
    alt: 'Flirt Rush — UR Signature',
    eyebrow: "WOMEN'S COLLECTION",
    title_line1: 'Flirt Rush.',
    title_line2: 'Pure Energy.',
    subtitle: 'Inspired by Bombshell. Young, free, and intoxicatingly fun.',
    cta_label: 'Shop Flirt Rush',
    cta_url: '/product/flirt-rush',
  },
  {
    file: 'mystic berry.png',
    slug: 'mystic-berry',
    alt: 'Mystic Berry — UR Signature',
    eyebrow: "WOMEN'S COLLECTION",
    title_line1: 'Mystic Berry.',
    title_line2: 'Exclusively Yours.',
    subtitle: 'UR Signature original. A scent like no other.',
    cta_label: 'Shop Mystic Berry',
    cta_url: '/product/mystic-berry',
  },
  {
    file: 'royal oud.png',
    slug: 'royal-oud',
    alt: 'Royal Oud — UR Signature',
    eyebrow: 'PREMIUM COLLECTION',
    title_line1: 'Royal Oud.',
    title_line2: 'Royalty Distilled.',
    subtitle: 'Inspired by Amir Al Oudh. For those who demand the extraordinary.',
    cta_label: 'Shop Royal Oud',
    cta_url: '/product/royal-oud',
  },
]

async function uploadToR2(key, buffer) {
  await R2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )
  return `/r2/${key}`
}

const heroSlides = []

for (const slide of [BRAND_SLIDE, ...SLIDES]) {
  const filePath = join(root, slide.file)
  if (!existsSync(filePath)) {
    console.error(`Missing file: ${filePath}`)
    process.exit(1)
  }
  const buffer = readFileSync(filePath)
  const key = `hero/campaign/${slide.slug}.png`
  const image_url = await uploadToR2(key, buffer)
  console.log(`Uploaded ${slide.file} → ${image_url}`)
  heroSlides.push({
    image_url,
    alt: slide.alt,
    eyebrow: slide.eyebrow,
    title_line1: slide.title_line1,
    title_line2: slide.title_line2,
    subtitle: slide.subtitle,
    cta_label: slide.cta_label,
    cta_url: slide.cta_url,
  })
}

const { error } = await supabase.from('settings').upsert(
  { key: 'hero_slides', value: JSON.stringify(heroSlides) },
  { onConflict: 'key' }
)

if (error) {
  console.error('Supabase upsert failed:', error.message)
  process.exit(1)
}

console.log(`\nDone — ${heroSlides.length} hero slides saved to settings.hero_slides`)
