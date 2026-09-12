import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE } from './lib/session'
import { requestOrigin } from './lib/request-origin'

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const login = (reason?: 'session' | 'unavailable') => {
    const url = new URL('/login', requestOrigin(request))
    if (reason) url.searchParams.set('error', reason)
    const response = NextResponse.redirect(url)
    response.headers.set('Cache-Control', 'no-store')
    return response
  }
  if (!token) return login()

  // Validate with the backend, including its expiration and revocation checks.
  // A cookie's presence alone is not proof of an authenticated teacher session.
  try {
    const base = (process.env.FLOWJUDGE_API_URL ?? 'http://127.0.0.1:3000/api').replace(/\/+$/, '')
    const profile = await fetch(`${base}/teachers/me`, {
      headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(10_000),
    })
    if (!profile.ok) {
      const response = login(profile.status === 401 ? 'session' : 'unavailable')
      if (profile.status === 401) response.cookies.delete(SESSION_COOKIE)
      return response
    }
    const body = await profile.json()
    if (!body?.data?.id) return login('unavailable')
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch {
    // Fail closed during an outage, but keep the cookie so a valid session can retry.
    return login('unavailable')
  }
}

export const config = {
  matcher: [
    '/teacher/:path*', '/classes/:path*', '/submissions/:path*',
    '/review-requests/:path*', '/students/:path*', '/problems/:path*', '/settings/:path*',
  ],
}
