/**
 * Per-device watched-video tracking via localStorage.
 * Stores an ordered list of video IDs (oldest first), capped at MAX entries.
 * Safe to import in client components only.
 */

const KEY = 'tnp_watched'
const MAX = 500

export function getWatchedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

export function markWatched(videoId: string): void {
  try {
    const existing = getWatchedIds()
    if (existing.has(videoId)) return            // already recorded — skip
    const arr = Array.from(existing)
    arr.push(videoId)
    // Keep only the last MAX entries so storage doesn't grow unbounded
    const trimmed = arr.slice(-MAX)
    localStorage.setItem(KEY, JSON.stringify(trimmed))
  } catch {}
}

export function clearWatched(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}
