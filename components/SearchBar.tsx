'use client'

import { useState, useRef, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const router = useRouter()
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const q = inputRef.current?.value.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className={`flex items-center rounded-full border-2 transition-colors bg-gray-50 ${
        focused ? 'border-tnp-purple' : 'border-gray-200'
      }`}>
        <input
          ref={inputRef}
          type="search"
          placeholder="Search approved channels…"
          className="flex-1 bg-transparent px-4 py-1.5 text-sm outline-none text-gray-800 placeholder:text-gray-400"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <button
          type="submit"
          className="pr-3 text-gray-400 hover:text-tnp-purple transition-colors"
          aria-label="Search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </button>
      </div>
    </form>
  )
}
