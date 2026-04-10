'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, MoreVertical, Trash2 } from 'lucide-react'
import { MessageBubble } from './message-bubble'
import { ChatInput } from './chat-input'

interface ChatViewProps {
  conversation: any
  userId: string
  onBack: () => void
}

interface Message {
  id: string
  content?: string
  senderId: string
  sender?: { id: string; name: string }
  fileUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
  fileType?: string | null
  isRead: boolean
  createdAt: string
  _status?: 'pending' | 'sent' | 'failed'
}

export function ChatView({ conversation, userId, onBack }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isVisibleRef = useRef(true)

  const otherUser =
    conversation.participant1Id === userId
      ? conversation.participant2
      : conversation.participant1

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load initial messages
  useEffect(() => {
    if (conversation.messages) {
      setMessages(conversation.messages)
    }
    // Mark as read
    fetch(`/api/conversations/${conversation.id}/read`, { method: 'POST' })
  }, [conversation.id, conversation.messages])

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // SSE connection with fallback polling
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout | null = null
    let retryCount = 0

    function connectSSE() {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const es = new EventSource(`/api/conversations/${conversation.id}/stream`)
      eventSourceRef.current = es

      es.onopen = () => {
        setIsConnected(true)
        retryCount = 0
        // Stop fallback polling when SSE is connected
        if (fallbackIntervalRef.current) {
          clearInterval(fallbackIntervalRef.current)
          fallbackIntervalRef.current = null
        }
      }

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'new_message') {
            setMessages((prev) => {
              const existingIds = new Set(prev.map(m => m.id))
              if (existingIds.has(data.message.id)) return prev
              // Mark incoming messages as read
              if (data.message.senderId !== userId) {
                fetch(`/api/conversations/${conversation.id}/read`, { method: 'POST' })
              }
              return [...prev, data.message]
            })
          }
        } catch {
          // ignore parse errors
        }
      }

      es.onerror = () => {
        setIsConnected(false)
        es.close()
        // Exponential backoff: 1s, 2s, 4s, max 10s
        retryCount++
        const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000)
        retryTimeout = setTimeout(connectSSE, delay)
      }
    }

    // Start fallback polling immediately (will be stopped when SSE connects)
    fallbackIntervalRef.current = setInterval(async () => {
      if (eventSourceRef.current?.readyState === EventSource.OPEN) return
      try {
        const res = await fetch(`/api/conversations/${conversation.id}`)
        if (res.ok) {
          const data = await res.json()
          const fetchedMessages = data.messages || []
          setMessages((prev) => {
            const existingIds = new Set(prev.map(m => m.id))
            const newMessages = fetchedMessages.filter(m => !existingIds.has(m.id))
            if (newMessages.length > 0) {
              fetch(`/api/conversations/${conversation.id}/read`, { method: 'POST' })
              return [...prev, ...newMessages]
            }
            return prev
          })
        }
      } catch {
        // ignore
      }
    }, 3000)

    // Connect SSE
    connectSSE()

    // Visibility change handler - pause/resume
    function handleVisibilityChange() {
      isVisibleRef.current = document.visibilityState === 'visible'
      if (isVisibleRef.current) {
        // Tab became visible - reconnect if needed
        if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
          connectSSE()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current)
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [conversation.id, userId])

  const handleSendMessage = async (
    content: string,
    file?: {
      fileUrl: string
      fileName: string
      fileSize: number
      fileType: string
    }
  ) => {
    if (isSending) return

    // Optimistic: add message immediately with pending status
    const tempId = `temp-${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      content,
      senderId: userId,
      sender: { id: userId, name: 'You' },
      fileUrl: file?.fileUrl,
      fileName: file?.fileName,
      fileSize: file?.fileSize,
      fileType: file?.fileType,
      isRead: false,
      createdAt: new Date().toISOString(),
      _status: 'pending',
    }

    setMessages(prev => [...prev, optimisticMessage])
    setIsSending(true)

    try {
      const body: Record<string, unknown> = { content }
      if (file) {
        body.fileUrl = file.fileUrl
        body.fileName = file.fileName
        body.fileSize = file.fileSize
        body.fileType = file.fileType
      }

      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const serverMessage = await res.json()
        // Replace temp message with server message
        setMessages(prev =>
          prev.map(m => m.id === tempId ? { ...serverMessage, _status: 'sent' as const } : m)
        )
      } else {
        // Mark as failed
        setMessages(prev =>
          prev.map(m => m.id === tempId ? { ...m, _status: 'failed' as const } : m)
        )
      }
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === tempId ? { ...m, _status: 'failed' as const } : m)
      )
    } finally {
      setIsSending(false)
    }
  }

  const handleRetry = (tempId: string) => {
    // Remove failed message
    setMessages(prev => prev.filter(m => m.id !== tempId))
  }

  const handleDelete = async () => {
    if (!confirm('Delete this conversation? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/conversations/${conversation.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        onBack()
      }
    } catch {
      // ignore
    }
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const colors = [
    'bg-[#006633]',
    'bg-amber-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-orange-500',
  ]
  let hash = 0
  for (let i = 0; i < otherUser.name.length; i++) {
    hash = otherUser.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const avatarColor = colors[Math.abs(hash) % colors.length]

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-3 bg-white border-b border-gray-100 shrink-0">
        <button
          onClick={onBack}
          className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0 md:hidden"
        >
          <ArrowLeft className="size-4 text-gray-600" />
        </button>

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor}`}
            >
              {getInitials(otherUser.name)}
            </div>
            {isConnected && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate">
              {otherUser.name}
            </h2>
            {conversation.listing ? (
              <p className="text-[10px] text-[#006633] font-medium truncate">
                Re: {conversation.listing.title}
              </p>
            ) : (
              <p className="text-[10px] text-gray-400">
                {isConnected ? 'Online' : 'Connecting...'}
              </p>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="h-9 w-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <MoreVertical className="size-4 text-gray-500" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[140px] z-20">
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="size-4" />
                  Delete Chat
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-sm font-medium text-gray-500">
              No messages yet
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Say hello to start the conversation!
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            id={msg.id}
            content={msg.content}
            senderId={msg.senderId}
            senderName={msg.sender?.name}
            isOwnMessage={msg.senderId === userId}
            fileUrl={msg.fileUrl}
            fileName={msg.fileName}
            fileSize={msg.fileSize}
            fileType={msg.fileType}
            isRead={msg.isRead}
            createdAt={msg.createdAt}
            status={msg._status}
            onRetry={msg._status === 'failed' ? handleRetry : undefined}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={isSending}
      />
    </div>
  )
}
