# CURSOR AGENT 03 — Cloudflare R2 Image Storage

## Your Role
You are a cloud storage engineer. Set up Cloudflare R2 integration for URsignature — all product images, category banners, and admin uploads will be stored here.

---

## Task: R2 Integration

### Step 1: Create `src/lib/r2.ts`
```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export const BUCKET = process.env.R2_BUCKET_NAME!
export const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!

export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await R2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }))
  return `${PUBLIC_URL}/${key}`
}

export async function deleteFromR2(key: string): Promise<void> {
  await R2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  return getSignedUrl(R2, new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  }), { expiresIn })
}

export function getR2Key(url: string): string {
  return url.replace(`${PUBLIC_URL}/`, '')
}

export function buildR2Key(folder: string, filename: string): string {
  const timestamp = Date.now()
  const ext = filename.split('.').pop()
  const safe = filename.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  return `${folder}/${timestamp}-${safe}.${ext}`
}
```

---

### Step 2: Create Upload API Route `src/app/api/upload/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2, buildR2Key } from '@/lib/r2'
import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_SIZE_MB = 10

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  const folder = formData.get('folder') as string || 'products'

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return NextResponse.json({ error: `Max ${MAX_SIZE_MB}MB` }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  // Optimize with sharp: resize to max 1200px, convert to webp
  const optimized = await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()
  
  const key = buildR2Key(folder, file.name.replace(/\.[^/.]+$/, '') + '.webp')
  const url = await uploadToR2(key, optimized, 'image/webp')
  
  return NextResponse.json({ url, key })
}
```

---

### Step 3: Create Presigned URL Route (for large files) `src/app/api/upload/presign/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPresignedUploadUrl, buildR2Key } from '@/lib/r2'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { filename, contentType, folder } = await request.json()
  const key = buildR2Key(folder || 'products', filename)
  const presignedUrl = await getPresignedUploadUrl(key, contentType)
  const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`

  return NextResponse.json({ presignedUrl, publicUrl, key })
}
```

---

### Step 4: Create `src/components/admin/ImageUploader.tsx`
Build a polished drag-and-drop image upload component for the admin panel:

```tsx
'use client'
import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  folder?: string
  maxImages?: number
  label?: string
}

export function ImageUploader({ value, onChange, folder = 'products', maxImages = 6, label = 'Upload Images' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const upload = useCallback(async (files: File[]) => {
    setUploading(true)
    const uploaded: string[] = []
    
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)
      
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) uploaded.push(data.url)
    }
    
    onChange([...value, ...uploaded].slice(0, maxImages))
    setUploading(false)
  }, [value, onChange, folder, maxImages])

  const remove = (url: string) => onChange(value.filter(u => u !== url))
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length) upload(files)
  }, [upload])

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gold">{label}</p>
      
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${dragOver ? 'border-gold bg-gold/5' : 'border-smoke/30 hover:border-gold/50'}`}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        {uploading ? (
          <Loader2 className="mx-auto animate-spin text-gold" size={32} />
        ) : (
          <>
            <Upload className="mx-auto mb-2 text-smoke" size={32} />
            <p className="text-sm text-smoke">Drag & drop or click to upload</p>
            <p className="text-xs text-smoke/60 mt-1">JPG, PNG, WebP — max 10MB each</p>
          </>
        )}
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            if (files.length) upload(files)
          }}
        />
      </div>
      
      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden group">
              <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-gold text-noir text-xs px-1.5 py-0.5 rounded font-medium">
                  Main
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); remove(url) }}
                className="absolute top-1 right-1 bg-noir/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

### COMPLETION CRITERIA
- [ ] `src/lib/r2.ts` created with all functions
- [ ] Upload API route created and tested
- [ ] Images are compressed with sharp before upload
- [ ] `ImageUploader` component renders drag-and-drop UI
- [ ] Test upload with a sample image — verify it appears at R2 public URL
- [ ] Verify images served at `https://media.ursignature.com/products/[filename]`
