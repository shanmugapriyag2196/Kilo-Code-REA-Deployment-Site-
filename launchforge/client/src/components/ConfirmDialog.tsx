import React from 'react'
import { cn } from '../lib/utils'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'default'
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, variant = 'default' }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="card p-6 max-w-md w-full mx-4">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-[var(--text-dim)] text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm bg-[var(--surface-2)] hover:bg-[var(--border)] transition"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium text-white transition',
              variant === 'danger' ? 'bg-red-600 hover:bg-red-500' : 'bg-forge-600 hover:bg-forge-500'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}