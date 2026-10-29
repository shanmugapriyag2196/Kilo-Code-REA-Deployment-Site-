import React, { useEffect } from 'react'
import { cn } from '../lib/utils'

interface Props {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, type, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={cn(
        'px-4 py-3 rounded-lg shadow-lg text-sm text-white',
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      )}>
        {message}
      </div>
    </div>
  )
}