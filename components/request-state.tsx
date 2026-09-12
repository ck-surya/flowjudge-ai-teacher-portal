'use client'

export function RequestState({ loading, error, onRetry }: { loading?: boolean; error?: string; onRetry?: () => void }) {
  if (error) return <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive"><p>{error}</p>{onRetry && <button onClick={onRetry} className="mt-2 underline">Try again</button>}</div>
  if (loading) return <p role="status" className="py-6 text-muted-foreground">Loading…</p>
  return null
}
