'use client'

import { Home, Heart, MessageCircle, UserCircle, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export type TabType = 'explore' | 'saved' | 'inbox' | 'profile'

interface BottomNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  savedCount: number
  onOpenFavorites: () => void
}

const leftTabs: { id: TabType; label: string; icon: typeof Home }[] = [
  { id: 'explore', label: 'Explore', icon: Home },
  { id: 'saved', label: 'Saved', icon: Heart },
]

const rightTabs: { id: TabType; label: string; icon: typeof Home }[] = [
  { id: 'inbox', label: 'Inbox', icon: MessageCircle },
  { id: 'profile', label: 'Profile', icon: UserCircle },
]

export function BottomNav({ activeTab, onTabChange, savedCount, onOpenFavorites }: BottomNavProps) {
  const router = useRouter()
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Poll for unread message count
  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch('/api/messages/unread')
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.count || 0)
        }
      } catch {
        // ignore
      }
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 10000) // Every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const handleClick = (tab: TabType) => {
    if (tab === 'saved') {
      router.push('/saved')
      return
    }
    if (tab === 'profile') {
      router.push('/profile')
      return
    }
    if (tab === 'inbox') {
      router.push('/inbox')
      return
    }
    onTabChange(tab)
  }

  const handleCreate = () => {
    setShowCreateMenu(false)
    router.push('/create-listing')
  }

  const renderTab = (tab: { id: TabType; label: string; icon: typeof Home }) => {
    const Icon = tab.icon
    const isActive = activeTab === tab.id

    return (
      <button
        key={tab.id}
        onClick={() => handleClick(tab.id)}
        className={`relative flex flex-col items-center gap-0.5 py-1 px-3 transition-all duration-300 hover:scale-105 active:scale-95 ${
          isActive ? 'scale-105' : ''
        }`}
      >
        <div className="relative">
          <Icon
            className={`size-5 transition-all duration-300 ${
              isActive
                ? 'text-[#004d26] drop-shadow-[0_0_4px_rgba(0,102,51,0.3)]'
                : 'text-gray-400'
            }`}
          />
          {tab.id === 'saved' && savedCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 h-4 min-w-4 px-1 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(239,68,68,0.4)] animate-pulse">
              {savedCount > 9 ? '9+' : savedCount}
            </span>
          )}
          {tab.id === 'inbox' && unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 h-4 min-w-4 px-1 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(239,68,68,0.4)] animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span
          className={`text-[10px] transition-all duration-300 ${
            isActive ? 'font-bold text-[#004d26]' : 'font-medium text-gray-400'
          }`}
        >
          {tab.label}
        </span>
        {isActive && (
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#006633] shadow-[0_0_6px_rgba(0,102,51,0.35)] animate-pulse" />
        )}
      </button>
    )
  }

  return (
    <>
      {/* Backdrop overlay for create menu */}
      {showCreateMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[3px]"
          onClick={() => setShowCreateMenu(false)}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl gradient-border-top shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around py-1.5 px-4 max-w-lg mx-auto">
          {/* Left tabs: Explore, Saved */}
          {leftTabs.map(renderTab)}

          {/* Center Plus Button with glow */}
          <div className="relative flex items-center justify-center">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className="relative -mt-5 w-14 h-14 rounded-full bg-gradient-to-br from-[#10b981] via-[#00a84f] to-[#004d26] text-white animate-breathe ring-[2.5px] ring-white/80 flex items-center justify-center active:scale-90 hover:scale-105 transition-transform duration-300"
            >
              <Plus className="size-7 stroke-[2.5]" />
            </button>

            {/* Create Menu Popup */}
            {showCreateMenu && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100/80 p-2 min-w-[200px] animate-fade-in z-50">
                <div className="px-3 py-2 mb-1">
                  <p className="text-xs font-bold text-gray-900">Create New Listing</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">What would you like to list?</p>
                </div>
                <button
                  onClick={handleCreate}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#f0fdf4] text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#006633]/10 flex items-center justify-center shrink-0">
                    <Plus className="size-4 text-[#006633]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Post a Listing</p>
                    <p className="text-[10px] text-gray-400">Add rooms, farms, offices & more</p>
                  </div>
                </button>
                <button
                  onClick={() => { setShowCreateMenu(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <svg className="size-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">View Guide</p>
                    <p className="text-[10px] text-gray-400">How to create a great listing</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Right tabs: Inbox, Profile */}
          {rightTabs.map(renderTab)}
        </div>
      </nav>
    </>
  )
}
