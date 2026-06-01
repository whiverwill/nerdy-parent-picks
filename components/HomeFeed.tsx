'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import VideoCard from '@/components/VideoCard'
import type { Video } from '@/lib/types'
import { getWatchedIds } from '@/lib/watched'
import { getCategoryColor } from '@/lib/categories'

interface Props {
  videos: Video[]
  channelCategoryMap: Record<string, string>
  channelIds: string[]
  initialPageTokens: Record<string, string>
}

export default function HomeFeed({
  videos: initialVideos,
  channelCategoryMap,
  channelIds,
  initialPageTokens,
}: Props) {
  const [allVideos, setAllVideos]       = useState<Video[]>(initialVideos)
  const [pageTokens, setPageTokens]     = useState(initialPageTokens)
  const [loading, setLoading]           = useState(false)
  const [exhausted, setExhausted]       = useState(Object.keys(initialPageTokens).length === 0)

  // Watched-video tracking (localStorage, hydrates after mount)
  const [watchedIds, setWatchedIds]     = useState<Set<string>>(new Set())
  const [mounted, setMounted]           = useState(false)
  const [showWatched, setShowWatched]   = useState(false)

  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setWatchedIds(getWatchedIds())
    setMounted(true)
  }, [])

  const loadMore = useCallback(async () => {
    if (loading || exhausted) return
    setLoading(true)
    try {
      const res = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelIds, pageTokens }),
      })
      const data = await res.json() as {
        videos: Video[]
        nextPageTokens: Record<string, string>
      }
      setAllVideos(prev => {
        // Deduplicate in case the same video appears at a page boundary
        const existingIds = new Set(prev.map(v => v.videoId))
        const fresh = data.videos.filter(v => !existingIds.has(v.videoId))
        return [...prev, ...fresh]
      })
      setPageTokens(data.nextPageTokens)
      if (Object.keys(data.nextPageTokens).length === 0) setExhausted(true)
    } catch {
      setExhausted(true)
    } finally {
      setLoading(false)
    }
  }, [channelIds, pageTokens, loading, exhausted])

  // IntersectionObserver — triggers loadMore when sentinel scrolls into view
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || exhausted) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, exhausted])

  // Split into unwatched / watched (after hydration to avoid layout shift)
  const unwatched = mounted ? allVideos.filter(v => !watchedIds.has(v.videoId)) : allVideos
  const watched   = mounted ? allVideos.filter(v =>  watchedIds.has(v.videoId)) : []

  return (
    <>
      {/* ── Main feed ── */}
      {unwatched.length === 0 && !loading ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold">
            {mounted && watched.length > 0
              ? "You've watched everything here!"
              : 'No videos found for this category.'}
          </p>
          <p className="text-sm mt-1">
            {mounted && watched.length > 0
              ? 'Check the Already Watched section below, or try a different filter.'
              : 'Try selecting a different filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {unwatched.map(video => (
            <VideoCard
              key={video.videoId}
              video={video}
              categoryColor={getCategoryColor(channelCategoryMap[video.channelId] ?? '')}
            />
          ))}
        </div>
      )}

      {/* ── Infinite scroll sentinel + spinner ── */}
      {!exhausted && (
        <div ref={sentinelRef} className="flex justify-center py-10">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading more…
            </div>
          )}
        </div>
      )}

      {/* ── Already Watched section ── */}
      {watched.length > 0 && (
        <div className="mt-4 border-t border-gray-100 pt-6">
          <button
            onClick={() => setShowWatched(s => !s)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-gray-600 transition-colors mb-4"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showWatched ? 'rotate-90' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Already Watched ({watched.length})
          </button>

          {showWatched && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 opacity-60">
              {watched.map(video => (
                <VideoCard
                  key={video.videoId}
                  video={video}
                  categoryColor={getCategoryColor(channelCategoryMap[video.channelId] ?? '')}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
