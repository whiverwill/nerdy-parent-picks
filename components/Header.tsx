import Link from 'next/link'
import Image from 'next/image'
import SearchBar from './SearchBar'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-tnp-purple shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/logo.png"
            alt="The Nerdy Parent"
            width={180}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Search — grows to fill space */}
        <div className="flex-1">
          <SearchBar />
        </div>

        {/* Nav links */}
        <nav className="flex items-center shrink-0">
          <Link
            href="/channels"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-tnp-purple text-white text-sm font-bold hover:bg-purple-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Channels
          </Link>
        </nav>
      </div>
    </header>
  )
}
