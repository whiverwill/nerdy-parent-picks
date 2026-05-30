'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import VideoCard from './VideoCard'
import type { Video } from '@/lib/types'

interface Props {
  channelId: string
  initialVideos: Video[]
  initialNextPageToken?: string
  categoryColor: string
}

export default function ChannelVideoFeed({
  channelId,
  initialVideos,
  initialNextPageToken,
  categoryColor,
}: Props) {
  const [videos, setVideos]               = useState<Video[]>(initialVideos)
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(initialNextPageToken)
  const [loading, setLoading]             = useState(false)
  const [exhausted, setExhausted]         = useState(!initialNextPageToken)
  const sentinelRef                       = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || exhausted) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ channelId })
      if (nextPageToken) params.set('pageToken', nextPageToken)
      const res  = await fetch(`/api/channel-videos?${params}`)
      const data = await res.json() as { videos: Video[]; nextPageToken?: string }
      setVideos(prev => [...prev, ...data.videos])
      setNextPageToken(data.nextPageToken)
      if (!data.nextPageToken) setExhausted(true)
    } catch {
      setExhausted(true)
    } finally {
      setLoading(false)
    }
  }, [channelId, nextPageToken, loading, exhausted])

  // Intersection observer — fires loadMore when the sentinel div scrolls into view
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || exhausted) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '400px' }   // start loading 400px before the bottom
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, exhausted])

  if (videos.length === 0 && !loading) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📭</p>
        <p className="font-semibold">No videos found for this channel.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {videos.map(video => (
          <VideoCard key={video.videoId} video={video} categoryColor={categoryColor} />
        ))}
      </div>

      {/* Sentinel + spinner */}
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

      {exhausted && videos.length > 0 && (
        <p className="text-center text-sm text-gray-300 py-8">
          All {videos.length} videos loaded
        </p>
      )}
    </>
  )
}
