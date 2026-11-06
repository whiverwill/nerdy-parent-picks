'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SearchBar from './SearchBar'

// Split out from Header so usePathname (dynamic) doesn't force the whole
// header — rendered in the root layout on every page — to be dynamic too.
export default function HeaderNav() {
  // The gate page itself: search and the Channels button just lead back here.
  if (usePathname() === '/family') return null

  return (
    <>
      {/* Search — grows to fill space */}
      <div className="flex-1">
        <SearchBar />
      </div>

      {/* Nav links */}
      <nav className="flex items-center shrink-0">
        <Link
          href="/channels"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-tnp-purple text-white text-sm font-bold hover:bg-purple-700 transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="hidden sm:inline">Channels</span>
        </Link>
      </nav>
    </>
  )
}
