'use client'

import { useState, useEffect } from 'react'
import VideoCard from '@/components/VideoCard'
import type { Video } from '@/lib/types'
import { getWatchedIds } from '@/lib/watched'
import { getCategoryColor } from '@/lib/categories'

interface Props {
  videos: Video[]
  channelCategoryMap: Record<string, string>
}

export default function HomeFeed({ videos, channelCategoryMap }: Props) {
  // Start with "not yet mounted" so SSR + first render show all videos
  // (localStorage is unavailable server-side, so we hydrate after mount)
  const [watchedIds, setWatchedIds]   = useState<Set<string>>(new Set())
  const [mounted, setMounted]         = useState(false)
  const [showWatched, setShowWatched] = useState(false)

  useEffect(() => {
    setWatchedIds(getWatchedIds())
    setMounted(true)
  }, [])

  // Only split after hydration to avoid layout shift
  const unwatched = mounted ? videos.filter(v => !watchedIds.has(v.videoId)) : videos
  const watched   = mounted ? videos.filter(v =>  watchedIds.has(v.videoId)) : []

  return (
    <>
      {/* ── Main feed ── */}
      {unwatched.length === 0 ? (
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
