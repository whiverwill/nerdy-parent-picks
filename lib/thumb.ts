/**
 * Hostnames YouTube serves thumbnails/avatars from. Kept in one place so the
 * proxy route and the client-side URL builder below stay in sync.
 */
export const ALLOWED_THUMBNAIL_HOSTS = new Set([
  'i.ytimg.com',
  'yt3.ggpht.com',
  'yt3.googleusercontent.com',
])

/**
 * Rewrites a YouTube thumbnail URL to load through our own /api/thumb proxy
 * instead of hitting i.ytimg.com/yt3.*.com directly. Kids' devices with
 * YouTube blocked at the network level (e.g. Firewalla) can still reach
 * watch.thenerdyparent.com, so routing images through our own domain keeps
 * thumbnails working without needing to allowlist YouTube's CDN domains.
 */
export function proxyThumb(url: string): string {
  try {
    const { hostname, protocol } = new URL(url)
    if (protocol !== 'https:' || !ALLOWED_THUMBNAIL_HOSTS.has(hostname)) return url
  } catch {
    return url
  }
  return `/api/thumb?u=${encodeURIComponent(url)}`
}
