import { Suspense } from 'react'
import { APPROVED_CHANNEL_IDS } from '@/lib/channels-data'
import { SEED_CHANNELS } from '@/lib/channels-data'
import { searchApprovedVideos, isApiConfigured } from '@/lib/youtube'
import VideoCard from '@/components/VideoCard'
import { getCategoryColor } from '@/lib/categories'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const channelCategoryMap: Record<string, string> = {}
  for (const ch of SEED_CHANNELS) channelCategoryMap[ch.channelId] = ch.category

  const videos = query && isApiConfigured()
    ? await searchApprovedVideos(query, APPROVED_CHANNEL_IDS)
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-extrabold text-2xl text-gray-900">
          {query ? `Results for "${query}"` : 'Search'}
        </h1>
        {query && (
          <p className="text-sm text-gray-500 mt-1">
            Searching only in approved channels
          </p>
        )}
      </div>

      {!query && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold">Type something to search approved channels.</p>
        </div>
      )}

      {query && videos.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">😕</p>
          <p className="font-semibold">No results found in approved channels.</p>
          <p className="text-sm mt-1">Try a different search term.</p>
        </div>
      )}

      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {videos.map(video => (
            <VideoCard
              key={video.videoId}
              video={video}
              categoryColor={getCategoryColor(channelCategoryMap[video.channelId] ?? '')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
