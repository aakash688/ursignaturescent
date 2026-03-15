/**
 * Helper: duplicate each product's -1 image to -2, -3, -4, -5, -6 so you have
 * multiple images per product. Run once, then npm run r2:upload.
 * You can add more images manually (e.g. bloom-kiss-7.png) — the upload script
 * picks up any number of files per product and stores them in products/{slug}/ in R2.
 */

import { readdirSync, copyFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const productsDir = join(root, 'public', 'images', 'products')
const EXTRA_COPIES = [2, 3, 4, 5, 6, 7, 8, 9, 10] // creates 10 images per product total

if (!existsSync(productsDir)) {
  console.error('Missing public/images/products')
  process.exit(1)
}

const files = readdirSync(productsDir).filter((f) => /^(.+)-1\.(png|jpg|jpeg|webp)$/i.test(f))
let created = 0
for (const f of files) {
  const match = f.match(/^(.+)-1\.(png|jpg|jpeg|webp)$/i)
  if (!match) continue
  const base = match[1]
  const ext = match[2].toLowerCase()
  const src = join(productsDir, f)
  for (const n of EXTRA_COPIES) {
    const dest = join(productsDir, `${base}-${n}.${ext}`)
    if (!existsSync(dest)) {
      copyFileSync(src, dest)
      console.log(`Created ${base}-${n}.${ext}`)
      created++
    }
  }
}
console.log(created ? `\nCreated ${created} files. Run: npm run r2:upload` : `\nNo new files (all -${EXTRA_COPIES.join('/')} already exist). Run: npm run r2:upload`)
