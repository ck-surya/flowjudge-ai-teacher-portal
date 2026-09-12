import { NextRequest, NextResponse } from 'next/server'
import { POST as login } from '../../backend/[...path]/route'
import { requestOrigin } from '@/lib/request-origin'

// Progressive enhancement: the form still logs in with POST if JavaScript has
// not initialized. Credentials are never submitted in the address bar.
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null)
  const headers = new Headers(request.headers)
  headers.set('Content-Type', 'application/json')
  const response = await login(new NextRequest(request.url, {
    method: 'POST', headers,
    body: JSON.stringify({ email: form?.get('email'), password: form?.get('password'), remember: form?.get('remember-me') === 'on' }),
  }), { params: Promise.resolve({ path: ['teachers', 'login'] }) })
  const url = new URL(response.ok ? '/teacher' : '/login', requestOrigin(request))
  if (!response.ok) url.searchParams.set('error', response.status === 401 ? 'credentials' : 'unavailable')
  const redirect = NextResponse.redirect(url, 303)
  redirect.headers.set('Cache-Control', 'no-store')
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie)
  return redirect
}
