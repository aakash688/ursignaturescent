/**
 * Copy all R2 objects under one products/{slug}/ prefix to another.
 * Used after slug renames when DB URLs were updated but R2 keys were not moved.
 *
 * Run: node --env-file=.env.local scripts/copy-r2-product-prefix.mjs midnight-wild midnight-black
 */

import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  S3Client,
  ListObjectsV2Command,
  CopyObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

try {
  const { config } = await import('dotenv')
  config({ path: join(root, '.env.local') })
  config({ path: join(root, '.env') })
} catch {
  /* node --env-file=.env.local */
}

const fromSlug = process.argv[2]
const toSlug = process.argv[3]
if (!fromSlug || !toSlug) {
  console.error('Usage: node scripts/copy-r2-product-prefix.mjs <from-slug> <to-slug>')
  process.exit(1)
}

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const BUCKET = process.env.R2_BUCKET_NAME || 'ursignature-media'

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('Missing R2_* in .env.local')
  process.exit(1)
}

const fromPrefix = `products/${fromSlug}/`
const toPrefix = `products/${toSlug}/`

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

async function exists(key) {
  try {
    await R2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
    return true
  } catch {
    return false
  }
}

let copied = 0
let skipped = 0
let token

console.log(`Copying s3://${BUCKET}/${fromPrefix}* → ${toPrefix}*`)

do {
  const list = await R2.send(
    new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: fromPrefix,
      ContinuationToken: token,
    })
  )

  for (const obj of list.Contents ?? []) {
    if (!obj.Key || obj.Key.endsWith('/')) continue
    const destKey = obj.Key.replace(fromPrefix, toPrefix)
    if (await exists(destKey)) {
      console.log(`  skip (exists): ${destKey}`)
      skipped++
      continue
    }
    await R2.send(
      new CopyObjectCommand({
        Bucket: BUCKET,
        CopySource: `${BUCKET}/${obj.Key}`,
        Key: destKey,
        MetadataDirective: 'COPY',
      })
    )
    console.log(`  copied: ${obj.Key} → ${destKey}`)
    copied++
  }

  token = list.IsTruncated ? list.NextContinuationToken : undefined
} while (token)

console.log(`\nDone. Copied ${copied}, skipped ${skipped}.`)
