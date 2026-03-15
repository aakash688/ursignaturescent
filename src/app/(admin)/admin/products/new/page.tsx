'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ProductForm } from '@/components/admin/ProductForm'

export default function AdminProductsNewPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="font-display text-2xl text-ivory">Add Product</h1>
        <Link href="/admin/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
      <ProductForm mode="create" />
    </div>
  )
}
