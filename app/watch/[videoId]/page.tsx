import Link from 'next/link'
import { SEED_CHANNELS } from '@/lib/channels-data'
import { getChannelVideos, isApiConfigured } from '@/lib/youtube'
import VideoCard from '@/components/VideoCard'
import { getCategoryColor } from '@/lib/categories'

interface PageProps {
  params: Promise<{ videoId: string }>
}

export default async function WatchPage({ params }: PageProps) {
  const { videoId } = await params

  // We don't know the channel yet — we'll get it from URL or the API
  // For now, show the embedded player and load related videos from the feed
  const channelCategoryMap: Record<string, string> = {}
  for (const ch of SEED_CHANNELS) channelCategoryMap[ch.channelId] = ch.category

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-tnp-purple mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Player */}
      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      {/* Related videos section — loads from the full feed */}
      {isApiConfigured() && (
        <RelatedVideos channelCategoryMap={channelCategoryMap} />
      )}
    </div>
  )
}

async function RelatedVideos({ channelCategoryMap }: { channelCategoryMap: Record<string, string> }) {
  // Pull a sample from all channels to show as "More to Watch"
  const { getFeedVideos } = await import('@/lib/youtube')
  const videos = await getFeedVideos(
    SEED_CHANNELS.map(c => c.channelId).slice(0, 6),
    2
  )

  if (videos.length === 0) return null

  return (
    <div className="mt-8">
      <h2 className="font-extrabold text-lg text-gray-900 mb-4">More to Watch</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {videos.map(video => (
          <VideoCard
            key={video.videoId}
            video={video}
            categoryColor={getCategoryColor(channelCategoryMap[video.channelId] ?? '')}
          />
        ))}
      </div>
    </div>
  )
}
