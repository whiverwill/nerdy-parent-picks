import { Suspense } from 'react'
import { SEED_CHANNELS } from '@/lib/channels-data'
import { CATEGORIES, getCategoryColor } from '@/lib/categories'
import { getFeedVideos, isApiConfigured } from '@/lib/youtube'
import VideoCard from '@/components/VideoCard'
import FilterChips from '@/components/FilterChips'
import ApiSetupBanner from '@/components/ApiSetupBanner'

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const { category } = await searchParams

  if (!isApiConfigured()) {
    return <ApiSetupBanner />
  }

  // Filter channels by selected category
  const filteredChannels = category
    ? SEED_CHANNELS.filter(c => c.category === category)
    : SEED_CHANNELS

  // Channel → category lookup for coloring video cards
  const channelCategoryMap: Record<string, string> = {}
  for (const ch of SEED_CHANNELS) channelCategoryMap[ch.channelId] = ch.category

  const feedVideos = await getFeedVideos(filteredChannels.map(c => c.channelId), 4)

  return (
    <div className="space-y-6">
      {/* Category filter chips */}
      <Suspense>
        <FilterChips categories={CATEGORIES} activeCategory={category} />
      </Suspense>

      {/* Video grid */}
      {feedVideos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold">No videos found for this category.</p>
          <p className="text-sm mt-1">Try selecting a different filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {feedVideos.map(video => (
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
