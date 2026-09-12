'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function Modal({ title, busy, onClose, children }: { title: string; busy?: boolean; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    dialog?.querySelector<HTMLElement>('input:not([readonly]):not([disabled]), textarea, select')?.focus()
    return () => dialog?.close()
  }, [])
  return <dialog ref={ref} aria-label={title} onCancel={event => { event.preventDefault(); if (!busy) onClose() }}
    onClick={event => { if (event.target === ref.current && !busy) onClose() }}
    className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/50">
    <div className="p-6"><div className="flex items-center justify-between gap-4 mb-4"><h3 className="text-xl font-bold">{title}</h3>
      <button type="button" aria-label="Close dialog" disabled={busy} onClick={onClose} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50"><X size={20} /></button>
    </div>{children}</div>
  </dialog>
}
