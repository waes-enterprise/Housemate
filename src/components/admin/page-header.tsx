'use client'

import { type LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  /** Action button(s) aligned to the right, e.g. "Add" button */
  action?: React.ReactNode
  /** @deprecated Use `action` prop instead. Children still works for backward compatibility. */
  children?: React.ReactNode
}

export function PageHeader({ title, description, icon: Icon, action, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-lg bg-[#006633]/10 shrink-0">
            <Icon className="w-5 h-5 text-[#006633]" />
          </div>
        )}
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {(action || children) && (
        <div className="flex items-center gap-2 shrink-0">
          {action ?? children}
        </div>
      )}
    </div>
  )
}
