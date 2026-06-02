import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export const BUCKET = process.env.R2_BUCKET_NAME || 'ursignature-media'
/** Legacy bucket used before binding was pointed at ursignature-media. */
export const LEGACY_BUCKET = 'ursignaturescent-media'
export const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://media.ursignature.com'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID || 'placeholder'}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'placeholder',
  },
})

type R2ObjectBody = {
  body: ReadableStream | null
  httpMetadata?: { contentType?: string }
}

type R2BucketBinding = {
  put: (
    key: string,
    value: ArrayBuffer | Uint8Array,
    options?: { httpMetadata?: { contentType: string } }
  ) => Promise<unknown>
  get: (key: string) => Promise<R2ObjectBody | null>
  delete: (key: string) => Promise<unknown>
}

const ALLOWED_KEY_PREFIXES = ['hero/', 'products/', 'misc/', 'logo/'] as const

export function isAllowedR2Key(key: string): boolean {
  return ALLOWED_KEY_PREFIXES.some((p) => key.startsWith(p))
}

/** Same-origin URL; served by GET /r2/[...path] via the Worker R2 binding. */
export function buildPublicObjectUrl(key: string): string {
  return `/r2/${key}`
}

/** Native R2 binding on Cloudflare Workers (OpenNext deploy). */
async function uploadViaR2Binding(
  key: string,
  body: ArrayBuffer | Uint8Array,
  contentType: string
): Promise<string | null> {
  try {
    const { env } = await getCloudflareContext({ async: true })
    const bucket = (env as { R2_BUCKET?: R2BucketBinding }).R2_BUCKET
    if (!bucket) return null
    await bucket.put(key, body, { httpMetadata: { contentType } })
    return buildPublicObjectUrl(key)
  } catch {
    return null
  }
}

async function uploadViaS3(key: string, buffer: Buffer, contentType: string): Promise<string> {
  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )
  return buildPublicObjectUrl(key)
}

async function getViaBinding(
  bucket: R2BucketBinding | undefined,
  key: string
): Promise<{ body: ReadableStream | ArrayBuffer | Uint8Array; contentType?: string } | null> {
  if (!bucket?.get) return null
  const obj = await bucket.get(key)
  if (!obj?.body) return null
  return { body: obj.body, contentType: obj.httpMetadata?.contentType }
}

export async function getObjectFromR2(
  key: string
): Promise<{ body: ReadableStream | ArrayBuffer | Uint8Array; contentType?: string } | null> {
  try {
    const { env } = await getCloudflareContext({ async: true })
    const e = env as { R2_BUCKET?: R2BucketBinding; R2_BUCKET_LEGACY?: R2BucketBinding }
    const fromPrimary = await getViaBinding(e.R2_BUCKET, key)
    if (fromPrimary) return fromPrimary
    const fromLegacy = await getViaBinding(e.R2_BUCKET_LEGACY, key)
    if (fromLegacy) return fromLegacy
  } catch {
    /* fall through to S3 */
  }

  if (
    !process.env.R2_ACCOUNT_ID ||
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    process.env.R2_ACCESS_KEY_ID === 'placeholder'
  ) {
    return null
  }

  try {
    const res = await R2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
    if (!res.Body) return null
    const bytes = await res.Body.transformToByteArray()
    return {
      body: bytes,
      contentType: res.ContentType ?? undefined,
    }
  } catch {
    return null
  }
}

export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const viaBinding = await uploadViaR2Binding(key, buffer, contentType)
  if (viaBinding) return viaBinding

  if (
    !process.env.R2_ACCOUNT_ID ||
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    process.env.R2_ACCESS_KEY_ID === 'placeholder'
  ) {
    throw new Error(
      'R2 not configured: add R2 binding in wrangler.jsonc or set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY secrets'
    )
  }

  return uploadViaS3(key, buffer, contentType)
}

export async function deleteFromR2(url: string): Promise<void> {
  const key = url.startsWith('/r2/')
    ? url.slice('/r2/'.length)
    : url.replace(`${PUBLIC_URL}/`, '').replace(`${PUBLIC_URL.replace(/\/$/, '')}/`, '')
  try {
    const { env } = await getCloudflareContext({ async: true })
    const bucket = (env as { R2_BUCKET?: R2BucketBinding }).R2_BUCKET
    if (bucket) {
      await bucket.delete(key)
      return
    }
  } catch {
    /* fall through to S3 */
  }
  await R2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const { PutObjectCommand: PutCmd } = await import('@aws-sdk/client-s3')
  return getSignedUrl(
    R2,
    new PutCmd({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn }
  )
}

export function buildR2Key(folder: string, filename: string): string {
  const timestamp = Date.now()
  const base = filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase()
    .slice(0, 40)
  return `${folder}/${timestamp}-${base}.webp`
}
