'use client'

import { Menu, LogOut, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

interface AdminHeaderProps {
  admin: AdminUser | null
  onMenuClick: () => void
  onLogout: () => void
}

export function AdminHeader({ admin, onMenuClick, onLogout }: AdminHeaderProps) {
  const initials = admin?.name
    ? admin.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD'

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6 shrink-0">
      {/* Left: hamburger + page title area */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </Button>
        {/* Page title placeholder — each page sets its own via PageHeader */}
      </div>

      {/* Right: admin avatar + name + role badge */}
      <div className="flex items-center gap-3">
        {admin ? (
          <>
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700 leading-tight">{admin.name}</p>
                <p className="text-[11px] text-gray-400 leading-tight">{admin.email}</p>
              </div>
              <Avatar className="h-9 w-9 border border-gray-200">
                <AvatarFallback className="text-xs font-semibold bg-[#006633]/10 text-[#006633]">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <Badge
              variant="outline"
              className="hidden md:inline-flex items-center gap-1 border-[#006633]/20 bg-[#006633]/5 text-[#006633] text-xs font-semibold"
            >
              <Shield className="w-3 h-3" />
              Admin
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-gray-500 hover:text-red-600 transition-colors duration-150"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </header>
  )
}
