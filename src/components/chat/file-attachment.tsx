'use client'

import { Image as ImageIcon, Film, Music, FileText, Download } from 'lucide-react'


interface FileAttachmentProps {
  fileUrl: string
  fileName?: string
  fileSize?: number
  fileType?: string
  isOwnMessage?: boolean
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon({ type }: { type?: string }) {
  switch (type) {
    case 'image':
      return <ImageIcon className="size-4" />
    case 'video':
      return <Film className="size-4" />
    case 'audio':
      return <Music className="size-4" />
    default:
      return <FileText className="size-4" />
  }
}

function FileIconBg({ type }: { type?: string }) {
  let bgClass = 'bg-gray-100 text-gray-600'
  if (type === 'image') bgClass = 'bg-green-50 text-green-600'
  else if (type === 'video') bgClass = 'bg-purple-50 text-purple-600'
  else if (type === 'audio') bgClass = 'bg-amber-50 text-amber-600'

  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
      <FileIcon type={type} />
    </div>
  )
}

export function FileAttachment({ fileUrl, fileName, fileSize, fileType, isOwnMessage }: FileAttachmentProps) {
  if (fileType === 'image') {
    return (
      <div className="mt-1.5">
        <div className="relative group rounded-xl overflow-hidden border border-white/20 max-w-[240px]">
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={fileUrl}
              alt={fileName || 'Image'}
              className="w-full h-auto max-h-48 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
              loading="lazy"
            />
          </a>
        </div>
        {fileName && (
          <p className={`text-[10px] mt-1 opacity-70 ${isOwnMessage ? 'text-green-100' : 'text-gray-400'} truncate`}>
            {fileName}
          </p>
        )}
      </div>
    )
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      download
      className={`flex items-center gap-2.5 p-2.5 mt-1.5 rounded-xl border max-w-[220px] transition-colors ${
        isOwnMessage
          ? 'bg-white/15 border-white/20 hover:bg-white/20'
          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }`}
    >
      <FileIconBg type={fileType} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${isOwnMessage ? 'text-white' : 'text-gray-800'}`}>
          {fileName || 'File'}
        </p>
        {fileSize && (
          <p className={`text-[10px] ${isOwnMessage ? 'text-green-100' : 'text-gray-400'}`}>
            {formatFileSize(fileSize)}
          </p>
        )}
      </div>
      <Download className={`size-3.5 shrink-0 ${isOwnMessage ? 'text-green-200' : 'text-gray-400'}`} />
    </a>
  )
}
