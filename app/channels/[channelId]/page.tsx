import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { SEED_CHANNELS } from '@/lib/channels-data'
import { getChannelVideos, enrichChannels } from '@/lib/youtube'
import { getCategoryColor, getCategoryLabel } from '@/lib/categories'
import VideoCard from '@/components/VideoCard'

interface PageProps {
  params: Promise<{ channelId: string }>
}

export default async function ChannelDetailPage({ params }: PageProps) {
  const { channelId } = await params

  // Verify this is an approved channel
  const channel = SEED_CHANNELS.find(c => c.channelId === channelId)
  if (!channel) notFound()

  const color = getCategoryColor(channel.category)
  const label = getCategoryLabel(channel.category)

  // Fetch channel metadata and videos in parallel
  const [meta, videos] = await Promise.all([
    enrichChannels([channelId]),
    getChannelVideos(channelId, 20),
  ])

  const enriched = meta[channelId]
  const thumbnailUrl = enriched?.thumbnailUrl
  const description = enriched?.description ?? ''

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/channels"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-tnp-purple transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Channels
      </Link>

      {/* Channel header */}
      <div className="flex items-center gap-5 p-5 rounded-2xl bg-gray-50 border border-gray-100">
        {/* Avatar */}
        <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 ring-4 ring-white shadow-md">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={channel.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-white"
              style={{ backgroundColor: color }}
            >
              {channel.name[0]}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-extrabold text-xl text-gray-900">{channel.name}</h1>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shrink-0"
              style={{ backgroundColor: color }}
            >
              {label}
            </span>
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>
          )}
          <a
            href={`https://www.youtube.com/channel/${channelId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-tnp-purple hover:underline mt-2"
          >
            View on YouTube
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Videos */}
      <div>
        <h2 className="font-bold text-base text-gray-700 mb-4">
          Latest Videos
          <span className="ml-2 text-gray-400 font-normal text-sm">({videos.length})</span>
        </h2>

        {videos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold">No videos found for this channel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {videos.map(video => (
              <VideoCard
                key={video.videoId}
                video={video}
                categoryColor={color}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
