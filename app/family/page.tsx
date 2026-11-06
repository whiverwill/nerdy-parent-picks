import { Suspense } from 'react'
import Image from 'next/image'
import type { Metadata } from 'next'
import FamilyCodeForm from './FamilyCodeForm'

// Family code entry page. Visitors without a valid `family` cookie are sent
// here by proxy.ts. WORDING IS A DRAFT by Claude (TNP-Newsletter chat) except
// the tagline, which is the site's existing description. Owner to approve.

export const metadata: Metadata = {
  title: 'Family code · The Nerdy Parent Picks',
  robots: { index: false, follow: false },
}

export default function FamilyPage() {
  return (
    <div className="flex justify-center py-6 sm:py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border-2 border-tnp-purple shadow-xl overflow-hidden">
        {/* Brand stripe */}
        <div className="flex h-2" aria-hidden>
          <span className="flex-1 bg-tnp-purple" />
          <span className="flex-1 bg-tnp-yellow" />
          <span className="flex-1 bg-tnp-green" />
          <span className="flex-1 bg-tnp-blue" />
          <span className="flex-1 bg-tnp-red" />
          <span className="flex-1 bg-tnp-orange" />
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-3">
            <Image
              src="/mascot.png"
              alt="The Nerdy Parent mascot"
              width={88}
              height={88}
              className="mx-auto h-20 w-20 object-contain"
              priority
            />
            <span className="inline-block px-3 py-1 rounded-full bg-tnp-yellow text-gray-900 text-xs font-extrabold uppercase tracking-wide">
              ⭐ Premium Tier
            </span>
            <h1 className="font-extrabold text-2xl text-gray-900">
              The Nerdy Parent Picks
            </h1>
            <p className="text-sm text-gray-500">
              Curated videos for curious kids — hand-picked by a nerdy parent.
            </p>
          </div>

          <Suspense fallback={<div className="h-40" />}>
            <FamilyCodeForm />
          </Suspense>

          <div className="bg-gray-50 rounded-xl px-4 py-4 text-center space-y-1">
            <p className="font-bold text-gray-900 text-sm">Need a family code?</p>
            <p className="text-sm text-gray-600">
              The Nerdy Parent Picks is a Premium Tier product. Email{' '}
              <a
                href="mailto:trevor@thenerdyparent.com?subject=Family%20code%20for%20The%20Nerdy%20Parent%20Picks"
                className="font-bold text-tnp-purple underline underline-offset-2"
              >
                trevor@thenerdyparent.com
              </a>{' '}
              to get your family code.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
