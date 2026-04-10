'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, ShieldCheck } from 'lucide-react'

interface ConversationListProps {
  conversations: any[]
  activeConversationId: string | null
  userId: string
  onSelectConversation: (conversation: any) => void
  isLoading: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-[#006633]',
    'bg-amber-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-orange-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function getLastMessagePreview(messages: any[]): string {
  if (!messages || messages.length === 0) return 'No messages yet'
  const last = messages[0]
  if (last.fileUrl && !last.content) {
    return last.fileType === 'image' ? '📷 Photo' : `📎 ${last.fileName || 'File'}`
  }
  return last.content || 'No messages yet'
}

export function ConversationList({
  conversations,
  activeConversationId,
  userId,
  onSelectConversation,
  isLoading,
}: ConversationListProps) {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const filtered = search.trim()
    ? conversations.filter((c) => {
        const otherUser =
          c.participant1Id === userId ? c.participant2 : c.participant1
        return otherUser.name.toLowerCase().includes(search.toLowerCase())
      })
    : conversations

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3">
          <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="flex-1 space-y-1 px-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3">
        <input
          type="text"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006633]/20 focus:border-[#006633]/30 transition-all"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <MessageCircle className="size-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">
              {search ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {search
                ? 'Try a different search'
                : 'Start a conversation from a listing'}
            </p>
          </div>
        )}

        {filtered.map((conversation) => {
          const otherUser =
            conversation.participant1Id === userId
              ? conversation.participant2
              : conversation.participant1
          const unreadCount = conversation._count?.messages || 0
          const isActive = conversation.id === activeConversationId

          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className={`w-full flex items-center gap-3 p-3 text-left transition-colors border-b border-gray-50 ${
                isActive
                  ? 'bg-[#006633]/5 border-l-2 border-l-[#006633]'
                  : 'hover:bg-gray-50'
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(otherUser.name)}`}
                >
                  {getInitials(otherUser.name)}
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4.5 min-w-4.5 px-1 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className={`text-sm font-semibold truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-800'}`}>
                      {otherUser.name}
                    </span>
                    {otherUser.isVerifiedAgent && (
                      <ShieldCheck className="size-3.5 text-[#006633] shrink-0" />
                    )}
                  </div>
                  <span className={`text-[10px] shrink-0 ${unreadCount > 0 ? 'text-[#006633] font-semibold' : 'text-gray-400'}`}>
                    {timeAgo(conversation.lastMessageAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {conversation.listing && (
                    <span className="text-[10px] text-[#006633] font-medium bg-[#006633]/10 px-1.5 py-0.5 rounded shrink-0">
                      {conversation.listing.title.length > 20
                        ? conversation.listing.title.slice(0, 20) + '...'
                        : conversation.listing.title}
                    </span>
                  )}
                  <p className={`text-xs truncate ${unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                    {getLastMessagePreview(conversation.messages)}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
