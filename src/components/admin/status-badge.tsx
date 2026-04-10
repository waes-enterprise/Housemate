'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-200',
  banned: 'bg-red-100 text-red-700 border-red-200',
}

const tierColors: Record<string, string> = {
  premium: 'bg-purple-100 text-purple-700 border-purple-200',
  featured: 'bg-blue-100 text-blue-700 border-blue-200',
  spotlight: 'bg-amber-100 text-amber-700 border-amber-200',
  standard: 'bg-gray-100 text-gray-600 border-gray-200',
}

const roleColors: Record<string, string> = {
  admin: 'bg-[#006633]/10 text-[#006633] border-[#006633]/20',
  user: 'bg-blue-50 text-blue-700 border-blue-200',
  banned: 'bg-red-100 text-red-700 border-red-200',
}

const actionColors: Record<string, string> = {
  // Admin-prefixed actions (used by backend)
  admin_login: 'bg-blue-100 text-blue-700 border-blue-200',
  admin_create_listing: 'bg-green-100 text-green-700 border-green-200',
  admin_update_listing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  admin_delete_listing: 'bg-red-100 text-red-700 border-red-200',
  admin_update_listing_status: 'bg-orange-100 text-orange-700 border-orange-200',
  admin_toggle_featured: 'bg-purple-100 text-purple-700 border-purple-200',
  admin_create_category: 'bg-green-100 text-green-700 border-green-200',
  admin_update_category: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  admin_delete_category: 'bg-red-100 text-red-700 border-red-200',
  admin_update_user: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  admin_ban_user: 'bg-red-100 text-red-700 border-red-200',
  admin_unban_user: 'bg-green-100 text-green-700 border-green-200',
  admin_delete_user: 'bg-red-100 text-red-700 border-red-200',
  admin_update_settings: 'bg-gray-100 text-gray-700 border-gray-200',
  // Non-prefixed actions (backward compatible)
  login: 'bg-blue-100 text-blue-700 border-blue-200',
  create_listing: 'bg-green-100 text-green-700 border-green-200',
  update_listing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  delete_listing: 'bg-red-100 text-red-700 border-red-200',
  update_listing_status: 'bg-orange-100 text-orange-700 border-orange-200',
  toggle_featured: 'bg-purple-100 text-purple-700 border-purple-200',
  create_category: 'bg-green-100 text-green-700 border-green-200',
  update_category: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  delete_category: 'bg-red-100 text-red-700 border-red-200',
  update_user: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  ban_user: 'bg-red-100 text-red-700 border-red-200',
  unban_user: 'bg-green-100 text-green-700 border-green-200',
  delete_user: 'bg-red-100 text-red-700 border-red-200',
  update_settings: 'bg-gray-100 text-gray-700 border-gray-200',
}

/**
 * Color mapping for smart status detection when using the simple `status` prop.
 * Covers both listing statuses and user statuses.
 */
const smartStatusColors: Record<string, string> = {
  // Listing statuses
  active: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-200',
  // Special listing attributes
  featured: 'bg-blue-100 text-blue-700 border-blue-200',
  premium: 'bg-purple-100 text-purple-700 border-purple-200',
  spotlight: 'bg-amber-100 text-amber-700 border-amber-200',
  standard: 'bg-gray-100 text-gray-600 border-gray-200',
  // User statuses
  admin: 'bg-[#006633]/10 text-[#006633] border-[#006633]/20',
  user: 'bg-blue-50 text-blue-700 border-blue-200',
  banned: 'bg-red-100 text-red-700 border-red-200',
}

interface StatusBadgeProps {
  /** Use `type` + `value` for explicit control, or just `status` for smart auto-detection. */
  type?: 'status' | 'tier' | 'role' | 'action'
  value?: string
  /** Simple status string for smart auto-detection (covers status, tier, role, banned, etc.) */
  status?: string
  className?: string
}

export function StatusBadge({ type, value, status, className }: StatusBadgeProps) {
  // Smart status mode: use `status` prop for auto-detection
  if (status != null && type == null && value == null) {
    const color = smartStatusColors[status] || 'bg-gray-100 text-gray-600 border-gray-200'
    return (
      <Badge
        variant="outline"
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize border',
          color,
          className
        )}
      >
        {status.replace(/_/g, ' ')}
      </Badge>
    )
  }

  // Explicit type + value mode (backward compatible)
  if (!type || value == null) return null

  const colorMap =
    type === 'status'
      ? statusColors
      : type === 'tier'
        ? tierColors
        : type === 'role'
          ? roleColors
          : actionColors
  const color = colorMap[value] || colorMap.standard || 'bg-gray-100 text-gray-600'

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border capitalize',
        color,
        className
      )}
    >
      {value.replace(/_/g, ' ')}
    </Badge>
  )
}
