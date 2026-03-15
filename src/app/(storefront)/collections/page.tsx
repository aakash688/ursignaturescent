import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'

export default async function CollectionsPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl text-ivory mb-12">Collections</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {(categories || []).map((cat) => (
          <Link key={cat.id} href={`/collections/${cat.slug}`}>
            <Card hover className="p-8 h-full">
              <h2 className="font-display text-2xl text-ivory">{cat.name}</h2>
              <p className="text-smoke text-sm mt-2">{cat.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
