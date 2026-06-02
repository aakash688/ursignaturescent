import type { Env } from '../types'

export async function uploadToR2(
  env: Env,
  key: string,
  body: ArrayBuffer | ReadableStream,
  contentType: string
): Promise<string> {
  const bucket = env.R2_BUCKET
  const baseUrl = (env.NEXT_PUBLIC_R2_PUBLIC_URL || '').replace(/\/$/, '')
  await bucket.put(key, body, { httpMetadata: { contentType } })
  return `${baseUrl}/${key}`
}
