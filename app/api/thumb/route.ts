import { NextRequest } from 'next/server'
import { ALLOWED_THUMBNAIL_HOSTS } from '@/lib/thumb'

/**
 * Proxies YouTube thumbnail/avatar images through our own domain, so devices
 * that block YouTube's CDN at the network level (e.g. Firewalla parental
 * controls) can still load them — only watch.thenerdyparent.com needs to be
 * reachable from the client.
 */
export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get('u')
  if (!src) return new Response('Missing url', { status: 400 })

  let url: URL
  try {
    url = new URL(src)
  } catch {
    return new Response('Invalid url', { status: 400 })
  }

  if (url.protocol !== 'https:' || !ALLOWED_THUMBNAIL_HOSTS.has(url.hostname)) {
    return new Response('Host not allowed', { status: 400 })
  }

  const upstream = await fetch(url, { headers: { Accept: 'image/*' } })
  if (!upstream.ok || !upstream.body) {
    return new Response('Upstream error', { status: 502 })
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
    },
  })
}
