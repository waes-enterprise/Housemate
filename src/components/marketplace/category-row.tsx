'use client'

import {
  Home,
  Tractor,
  Building2,
  Warehouse,
  PartyPopper,
  Car,
  Mountain,
  Store,
  CircleParking,
  LayoutGrid,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Category {
  name: string
  icon: string
}

const iconMap: Record<string, LucideIcon> = {
  LayoutGrid,
  Home,
  Tractor,
  Building2,
  Warehouse,
  PartyPopper,
  Car,
  Mountain,
  Store,
  CircleParking,
}

interface CategoryRowProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryRow({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryRowProps) {
  return (
    <section className="px-4 py-3">
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || LayoutGrid
          const isActive = activeCategory === cat.name

          return (
            <button
              key={cat.name}
              onClick={() => onCategoryChange(cat.name)}
              className={`flex flex-col items-center gap-1.5 shrink-0 group hover-lift ${
                isActive ? 'animate-breathe' : ''
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-[#006633] to-[#004d26] text-white shadow-lg shadow-[#006633]/40 scale-105'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 border border-gray-100'
                }`}
              >
                <Icon
                  className={`transition-transform duration-300 ${
                    isActive ? 'size-7 scale-110' : 'size-6'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-[#004d26] font-bold dot-indicator'
                    : 'text-gray-500'
                }`}
              >
                {cat.name}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
