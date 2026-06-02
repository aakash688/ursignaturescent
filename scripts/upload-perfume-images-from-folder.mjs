/**
 * Upload all images from "Purfume images" folder to R2 and map to products.
 * - Each subfolder = one product (e.g. "Bloom Kiss", "Deep Blue"). Images inside go to R2 products/{slug}/.
 * - Name corrections: fix folder name → slug/product name (see CORRECTIONS below).
 * - If product doesn't exist in DB, creates it with name + slug then links images.
 *
 * Prereqs: .env.local has R2_*, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Run: node --env-file=.env.local scripts/upload-perfume-images-from-folder.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
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
  // use node --env-file=.env.local
}

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'ursignature-media'
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://media.ursignature.com'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('Missing R2_* in .env.local')
  process.exit(1)
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_* in .env.local')
  process.exit(1)
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Folder name (exact as on disk) → { slug, name }. Fix typos and display names here. */
const CORRECTIONS = {
  'Bloom Kiss': { slug: 'bloom-kiss', name: 'Bloom Kiss' },
  'Deep Blue': { slug: 'deep-blue', name: 'Deep Blue' },
  'Flirt Rush': { slug: 'flirt-rush', name: 'Flirt Rush' },
  'Game On': { slug: 'game-on', name: 'Game On' },
  'Kings Creed': { slug: 'kings-creed', name: "King's Creed" },
  'Midnight Black': { slug: 'midnight-black', name: 'Midnight Black' },
  'Mystic Berry': { slug: 'mystic-berry', name: 'Mystic Berry' },
  'Royal Oud': { slug: 'royal-oud', name: 'Royal Oud' },
  'Urban Edge': { slug: 'urban-edge', name: 'Urban Edge' },
  'Velvet Desire': { slug: 'velvet-desire', name: 'Velvet Desire' },
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

function getContentType(path) {
  if (path.endsWith('.png')) return 'image/png'
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg'
  if (path.endsWith('.webp')) return 'image/webp'
  if (path.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

function safeFilename(name) {
  return name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .slice(0, 40)
}

async function uploadToR2(key, buffer, contentType) {
  await R2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )
  return `${PUBLIC_URL}/${key}`
}

async function ensureProduct(slug, name) {
  const { data: existing, error: findErr } = await supabase.from('products').select('id').eq('slug', slug).single()
  if (findErr && findErr.code !== 'PGRST116') {
    console.warn(`  Warning: lookup product by slug "${slug}":`, findErr.message)
  }
  if (existing) {
    return existing.id
  }
  const { data: created, error } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      tagline: null,
      description: null,
      short_description: null,
      inspired_by: null,
      category_type: 'unisex',
      fragrance_profile: null,
      top_notes: [],
      heart_notes: [],
      base_notes: [],
      rating: 0,
      is_featured: false,
      is_active: true,
      meta_title: null,
      meta_description: null,
      sort_order: 0,
      images: [],
    })
    .select('id')
    .single()
  if (error) throw new Error(`Create product ${slug}: ${error.message}`)
  console.log(`  Created product: ${name} (${slug})`)
  return created.id
}

async function main() {
  const perfumeDir = join(root, 'Purfume images')
  if (!existsSync(perfumeDir)) {
    console.error('Folder "Purfume images" not found at project root.')
    process.exit(1)
  }

  const dirs = readdirSync(perfumeDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  console.log(`Found ${dirs.length} product folders in "Purfume images".\n`)

  for (const folderName of dirs) {
    const { slug, name } = CORRECTIONS[folderName] ?? { slug: slugify(folderName), name: folderName }
    const folderPath = join(perfumeDir, folderName)
    const files = readdirSync(folderPath).filter((f) => /\.(png|jpg|jpeg|webp|gif)$/i.test(f))
    if (files.length === 0) {
      console.log(`Skip "${folderName}" (no images).`)
      continue
    }

    console.log(`\n${name} (${slug}) — ${files.length} image(s)`)

    const productId = await ensureProduct(slug, name)

    const urls = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const path = join(folderPath, file)
      const buf = readFileSync(path)
      const ext = (file.split('.').pop() || 'jpg').toLowerCase().replace('jpeg', 'jpg')
      const safe = safeFilename(file) || `img-${i + 1}`
      const key = `products/${slug}/${Date.now()}-${i}-${safe}.${ext}`
      const url = await uploadToR2(key, buf, getContentType(path))
      urls.push(url)
      console.log(`  Uploaded ${i + 1}/${files.length} → ${url}`)
    }

    const { error: delErr } = await supabase.from('product_images').delete().eq('product_id', productId)
    if (delErr) {
      console.error(`  ERROR deleting old product_images for ${slug}:`, delErr.message)
      continue
    }

    const rows = urls.map((url, i) => ({
      product_id: productId,
      url,
      sort_order: i,
      is_primary: i === 0,
    }))
    const { error: insErr } = await supabase.from('product_images').insert(rows)
    if (insErr) {
      console.error(`  ERROR inserting product_images for ${slug}:`, insErr.message)
      continue
    }

    const { error: updErr } = await supabase.from('products').update({ images: urls }).eq('id', productId)
    if (updErr) {
      console.error(`  ERROR updating products.images for ${slug}:`, updErr.message)
    }
    console.log(`  → Mapped ${urls.length} images to product ${slug}.`)
  }

  // Verify mapping (same DB view as script)
  const { data: summary, error: sumErr } = await supabase
    .from('product_images')
    .select('product_id, products(slug)')
  if (!sumErr && summary?.length) {
    const bySlug = {}
    for (const r of summary) {
      const s = r.products?.slug ?? String(r.product_id)
      bySlug[s] = (bySlug[s] || 0) + 1
    }
    console.log('\nVerification — product_images count by product:')
    Object.entries(bySlug).forEach(([s, n]) => console.log(`  ${s}: ${n} image(s)`))
  } else if (sumErr) {
    console.warn('\nCould not verify product_images:', sumErr.message)
  }

  // Simulate storefront query (products + product_images) for first product
  const firstSlug = dirs.length ? (CORRECTIONS[dirs[0]]?.slug ?? slugify(dirs[0])) : null
  if (firstSlug) {
    const { data: storefrontProduct, error: storefrontErr } = await supabase
      .from('products')
      .select('*, product_images(url, sort_order, is_primary)')
      .eq('slug', firstSlug)
      .eq('is_active', true)
      .single()
    if (!storefrontErr && storefrontProduct?.product_images?.length) {
      console.log(`\nStorefront-style check: ${firstSlug} has ${storefrontProduct.product_images.length} image(s) (first: ${storefrontProduct.product_images[0]?.url?.slice(0, 50)}...)`)
    } else if (storefrontErr) {
      console.warn(`\nStorefront-style check failed for ${firstSlug}:`, storefrontErr.message)
    } else {
      console.warn(`\nStorefront-style check: ${firstSlug} returned 0 product_images (app may not show images)`)
    }
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
