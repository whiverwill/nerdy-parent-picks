import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { FAMILY_COOKIE, familyCodes, isValidFamilyCookie } from '@/lib/family-code'

// Paths that stay reachable without a family cookie, so the gate page itself
// (and /admin, which has its own separate passcode) keep working.
const OPEN_PATHS = ['/family', '/admin', '/api/add']

function isOpenPath(pathname: string): boolean {
  return OPEN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isOpenPath(pathname)) {
    return NextResponse.next()
  }

  // A missing/empty FAMILY_CODES would otherwise lock everyone out, kids
  // included, with no way to recover without a code. Fail open instead.
  if (familyCodes().length === 0) {
    console.warn('[proxy] FAMILY_CODES is not set — family gate is disabled, letting all traffic through.')
    return NextResponse.next()
  }

  const cookie = request.cookies.get(FAMILY_COOKIE)?.value
  if (await isValidFamilyCookie(cookie)) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Family code required' }, { status: 401 })
  }

  const url = new URL('/family', request.url)
  url.searchParams.set('next', pathname + request.nextUrl.search)
  return NextResponse.redirect(url)
}

export const config = {
  // Skip Next's internal assets and anything under /public (matched by file
  // extension), so the gate page's own images/manifest/favicons always load.
  matcher: [
    '/((?!_next/|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|json|txt|xml|woff2?)$).*)',
  ],
}
