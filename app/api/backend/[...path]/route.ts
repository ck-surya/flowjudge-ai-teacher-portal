import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/session'
import { requestOrigin } from '@/lib/request-origin'

export const dynamic = 'force-dynamic'

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  if (path[0] !== 'teachers' || path.some(segment => segment === '.' || segment === '..' || segment.includes('/') || segment.includes('\\'))) {
    return NextResponse.json({ error: { message: 'Unknown API route.' } }, { status: 404 })
  }
  const isLogin = path.length === 2 && path[1] === 'login' && request.method === 'POST'
  const isLogout = path.length === 2 && path[1] === 'logout' && request.method === 'POST'
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const finish = (response: NextResponse) => {
    response.headers.set('Cache-Control', 'no-store')
    if (isLogout || (!isLogin && response.status === 401)) response.cookies.delete(SESSION_COOKIE)
    return response
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    const origin = request.headers.get('origin')
    // Next.js can normalize nextUrl to localhost in development; Host retains
    // the public address the browser used (for example 127.0.0.1:3001).
    const expectedOrigin = requestOrigin(request)
    if (origin && origin !== expectedOrigin) {
      return NextResponse.json({ error: { message: 'Cross-origin requests are not allowed.' } }, { status: 403 })
    }
  }
  if (!isLogin && !token) {
    return finish(NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Please sign in to continue.' } }, { status: 401 }))
  }
  const base = (process.env.FLOWJUDGE_API_URL ?? 'http://127.0.0.1:3000/api').replace(/\/+$/, '')
  const headers = new Headers({ 'ngrok-skip-browser-warning': 'true' })
  if (!isLogin && token) headers.set('Authorization', `Bearer ${token}`)
  for (const name of ['content-type', 'accept']) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }
  try {
    let body: BodyInit | undefined
    let remember = false
    if (isLogin) {
      const input = await request.json().catch(() => null)
      if (typeof input?.email !== 'string' || typeof input?.password !== 'string') {
        return finish(NextResponse.json({ error: { message: 'Email and password are required.' } }, { status: 422 }))
      }
      remember = input.remember === true
      body = JSON.stringify({ email: input.email, password: input.password })
      headers.set('Content-Type', 'application/json')
    } else if (!['GET', 'HEAD'].includes(request.method)) {
      body = await request.arrayBuffer()
    }
    const upstream = await fetch(`${base}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`, {
      method: request.method, headers, body, cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(25_000),
    })
    if (isLogin && upstream.ok) {
      const result = await upstream.json()
      if (typeof result?.data?.accessToken !== 'string' || !result.data.accessToken) {
        return finish(NextResponse.json({ error: { message: 'The server did not return a sign-in token.' } }, { status: 502 }))
      }
      // Return the profile only. JavaScript never receives the bearer token.
      const response = NextResponse.json({ data: { teacher: result.data.teacher } })
      response.cookies.set(SESSION_COOKIE, result.data.accessToken, {
        httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/',
        ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
      })
      return finish(response)
    }
    const responseHeaders = new Headers()
    for (const name of ['content-type', 'content-disposition', 'x-request-id']) {
      const value = upstream.headers.get(name)
      if (value) responseHeaders.set(name, value)
    }
    return finish(new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders }))
  } catch {
    return finish(NextResponse.json({ error: { code: 'BACKEND_UNAVAILABLE', message: 'The server is unavailable. Please try again shortly.' } }, { status: 502 }))
  }
}

export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE }
