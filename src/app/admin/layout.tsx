'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [checking, setChecking] = useState(true)
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false)
      return
    }

    async function fetchSession() {
      try {
        const res = await fetch('/api/admin/session')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setAdmin(data.user)
          } else {
            router.push('/admin/login')
          }
        } else {
          router.push('/admin/login')
        }
      } catch {
        router.push('/admin/login')
      } finally {
        setChecking(false)
      }
    }
    fetchSession()
  }, [isLoginPage, router])

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    setAdmin(null)
    router.push('/admin/login')
  }

  // Login page gets full-screen without sidebar
  if (isLoginPage) {
    return <>{children}</>
  }

  // Show loading while checking session
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-2 border-[#006633] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading admin panel...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar
        admin={admin}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          admin={admin}
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
