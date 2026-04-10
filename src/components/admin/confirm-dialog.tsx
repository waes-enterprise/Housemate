'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  variant?: 'default' | 'destructive'
  /** Show a loading spinner on the confirm button while async onConfirm is running */
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'destructive',
  loading: externalLoading,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false)

  // Use external loading state if provided, otherwise track internally
  const isLoading = externalLoading ?? internalLoading

  async function handleConfirm() {
    if (isLoading) return

    if (externalLoading == null) {
      // Only manage internal state if no external loading prop
      setInternalLoading(true)
    }

    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      // Let the caller handle errors via toast, etc.
    } finally {
      if (externalLoading == null) {
        setInternalLoading(false)
      }
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => {
      if (!v) {
        // Don't allow closing while loading
        if (!isLoading) onOpenChange(false)
        return
      }
      onOpenChange(v)
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={isLoading}
            className={
              variant === 'destructive'
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white'
                : 'bg-[#006633] hover:bg-[#004d26] focus:ring-[#006633] text-white'
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {confirmText}...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
