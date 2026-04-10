'use client'

import { FileAttachment } from './file-attachment'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface MessageBubbleProps {
  id: string
  content: string | null
  senderId: string
  senderName?: string
  isOwnMessage: boolean
  fileUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
  fileType?: string | null
  isRead?: boolean
  createdAt: string
  status?: 'pending' | 'sent' | 'failed'
  onRetry?: () => void
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const isToday = date.toDateString() === now.toDateString()

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (isToday) return timeStr
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${date.toLocaleDateString([], { weekday: 'short' })} ${timeStr}`
  }
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`
}

export function MessageBubble({
  content,
  isOwnMessage,
  fileUrl,
  fileName,
  fileSize,
  fileType,
  isRead,
  createdAt,
  status,
  onRetry,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
    >
      <div className={`max-w-[80%] sm:max-w-[70%] ${isOwnMessage ? 'order-1' : ''}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl shadow-sm ${
            status === 'failed'
              ? 'bg-red-50 text-gray-900 border border-red-200 rounded-br-md'
              : isOwnMessage
                ? 'bg-[#006633] text-white rounded-br-md'
                : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
          }`}
        >
          {content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {content}
            </p>
          )}

          {fileUrl && (
            <FileAttachment
              fileUrl={fileUrl}
              fileName={fileName || undefined}
              fileSize={fileSize || undefined}
              fileType={fileType || undefined}
              isOwnMessage={isOwnMessage}
            />
          )}
        </div>

        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <span className={`text-[10px] ${isOwnMessage ? 'text-gray-400' : 'text-gray-400'}`}>
            {formatTime(createdAt)}
          </span>
          {isOwnMessage && !status && (
            <span className="text-[10px] text-gray-400">
              {isRead ? '✓✓' : '✓'}
            </span>
          )}
          {status === 'pending' && (
            <span className="text-[10px] text-gray-400 animate-pulse">Sending...</span>
          )}
          {status === 'sent' && (
            <span className="text-[10px] text-gray-400">✓✓</span>
          )}
          {status === 'failed' && (
            <button
              onClick={onRetry}
              className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-600 transition-colors"
            >
              <AlertCircle className="size-3" />
              Failed
              <RefreshCw className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
