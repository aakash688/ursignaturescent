'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface ProductsFiltersProps {
  currentGender?: string
  currentSort?: string
}

export function ProductsFilters({ currentGender, currentSort }: ProductsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const setFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    router.push(`/products?${p.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
        <span className="text-smoke text-sm">Gender:</span>
        <div className="flex flex-wrap gap-2">
          {['men', 'women', 'unisex'].map((g) => (
            <button
              key={g}
              onClick={() => setFilter('gender', currentGender === g ? '' : g)}
              className={`px-3 py-2 min-h-[44px] rounded text-sm capitalize ${
                currentGender === g ? 'bg-gold text-noir' : 'bg-noir-elevated text-ivory hover:border-gold/50 border border-white/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 w-full sm:w-auto">
        <span className="text-smoke text-sm">Sort:</span>
        <select
          value={currentSort ?? ''}
          onChange={(e) => setFilter('sort', e.target.value)}
          className="w-full sm:w-auto bg-noir-elevated border border-white/10 rounded px-3 py-2.5 min-h-[44px] text-ivory text-sm"
        >
          <option value="">Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  )
}
