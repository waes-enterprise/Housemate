'use client'

import { useRef, useState } from 'react'
import { Send, Paperclip, X, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (content: string, file?: { fileUrl: string; fileName: string; fileSize: number; fileType: string }) => void
  disabled?: boolean
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; type: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile({ name: file.name, size: file.size, type: file.type })

    // Upload file
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()

      // Send message with file
      onSendMessage('', {
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
      })

      setSelectedFile(null)
    } catch (err) {
      console.error('Upload error:', err)
      alert('Failed to upload file. Please try again.')
      setSelectedFile(null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed && !selectedFile) return
    if (disabled || isUploading) return

    if (trimmed) {
      onSendMessage(trimmed)
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      {selectedFile && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
            <Paperclip className="size-3.5 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{selectedFile.name}</p>
            <p className="text-[10px] text-gray-400">{formatFileSize(selectedFile.size)}</p>
          </div>
          {isUploading ? (
            <Loader2 className="size-4 text-gray-400 animate-spin" />
          ) : (
            <button
              onClick={() => setSelectedFile(null)}
              className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
            >
              <X className="size-3 text-gray-500" />
            </button>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0 disabled:opacity-50"
        >
          <Paperclip className="size-4 text-gray-500" />
        </button>

        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#006633]/20 focus:border-[#006633]/30 transition-all max-h-24"
            style={{ minHeight: '42px' }}
            disabled={disabled || isUploading}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={(disabled || (!message.trim() && !selectedFile)) || isUploading}
          className="h-10 w-10 rounded-xl bg-[#006633] flex items-center justify-center hover:bg-[#004d26] transition-colors shrink-0 disabled:opacity-40 disabled:hover:bg-[#006633]"
        >
          <Send className="size-4 text-white" />
        </button>
      </div>
    </div>
  )
}
