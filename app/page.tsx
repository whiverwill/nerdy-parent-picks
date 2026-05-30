import { Suspense } from 'react'
import { SEED_PICKS } from '@/lib/channels-data'
import { CATEGORIES, getCategoryColor } from '@/lib/categories'
import { getFeedVideos, getPicksVideos, isApiConfigured } from '@/lib/youtube'
import { getApprovedChannels } from '@/lib/get-channels'
import VideoCard from '@/components/VideoCard'
import PicksRow from '@/components/PicksRow'
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

  const allChannels = await getApprovedChannels()

  // Filter channels by selected category
  const filteredChannels = category
    ? allChannels.filter(c => c.category === category)
    : allChannels

  // Channel → category lookup for coloring video cards
  const channelCategoryMap: Record<string, string> = {}
  for (const ch of allChannels) channelCategoryMap[ch.channelId] = ch.category

  const picksPlaylistId = process.env.PICKS_PLAYLIST_ID ?? ''
  const [feedVideos, picksVideos] = await Promise.all([
    getFeedVideos(filteredChannels.map(c => c.channelId), 4),
    picksPlaylistId
      ? getPicksVideos(picksPlaylistId)
      : Promise.resolve(SEED_PICKS.map(p => ({
          videoId: p.videoId,
          title: "The Nerdy Parent's Pick",
          thumbnailUrl: `https://i.ytimg.com/vi/${p.videoId}/hqdefault.jpg`,
          channelId: '',
          channelName: p.channelName,
          publishedAt: new Date().toISOString(),
          embedType: 'youtube' as const,
          isPick: true,
        }))),
  ])

  return (
    <div className="space-y-6">
      {/* The Nerdy Parent's Picks — powered by your YouTube playlist */}
      <PicksRow videos={picksVideos} />

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
