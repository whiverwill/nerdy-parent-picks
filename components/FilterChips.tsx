'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Category } from '@/lib/types'

interface Props {
  categories: Category[]
  activeCategory?: string
}

export default function FilterChips({ categories, activeCategory }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setCategory(cat: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (cat) {
      params.set('category', cat)
    } else {
      params.delete('category')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const isAll = !activeCategory

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {/* All chip */}
      <button
        onClick={() => setCategory(null)}
        className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
          isAll
            ? 'bg-tnp-purple text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        All
      </button>

      {categories.map(cat => {
        const isActive = activeCategory === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              isActive
                ? 'text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={isActive ? { backgroundColor: cat.color } : {}}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.7)' : cat.color }}
            />
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
