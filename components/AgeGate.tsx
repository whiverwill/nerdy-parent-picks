'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PROBLEMS = [
  { q: 'If 3x + 6 = 27, what is x?',  a: 7  },
  { q: 'If 4x − 5 = 19, what is x?',  a: 6  },
  { q: 'If 2x + 13 = 35, what is x?', a: 11 },
  { q: 'If 5x − 8 = 42, what is x?',  a: 10 },
  { q: 'If 6x + 4 = 40, what is x?',  a: 6  },
  { q: 'If 3x − 7 = 14, what is x?',  a: 7  },
  { q: 'If 8x + 3 = 51, what is x?',  a: 6  },
  { q: 'If 4x + 9 = 33, what is x?',  a: 6  },
  { q: 'If 2x + 17 = 43, what is x?', a: 13 },
  { q: 'If 5x + 6 = 51, what is x?',  a: 9  },
]

function randomProblem() {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
}

interface Props {
  isUnlocked: boolean
  hasRestrictedChannels: boolean
}

export default function AgeGate({ isUnlocked, hasRestrictedChannels }: Props) {
  const router = useRouter()
  const [open, setOpen]       = useState(false)
  const [problem, setProblem] = useState(randomProblem)
  const [answer, setAnswer]   = useState('')
  const [wrong, setWrong]     = useState(false)

  // Nothing to show if there are no restricted channels at all
  if (!hasRestrictedChannels) return null

  function openModal() {
    setProblem(randomProblem())
    setAnswer('')
    setWrong(false)
    setOpen(true)
  }

  function unlock() {
    if (parseInt(answer.trim(), 10) === problem.a) {
      // Session cookie — expires when browser is closed
      document.cookie = 'tnp_age_ok=1; path=/'
      setOpen(false)
      router.refresh()
    } else {
      setWrong(true)
      setProblem(randomProblem())
      setAnswer('')
    }
  }

  return (
    <>
      {isUnlocked ? (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-xs text-orange-500 font-semibold">
          🔓 12+ on
        </span>
      ) : (
        <button
          onClick={openModal}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-400 hover:border-orange-300 hover:text-orange-400 transition-colors"
        >
          🔒 12+ hidden
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-5">
            <div className="text-center">
              <p className="text-3xl mb-1">🧮</p>
              <h2 className="font-extrabold text-lg text-gray-900">Solve to unlock</h2>
              <p className="text-xs text-gray-400 mt-1">Answer the algebra problem to show 12+ channels</p>
            </div>

            <div className="bg-gray-50 rounded-xl px-4 py-4 text-center">
              {wrong && (
                <p className="text-xs text-red-500 mb-2">Not quite — try this one:</p>
              )}
              <p className="font-semibold text-gray-800 text-base">{problem.q}</p>
            </div>

            <input
              type="number"
              inputMode="numeric"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && unlock()}
              placeholder="x = ?"
              autoFocus
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-tnp-purple"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={unlock}
                className="flex-1 rounded-xl bg-tnp-purple text-white font-semibold py-2.5 text-sm hover:opacity-90 transition-opacity"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
