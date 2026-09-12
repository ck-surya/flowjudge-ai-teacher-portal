const TOKEN_KEY = 'teacher-jwt'
const API_BASE = '/api/backend'

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string, public requestId?: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return
  // Remove tokens left by older versions of the portal. Authentication now uses
  // the HttpOnly cookie, which is created and cleared by the server.
  window.sessionStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(TOKEN_KEY)
}

export async function apiRequest(path: string, options: RequestInit = {}, authenticated = true): Promise<Response> {
  const headers = new Headers(options.headers)
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, credentials: 'same-origin', headers, cache: 'no-store', signal: options.signal ?? AbortSignal.timeout(30_000) })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error
    throw new ApiError('Unable to reach the server. Please try again.', 0, 'CONNECTION_FAILED')
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    if (response.status === 401 && authenticated) {
      clearSession()
      if (typeof window !== 'undefined') window.location.assign('/login?error=session')
    }
    throw new ApiError(body?.error?.message ?? `Request failed (${response.status}).`, response.status, body?.error?.code, body?.error?.requestId)
  }
  return response
}

export async function apiFetch<T>(path: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  const response = await apiRequest(path, options, authenticated)
  if (response.status === 204) return undefined as T
  const body = await response.json().catch(() => { throw new ApiError('The server returned an invalid response.', 502) })
  if (!body || typeof body !== 'object' || !('data' in body)) throw new ApiError('The server returned an unexpected response format.', 502)
  return body.data as T
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
