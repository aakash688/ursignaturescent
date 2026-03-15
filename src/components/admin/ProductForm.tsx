'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { slugify } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface VariantRow {
  id?: string
  size_ml: number
  price: number
  compare_at_price: number | null
  sku: string
  stock_quantity: number
  low_stock_threshold: number
  is_active: boolean
}

export interface CategoryOption {
  id: string
  name: string
  slug: string
}

const TABS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'images', label: 'Images' },
  { id: 'variants', label: 'Variants & Pricing' },
  { id: 'categories', label: 'Categories' },
  { id: 'seo', label: 'SEO' },
] as const

function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async () => {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
      if (res.ok) window.location.href = '/admin/products'
      else {
        const data = await res.json()
        alert(data.error || 'Delete failed')
      }
    } catch {
      alert('Delete failed')
    } finally {
      setDeleting(false)
    }
  }
  return (
    <Button type="button" variant="danger" onClick={handleDelete} disabled={deleting}>
      {deleting ? 'Deleting...' : 'Delete product'}
    </Button>
  )
}

const defaultVariant = (): VariantRow => ({
  size_ml: 50,
  price: 0,
  compare_at_price: null,
  sku: '',
  stock_quantity: 0,
  low_stock_threshold: 10,
  is_active: true,
})

export function ProductForm({
  mode,
  productId,
  initialSlug,
  initialData,
  onSuccess,
}: {
  mode: 'create' | 'edit'
  productId?: string
  initialSlug?: string
  initialData?: {
    name: string
    slug: string
    tagline?: string | null
    description?: string | null
    short_description?: string | null
    inspired_by?: string | null
    category_type?: string
    fragrance_profile?: string | null
    top_notes?: string[]
    heart_notes?: string[]
    base_notes?: string[]
    rating?: number
    is_featured?: boolean
    is_active?: boolean
    meta_title?: string | null
    meta_description?: string | null
    sort_order?: number
    variants?: VariantRow[]
    category_ids?: string[]
    image_urls?: string[]
  }
  onSuccess?: (product: { id: string }) => void
}) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('basic')
  const [name, setName] = useState(initialData?.name ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? initialSlug ?? '')
  const [tagline, setTagline] = useState(initialData?.tagline ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [shortDescription, setShortDescription] = useState(initialData?.short_description ?? '')
  const [inspiredBy, setInspiredBy] = useState(initialData?.inspired_by ?? '')
  const [categoryType, setCategoryType] = useState<string>(initialData?.category_type ?? 'unisex')
  const [fragranceProfile, setFragranceProfile] = useState(initialData?.fragrance_profile ?? '')
  const [topNotes, setTopNotes] = useState((initialData?.top_notes ?? []).join(', '))
  const [heartNotes, setHeartNotes] = useState((initialData?.heart_notes ?? []).join(', '))
  const [baseNotes, setBaseNotes] = useState((initialData?.base_notes ?? []).join(', '))
  const [rating, setRating] = useState(initialData?.rating ?? 0)
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured ?? false)
  const [isActive, setIsActive] = useState(initialData?.is_active !== false)
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title ?? '')
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description ?? '')
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 0)
  const [variants, setVariants] = useState<VariantRow[]>(
    initialData?.variants?.length ? initialData.variants : [defaultVariant()]
  )
  const [categoryIds, setCategoryIds] = useState<string[]>(initialData?.category_ids ?? [])
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.image_urls ?? [])
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const slugForUpload = slug || slugify(name) || 'product'

  useEffect(() => {
    if (mode === 'create' && name && !initialData?.slug) {
      setSlug(slugify(name))
    }
  }, [name, mode, initialData?.slug])

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((d) => setCategories(Array.isArray(d) ? d : d.data ?? []))
      .catch(() => {})
  }, [])

  const parseNotes = (s: string) =>
    s
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)

  const addVariant = () => setVariants((v) => [...v, defaultVariant()])
  const removeVariant = (i: number) => setVariants((v) => v.filter((_, j) => j !== i))
  const updateVariant = (i: number, field: keyof VariantRow, value: number | string | boolean | null) => {
    setVariants((v) => {
      const next = [...v]
      const row = { ...next[i] }
      if (field === 'compare_at_price') row.compare_at_price = value === '' || value == null ? null : Number(value)
      else (row as Record<string, unknown>)[field] = value
      next[i] = row
      return next
    })
  }

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    const slug = slugForUpload && slugify(slugForUpload).replace(/^-|-$/g, '')
    if (!slug || slug === 'misc') {
      alert('Enter product name (or slug) in Basic Info first so images are saved in the product folder.')
      e.target.value = ''
      return
    }
    setUploading(true)
    try {
      const results = await Promise.all(
        Array.from(files).map(async (file) => {
          const form = new FormData()
          form.set('file', file)
          form.set('slug', slug)
          const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
          const data = await res.json()
          return { url: data.url as string | undefined, error: data.error as string | undefined, name: file.name }
        })
      )
      const newUrls = results.filter((r) => r.url).map((r) => r.url as string)
      const failed = results.filter((r) => r.error)
      if (failed.length) alert(`Upload failed for: ${failed.map((f) => f.name).join(', ')}`)
      if (newUrls.length) setImageUrls((prev) => [...prev, ...newUrls])
    } catch {
      alert('Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => setImageUrls((prev) => prev.filter((_, i) => i !== index))
  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= imageUrls.length) return
    setImageUrls((prev) => {
      const next = [...prev]
      const [removed] = next.splice(from, 1)
      next.splice(to, 0, removed)
      return next
    })
  }

  const buildPayload = () => {
    const slugVal = slug.trim() || slugify(name) || 'product'
    const variantPayload = variants.map((v) => {
      const sku = v.sku.trim() || `URS-${slugVal.replace(/-/g, '').slice(0, 8)}-${v.size_ml}`
      const row: Record<string, unknown> = {
        size_ml: v.size_ml,
        price: v.price,
        compare_at_price: v.compare_at_price,
        sku,
        stock_quantity: v.stock_quantity,
        low_stock_threshold: v.low_stock_threshold,
        is_active: v.is_active,
      }
      if (mode === 'edit' && v.id) row.id = v.id
      return row
    })
    return {
      name: name.trim(),
      slug: slugVal.toLowerCase().replace(/\s+/g, '-'),
      tagline: tagline.trim() || null,
      description: description.trim() || null,
      short_description: shortDescription.trim() || null,
      inspired_by: inspiredBy.trim() || null,
      category_type: categoryType as 'men' | 'women' | 'unisex',
      fragrance_profile: fragranceProfile.trim() || null,
      top_notes: parseNotes(topNotes),
      heart_notes: parseNotes(heartNotes),
      base_notes: parseNotes(baseNotes),
      rating: Math.min(5, Math.max(0, rating)),
      is_featured: isFeatured,
      is_active: isActive,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDescription.trim() || null,
      sort_order: sortOrder,
      variants: variantPayload,
      category_ids: categoryIds,
      image_urls: imageUrls,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Name is required')
      return
    }
    setSaving(true)
    try {
      if (mode === 'create') {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to create')
        onSuccess?.(data)
        window.location.href = data.id ? `/admin/products/${data.id}` : '/admin/products'
      } else if (productId) {
        const res = await fetch(`/api/admin/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to update')
        onSuccess?.(data)
        window.location.href = `/admin/products/${productId}`
      } else {
        setSaving(false)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-gold/20 text-gold border border-gold/40'
                : 'bg-white/5 text-smoke hover:text-ivory hover:bg-white/10 border border-transparent'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'basic' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <h2 className="font-display text-lg text-ivory mb-4">Basic Info</h2>
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Product name" />
          <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Auto from name" />
          <Input label="Tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Short tagline" />
          <div>
            <label className="block text-xs font-medium text-smoke tracking-wider uppercase mb-1.5">Short description</label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full bg-charcoal border border-white/10 text-ivory placeholder:text-smoke/50 px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50"
              rows={2}
              placeholder="Brief description"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-smoke tracking-wider uppercase mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-charcoal border border-white/10 text-ivory placeholder:text-smoke/50 px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50"
              rows={4}
              placeholder="Full description"
            />
          </div>
          <Input label="Inspired by" value={inspiredBy} onChange={(e) => setInspiredBy(e.target.value)} placeholder="e.g. Designer name" />
          <div>
            <label className="block text-xs font-medium text-smoke tracking-wider uppercase mb-1.5">Category type</label>
            <select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              className="w-full bg-charcoal border border-white/10 text-ivory px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50"
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
          <Input label="Fragrance profile" value={fragranceProfile} onChange={(e) => setFragranceProfile(e.target.value)} placeholder="e.g. Woody, Fresh" />
          <Input label="Top notes" value={topNotes} onChange={(e) => setTopNotes(e.target.value)} placeholder="Comma-separated" />
          <Input label="Heart notes" value={heartNotes} onChange={(e) => setHeartNotes(e.target.value)} placeholder="Comma-separated" />
          <Input label="Base notes" value={baseNotes} onChange={(e) => setBaseNotes(e.target.value)} placeholder="Comma-separated" />
          <div>
            <label className="block text-xs font-medium text-smoke tracking-wider uppercase mb-1.5">Rating (0–5)</label>
            <input
              type="number"
              min={0}
              max={5}
              step={0.5}
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
              className="w-full bg-charcoal border border-white/10 text-ivory px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-smoke tracking-wider uppercase mb-1.5">Sort order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-charcoal border border-white/10 text-ivory px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ivory cursor-pointer">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-ivory cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
            Active
          </label>
        </div>
      )}

      {activeTab === 'images' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <h2 className="font-display text-lg text-ivory mb-4">Images (R2)</h2>
          <p className="text-sm text-smoke mb-2">Images are saved in <span className="text-ivory">products/{slugForUpload ? slugify(slugForUpload) || '…' : '…'}/</span>. Set product name or slug in Basic Info first. First image = primary. Reorder with arrows.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload image(s)'}
          </Button>
          <div className="flex flex-wrap gap-4 mt-4">
            {imageUrls.map((url, i) => (
              <div key={`${url}-${i}`} className="relative group">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-white/10 border border-white/10 relative">
                  <img src={url} alt="" className="object-cover w-full h-full" />
                </div>
                <span className="absolute top-1 left-1 text-[10px] bg-noir/80 text-gold px-1 rounded">{i === 0 ? 'Primary' : i + 1}</span>
                <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 bg-black/50 rounded-lg transition-opacity">
                  <button type="button" onClick={() => moveImage(i, i - 1)} disabled={i === 0} className="p-1 rounded bg-white/20 text-ivory text-xs disabled:opacity-50">
                    ←
                  </button>
                  <button type="button" onClick={() => moveImage(i, i + 1)} disabled={i >= imageUrls.length - 1} className="p-1 rounded bg-white/20 text-ivory text-xs disabled:opacity-50">
                    →
                  </button>
                  <button type="button" onClick={() => removeImage(i)} className="p-1 rounded bg-red-900/80 text-white text-xs">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          {imageUrls.length === 0 && !uploading && <p className="text-smoke text-sm">No images yet. Upload to add.</p>}
        </div>
      )}

      {activeTab === 'variants' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <h2 className="font-display text-lg text-ivory mb-4">Variants & Pricing</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-smoke">
                  <th className="p-2">Size (ml)</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Compare at</th>
                  <th className="p-2">SKU</th>
                  <th className="p-2">Stock</th>
                  <th className="p-2">Low stock</th>
                  <th className="p-2">Active</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-2">
                      <input
                        type="number"
                        value={v.size_ml}
                        onChange={(e) => updateVariant(i, 'size_ml', parseInt(e.target.value, 10) || 0)}
                        className="w-20 bg-charcoal border border-white/10 rounded px-2 py-1.5 text-ivory text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => updateVariant(i, 'price', parseFloat(e.target.value) || 0)}
                        className="w-24 bg-charcoal border border-white/10 rounded px-2 py-1.5 text-ivory text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={v.compare_at_price ?? ''}
                        onChange={(e) => updateVariant(i, 'compare_at_price', e.target.value === '' ? null : parseFloat(e.target.value))}
                        placeholder="—"
                        className="w-24 bg-charcoal border border-white/10 rounded px-2 py-1.5 text-ivory text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                        placeholder="Auto"
                        className="w-28 bg-charcoal border border-white/10 rounded px-2 py-1.5 text-ivory text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={v.stock_quantity}
                        onChange={(e) => updateVariant(i, 'stock_quantity', parseInt(e.target.value, 10) || 0)}
                        className="w-20 bg-charcoal border border-white/10 rounded px-2 py-1.5 text-ivory text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={v.low_stock_threshold}
                        onChange={(e) => updateVariant(i, 'low_stock_threshold', parseInt(e.target.value, 10) || 10)}
                        className="w-20 bg-charcoal border border-white/10 rounded px-2 py-1.5 text-ivory text-sm"
                      />
                    </td>
                    <td className="p-2">
                      <input type="checkbox" checked={v.is_active} onChange={(e) => updateVariant(i, 'is_active', e.target.checked)} className="rounded" />
                    </td>
                    <td className="p-2">
                      <button type="button" onClick={() => removeVariant(i)} disabled={variants.length <= 1} className="text-red-400 text-xs hover:underline disabled:opacity-50">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            Add variant
          </Button>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <h2 className="font-display text-lg text-ivory mb-4">Categories</h2>
          <p className="text-sm text-smoke">Select categories this product belongs to.</p>
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.id}>
                <label className="flex items-center gap-2 text-sm text-ivory cursor-pointer">
                  <input type="checkbox" checked={categoryIds.includes(c.id)} onChange={() => toggleCategory(c.id)} className="rounded" />
                  {c.name} <span className="text-smoke">({c.slug})</span>
                </label>
              </li>
            ))}
          </ul>
          {categories.length === 0 && <p className="text-smoke text-sm">No categories. Create some in Categories.</p>}
        </div>
      )}

      {activeTab === 'seo' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <h2 className="font-display text-lg text-ivory mb-4">SEO</h2>
          <Input label="Meta title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Default from product name" />
          <div>
            <label className="block text-xs font-medium text-smoke tracking-wider uppercase mb-1.5">Meta description</label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full bg-charcoal border border-white/10 text-ivory placeholder:text-smoke/50 px-4 py-3 text-sm rounded focus:outline-none focus:border-gold/50"
              rows={2}
              placeholder="Short description for search results"
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
        <Button type="submit" loading={saving} disabled={saving}>
          {mode === 'create' ? 'Create product' : 'Save changes'}
        </Button>
        <Link href="/admin/products">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
        {mode === 'edit' && productId && (
          <DeleteProductButton productId={productId} productName={name} />
        )}
      </div>
    </form>
  )
}
