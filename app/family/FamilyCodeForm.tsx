'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { submitFamilyCode, type FamilyCodeState } from './actions'

export default function FamilyCodeForm() {
  const next = useSearchParams().get('next') ?? '/'
  const [state, formAction, pending] = useActionState<FamilyCodeState, FormData>(
    submitFamilyCode,
    { wrong: false },
  )

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="next" value={next} />

      <label htmlFor="family-code" className="block text-center text-sm font-semibold text-gray-700">
        Ask a grown-up to enter your family code
      </label>

      {state.wrong && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="text-lg shrink-0">❌</span>
          <p className="text-sm text-red-700 font-semibold">
            That code didn&apos;t work — check it and try again!
          </p>
        </div>
      )}

      <input
        id="family-code"
        name="code"
        type="text"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        required
        autoFocus
        placeholder="Family code"
        className={`w-full rounded-xl border px-4 py-3 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-tnp-purple ${
          state.wrong ? 'border-red-300' : 'border-gray-200'
        }`}
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-tnp-purple text-white font-bold py-3 text-base hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {pending ? 'Checking…' : "Let's watch! 🎬"}
      </button>
    </form>
  )
}
