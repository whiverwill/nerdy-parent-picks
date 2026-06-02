import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { SEED_PICKS } from '@/lib/channels-data'
import { CATEGORIES } from '@/lib/categories'
import { getFeedVideos, getPicksVideos, isApiConfigured } from '@/lib/youtube'
import { getApprovedChannels } from '@/lib/get-channels'
import { getAdminPicks, getAgeRestrictedChannelIds } from '@/lib/kv'
import HomeFeed from '@/components/HomeFeed'
import PicksRow from '@/components/PicksRow'
import FilterChips from '@/components/FilterChips'
import AgeGate from '@/components/AgeGate'
import ApiSetupBanner from '@/components/ApiSetupBanner'

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const { category } = await searchParams

  if (!isApiConfigured()) {
    return <ApiSetupBanner />
  }

  const jar = await cookies()
  const ageUnlocked = jar.get('tnp_age_ok')?.value === '1'

  const [allChannels, ageRestrictedIds] = await Promise.all([
    getApprovedChannels(),
    getAgeRestrictedChannelIds(),
  ])

  // Hide 12+ channels unless unlocked
  const visibleChannels = ageUnlocked
    ? allChannels
    : allChannels.filter(c => !ageRestrictedIds.has(c.channelId))

  // Filter visible channels by selected category
  const filteredChannels = category
    ? visibleChannels.filter(c => c.category === category)
    : visibleChannels

  // Channel → category lookup for coloring video cards
  const channelCategoryMap: Record<string, string> = {}
  for (const ch of visibleChannels) channelCategoryMap[ch.channelId] = ch.category

  const filteredChannelIds = filteredChannels.map(c => c.channelId)
  const picksPlaylistId = process.env.PICKS_PLAYLIST_ID ?? ''
  const [feedPage, playlistPicks, adminPicks] = await Promise.all([
    getFeedVideos(filteredChannelIds, 8),
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
    getAdminPicks(),
  ])

  // Admin picks (newest first) + playlist picks, deduplicating by videoId
  const adminPickVideos = adminPicks.map(p => ({
    videoId:      p.videoId,
    title:        p.title,
    thumbnailUrl: p.thumbnailUrl,
    channelId:    p.channelId,
    channelName:  p.channelName,
    publishedAt:  p.addedAt,
    embedType:    'youtube' as const,
    isPick:       true,
  }))
  const adminPickIds = new Set(adminPickVideos.map(v => v.videoId))
  const picksVideos = [
    ...adminPickVideos,
    ...playlistPicks.filter(v => !adminPickIds.has(v.videoId)),
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return (
    <div className="space-y-6">
      {/* The Nerdy Parent's Picks — powered by your YouTube playlist */}
      <PicksRow videos={picksVideos} />

      {/* Category filter chips + age gate */}
      <div className="flex items-center gap-2 flex-wrap">
        <Suspense>
          <FilterChips categories={CATEGORIES} activeCategory={category} />
        </Suspense>
        <AgeGate
          isUnlocked={ageUnlocked}
          hasRestrictedChannels={ageRestrictedIds.size > 0}
        />
      </div>

      {/* Video grid — client component handles watched-video filtering + infinite scroll */}
      {feedPage.videos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold">No videos found for this category.</p>
          <p className="text-sm mt-1">Try selecting a different filter.</p>
        </div>
      ) : (
        <HomeFeed
          key={category ?? 'all'}
          videos={feedPage.videos}
          channelCategoryMap={channelCategoryMap}
          channelIds={filteredChannelIds}
          initialPageTokens={feedPage.nextPageTokens}
        />
      )}
    </div>
  )
}
