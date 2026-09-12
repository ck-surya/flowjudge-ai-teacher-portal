'use client'

import { useEffect, useRef } from 'react'

export function Modal({ title, busy, onClose, children }: { title: string; busy?: boolean; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close() }, [])
  return <dialog ref={ref} aria-label={title} onCancel={event => { event.preventDefault(); if (!busy) onClose() }}
    onClick={event => { if (event.target === ref.current && !busy) onClose() }}
    className="m-auto w-[calc(100%_-_2rem)] max-w-md rounded-xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/50">
    <div className="p-6"><h3 className="text-xl font-bold mb-4">{title}</h3>{children}</div>
  </dialog>
}
