import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID || 'placeholder'}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'placeholder',
  },
})

export const BUCKET = process.env.R2_BUCKET_NAME || 'ursignature-media'
export const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://media.ursignature.com'

export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await R2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )
  return `${PUBLIC_URL}/${key}`
}

export async function deleteFromR2(url: string): Promise<void> {
  const key = url.replace(`${PUBLIC_URL}/`, '')
  await R2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const { PutObjectCommand } = await import('@aws-sdk/client-s3')
  return getSignedUrl(
    R2,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
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
