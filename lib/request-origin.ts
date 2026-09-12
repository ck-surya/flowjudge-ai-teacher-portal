import type { NextRequest } from 'next/server'

// Next.js may expose its local listen port in request.url behind a tunnel.
// Construct a fresh origin: assigning URL.host would retain that stale port.
export function requestOrigin(request: NextRequest): string {
  return new URL(`${request.nextUrl.protocol}//${request.headers.get('host') ?? request.nextUrl.host}`).origin
}
