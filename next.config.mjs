import { networkInterfaces } from 'node:os'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js also checks the Origin of its development WebSocket. Allow this
  // computer's actual addresses so LAN pages can initialize and hot-reload.
  allowedDevOrigins: [...new Set([
    '127.0.0.1',
    ...(process.env.FLOWJUDGE_DEV_ORIGINS ?? '').split(',').map(host => host.trim()).filter(Boolean),
    ...Object.values(networkInterfaces()).flat().filter(address => address?.family === 'IPv4').map(address => address.address),
  ])],
  images: { unoptimized: true },
}

export default nextConfig
