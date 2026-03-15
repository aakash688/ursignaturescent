'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ProductRow {
  id: string
  name: string
  slug: string
  category_type: string
  is_featured: boolean
  is_active: boolean
  created_at: string
  images: string[]
  product_variants?: { id: string }[]
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status) params.set('status', status)
    fetch(`/api/admin/products?${params}`)
      .then((res) => res.json())
      .then((d) => {
        setProducts(d.data ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [q, status])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProducts((p) => p.filter((x) => x.id !== id))
        setDeleteId(null)
      } else {
        const data = await res.json()
        alert(data.error || 'Delete failed')
      }
    } catch {
      alert('Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="font-display text-2xl text-ivory">Products</h1>
        <Link href="/admin/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Search products..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs bg-white/5 border-white/10 text-ivory placeholder:text-smoke"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-white/5 border border-white/10 rounded px-3 py-2 text-ivory text-sm"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-smoke">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-smoke">
                <th className="p-3 w-14">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Variants</th>
                <th className="p-3">Featured</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3">
                    <div className="w-10 h-10 rounded bg-white/10 overflow-hidden relative">
                      {p.images?.[0] ? (
                        <Image
                          src={p.images[0]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <span className="text-xs text-smoke flex items-center justify-center w-full h-full">—</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-ivory">{p.name}</td>
                  <td className="p-3 text-smoke">{p.category_type}</td>
                  <td className="p-3 text-smoke">{p.product_variants?.length ?? 0}</td>
                  <td className="p-3">{p.is_featured ? 'Yes' : '—'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${p.is_active ? 'bg-green-900/30 text-green-400' : 'bg-white/10 text-smoke'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 text-smoke">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="p-3 flex gap-2">
                    <Link href={`/admin/products/${p.id}`} className="text-gold hover:underline text-xs">
                      Edit
                    </Link>
                    {deleteId === p.id ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="text-red-400 hover:underline text-xs disabled:opacity-50"
                      >
                        {deletingId === p.id ? 'Deleting...' : 'Confirm'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteId(p.id)}
                        disabled={deletingId !== null}
                        className="text-smoke hover:text-red-400 text-xs disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && products.length === 0 && (
          <p className="p-12 text-center text-smoke">No products found.</p>
        )}
      </div>
    </div>
  )
}
