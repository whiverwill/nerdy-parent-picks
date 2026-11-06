import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import HeaderNav from './HeaderNav'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-tnp-purple shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/mascot.png"
            alt="The Nerdy Parent mascot"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <Image
            src="/logo.png"
            alt="The Nerdy Parent"
            width={180}
            height={48}
            className="h-8 w-auto object-contain hidden sm:block"
            priority
          />
        </Link>

        <Suspense fallback={<div className="flex-1" />}>
          <HeaderNav />
        </Suspense>
      </div>
    </header>
  )
}
