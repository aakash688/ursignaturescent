/**
 * Upload all local images to Cloudflare R2 and map them in the database.
 * - Logo: public/logo.png → R2 logo/logo.png, stored in settings.site_logo_url
 * - Product images: public/images/products/{slug}-{n}.png → R2 products/{slug}/{n}.png
 *   Each perfume gets its own folder (e.g. products/bloom-kiss/1.png, 2.png, …). Unlimited images per product.
 *
 * Prereqs:
 *   1. R2 bucket created: npx wrangler r2 bucket create ursignature-media
 *   2. R2 public access or custom domain (set NEXT_PUBLIC_R2_PUBLIC_URL)
 *   3. .env.local has R2_* and SUPABASE_SERVICE_ROLE_KEY
 *
 * Run: node --env-file=.env.local scripts/upload-images-to-r2.mjs
 * (Or: npm i -D dotenv && node scripts/upload-images-to-r2.mjs)
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Load .env.local (Node 20.6+: use node --env-file=.env.local instead)
try {
  const { config } = await import('dotenv')
  config({ path: join(root, '.env.local') })
  config({ path: join(root, '.env') })
} catch {
  // dotenv not installed; use node --env-file=.env.local scripts/upload-images-to-r2.mjs
}

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'ursignature-media'
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://media.ursignature.com'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY in .env.local')
  process.exit(1)
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
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

function getContentType(path) {
  if (path.endsWith('.png')) return 'image/png'
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg'
  if (path.endsWith('.webp')) return 'image/webp'
  if (path.endsWith('.svg')) return 'image/svg+xml'
  return 'application/octet-stream'
}

async function main() {
  console.log('Uploading images to R2 and mapping in DB...\n')

  // 1. Logo
  const logoPath = join(root, 'public', 'logo.png')
  if (existsSync(logoPath)) {
    const buf = readFileSync(logoPath)
    const key = 'logo/logo.png'
    const url = await uploadToR2(key, buf, getContentType(logoPath))
    console.log('Logo:', url)
    await supabase.from('settings').upsert(
      { key: 'site_logo_url', value: url, description: 'Site logo URL (R2)', updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )
    console.log('  → settings.site_logo_url updated\n')
  } else {
    console.log('No public/logo.png found; skipping logo.\n')
  }

  // 2. Product images: public/images/products/* — support multiple images per product
  //    Naming: {slug}.png (primary) or {slug}-1.png, {slug}-2.png, ... (e.g. bloom-kiss-1.png, bloom-kiss-2.png)
  const productsDir = join(root, 'public', 'images', 'products')
  if (!existsSync(productsDir)) {
    console.log('No public/images/products directory; skipping product images.\n')
    return
  }

  const { data: products } = await supabase.from('products').select('id, slug')
  const slugToId = new Map((products || []).map((p) => [p.slug, p.id]))
  const productSlugs = [...slugToId.keys()]

  const files = readdirSync(productsDir).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
  const bySlug = {}
  for (const slug of productSlugs) bySlug[slug] = []

  for (const f of files) {
    const ext = f.replace(/.*\./, '').toLowerCase()
    const base = f.slice(0, f.length - ext.length - 1)
    let assigned = false
    for (const slug of productSlugs) {
      if (base === slug) {
        bySlug[slug].push({ file: f, index: 0 })
        assigned = true
        break
      }
      const numMatch = base.match(new RegExp(`^${slug.replace(/-/g, '\\-')}-(\\d+)$`))
      if (numMatch) {
        bySlug[slug].push({ file: f, index: parseInt(numMatch[1], 10) })
        assigned = true
        break
      }
    }
    if (!assigned) {
      const legacyMatch = base.match(/^(.+)-(\d+)$/)
      if (legacyMatch && bySlug[legacyMatch[1]]) {
        bySlug[legacyMatch[1]].push({ file: f, index: parseInt(legacyMatch[2], 10) })
      }
    }
  }

  const totalFiles = Object.values(bySlug).reduce((s, arr) => s + arr.length, 0)
  const multiCount = Object.values(bySlug).filter((arr) => arr.length > 1).length
  console.log(`Found ${totalFiles} image(s) for ${productSlugs.length} products (${multiCount} with multiple images).\n`)
  if (multiCount === 0 && totalFiles > 0) {
    console.log('Tip: To upload multiple images per product, add files like bloom-kiss-2.png, bloom-kiss-3.png, or run: npm run r2:duplicate-images\n')
  }

  for (const slug of productSlugs) {
    const entries = bySlug[slug].sort((a, b) => a.index - b.index)
    if (entries.length === 0) continue
    const productId = slugToId.get(slug)
    if (!productId) {
      console.warn('Product not found for slug:', slug)
      continue
    }
    // Replace all images for this product (each perfume = one folder in R2: products/{slug}/1.png, 2.png, …)
    await supabase.from('product_images').delete().eq('product_id', productId)
    for (let i = 0; i < entries.length; i++) {
      const { file } = entries[i]
      const path = join(productsDir, file)
      const buf = readFileSync(path)
      const ext = file.split('.').pop().toLowerCase()
      const key = `products/${slug}/${i + 1}.${ext}`
      const url = await uploadToR2(key, buf, getContentType(path))
      await supabase.from('product_images').insert({
        product_id: productId,
        url,
        sort_order: i,
        is_primary: i === 0,
      })
      console.log(`Product ${slug}: image ${i + 1}/${entries.length} → ${url}`)
    }
    console.log(`  → product_images updated for ${slug} (primary = first image)\n`)
  }

  // Optionally keep products.images in sync: set products.images = array of urls (primary first)
  const { data: allProductImages } = await supabase
    .from('product_images')
    .select('product_id, url, is_primary, sort_order')
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })
  const imagesByProduct = {}
  for (const row of allProductImages || []) {
    if (!imagesByProduct[row.product_id]) imagesByProduct[row.product_id] = []
    imagesByProduct[row.product_id].push(row.url)
  }
  for (const [pid, urls] of Object.entries(imagesByProduct)) {
    await supabase.from('products').update({ images: urls }).eq('id', pid)
  }
  console.log('Synced products.images array from product_images.')
  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
