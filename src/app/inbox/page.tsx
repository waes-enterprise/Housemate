'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'
import { ConversationList } from '@/components/chat/conversation-list'
import { ChatView } from '@/components/chat/chat-view'

interface Conversation {
  id: string
  participant1Id: string
  participant2Id: string
  listingId: string | null
  lastMessageAt: string
  createdAt: string
  updatedAt: string
  participant1: { id: string; name: string; avatarUrl: string | null }
  participant2: { id: string; name: string; avatarUrl: string | null }
  listing: { id: string; title: string; imageUrl: string } | null
  messages: any[]
  _count: { messages: number }
}

export default function InboxPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(true)

  // Check screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check auth
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (data.user) {
          setUserId(data.user.id)
        } else {
          router.push('/auth/signin?redirect=/inbox')
        }
      } catch {
        router.push('/auth/signin?redirect=/inbox')
      }
    }
    checkAuth()
  }, [router])

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!userId) return
    try {
      const res = await fetch('/api/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Handle new conversation from URL params
  useEffect(() => {
    async function createOrGetConversation() {
      const participantId = searchParams.get('participantId')
      const listingId = searchParams.get('listingId')
      const isNew = searchParams.get('conversation') === 'new'

      if (!isNew || !participantId || !userId) return

      setIsLoading(true)
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participantId,
            listingId: listingId || undefined,
          }),
        })

        if (res.ok) {
          const conversation = await res.json()
          setActiveConversation(conversation)
          setConversations((prev) => {
            const exists = prev.some((c) => c.id === conversation.id)
            if (exists) return prev
            return [conversation, ...prev]
          })
          // Clean URL params
          router.replace('/inbox', { scroll: false })
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      createOrGetConversation()
    }
  }, [searchParams, userId, router])

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation)
  }

  const handleBack = () => {
    setActiveConversation(null)
    fetchConversations()
  }

  // Not authenticated yet
  if (!userId) {
    return (
      <div className="min-h-screen bg-[#f8f9fa]">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006633]" />
        </div>
      </div>
    )
  }

  const showMobileChat = isMobile && activeConversation

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#006633]">
        <div className="flex items-center px-4 py-3 gap-3">
          {showMobileChat ? (
            <>
              <button
                onClick={handleBack}
                className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="size-4 text-white" />
              </button>
              <h1 className="text-white font-bold text-lg tracking-tight flex-1">Chat</h1>
            </>
          ) : (
            <>
              <Link href="/" className="shrink-0">
                <Home className="size-5 text-white" />
              </Link>
              <Link href="/" className="shrink-0 hover:opacity-80">
                <h1 className="text-white font-bold text-lg tracking-tight">Housemate<span className="text-[#4ade80]">.zm</span></h1>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop: Both panels visible. Mobile: One at a time */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white flex-shrink-0 ${
            showMobileChat ? 'hidden md:block' : 'block'
          }`}
        >
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversation?.id || null}
            userId={userId}
            onSelectConversation={handleSelectConversation}
            isLoading={isLoading}
          />
        </div>

        <div
          className={`flex-1 ${
            showMobileChat ? 'block' : 'hidden md:block'
          }`}
        >
          {activeConversation ? (
            <ChatView
              conversation={activeConversation}
              userId={userId}
              onBack={handleBack}
            />
          ) : (
            <div className="hidden md:flex flex-col items-center justify-center h-full bg-[#f8f9fa]">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="size-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-500 mb-1">
                Select a conversation
              </h3>
              <p className="text-sm text-gray-400">
                Choose from your existing conversations or start a new one from a listing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
