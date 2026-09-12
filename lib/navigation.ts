export function replaceListFilters(updates: Record<string, string>) {
  // Read the latest URL so quick successive selections cannot restore stale filters.
  // Next.js synchronizes its search params with native history updates.
  const query = new URLSearchParams(window.location.search)
  for (const [key, value] of Object.entries(updates)) {
    if (value) query.set(key, value); else query.delete(key)
  }
  window.history.replaceState(null, '', `${window.location.pathname}${query.size ? `?${query}` : ''}`)
}

export function submissionReturnPath(value: string | null): string {
  if (!value) return '/submissions'
  try {
    const url = new URL(value, 'https://portal.local')
    if (url.origin === 'https://portal.local' && ['/submissions', '/review-requests'].includes(url.pathname)) {
      return `${url.pathname}${url.search}`
    }
  } catch { /* Fall back to the submission list for malformed links. */ }
  return '/submissions'
}
