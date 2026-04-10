'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  Tag,
  Activity,
  Settings,
  ExternalLink,
  X,
  Home,
  LogOut,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/listings', label: 'Listings', icon: Building2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/activity', label: 'Activity Log', icon: Activity },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface AdminUser {
  id?: string
  name: string
  email: string
  role: string
}

interface AdminSidebarProps {
  admin: AdminUser | null
  open: boolean
  onClose: () => void
  onLogout: () => void
}

export function AdminSidebar({ admin, open, onClose, onLogout }: AdminSidebarProps) {
  const pathname = usePathname()

  const initials = admin?.name
    ? admin.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD'

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[280px] bg-slate-900 text-white flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-700/50 shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#006633] flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight tracking-tight">Housemate ZM</h1>
              <p className="text-[10px] text-slate-400 leading-tight">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 border-l-[3px]',
                  isActive
                    ? 'bg-slate-800 text-white border-[#006633]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent'
                )}
              >
                <item.icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-[#006633]' : '')} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 border-t border-slate-700/50">
          {/* Back to site */}
          <Link
            href="/"
            className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors duration-150"
          >
            <ExternalLink className="w-4 h-4" />
            Back to Site
          </Link>

          <Separator className="bg-slate-700/50" />

          {/* Admin info + Logout */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 bg-slate-700 border border-slate-600">
                <AvatarFallback className="text-xs font-semibold bg-[#006633]/20 text-[#006633]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {admin?.name || 'Admin'}
                </p>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#006633]" />
                  <p className="text-[11px] text-slate-400 truncate">{admin?.email || 'admin@housematezm.com'}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors duration-150"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
