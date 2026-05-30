import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getApprovedChannels } from '@/lib/get-channels'
import { getChannelVideosPage, enrichChannels } from '@/lib/youtube'
import { getBlacklistedVideoIds } from '@/lib/kv'
import { getCategoryColor, getCategoryLabel } from '@/lib/categories'
import ChannelVideoFeed from '@/components/ChannelVideoFeed'

interface PageProps {
  params: Promise<{ channelId: string }>
}

export default async function ChannelDetailPage({ params }: PageProps) {
  const { channelId } = await params

  // Verify this is an approved channel
  const allChannels = await getApprovedChannels()
  const channel = allChannels.find(c => c.channelId === channelId)
  if (!channel) notFound()

  const color = getCategoryColor(channel.category)
  const label = getCategoryLabel(channel.category)

  // Fetch channel metadata and first page of videos in parallel.
  // enrichChannels is already called inside getApprovedChannels, but we call it
  // here too for the description — it's cached 24h so no extra quota cost.
  const [meta, firstPage, blacklist] = await Promise.all([
    enrichChannels([channelId]),
    getChannelVideosPage(channelId, 20),
    getBlacklistedVideoIds(),
  ])

  const enriched    = meta[channelId]
  const thumbnailUrl = channel.thumbnailUrl ?? enriched?.thumbnailUrl
  const description  = channel.description  ?? enriched?.description ?? ''

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

      {/* Videos — infinite scroll */}
      <div>
        <h2 className="font-bold text-base text-gray-700 mb-4">
          Latest Videos
        </h2>
        <ChannelVideoFeed
          channelId={channelId}
          initialVideos={firstPage.videos.filter(v => !blacklist.has(v.videoId))}
          initialNextPageToken={firstPage.nextPageToken}
          categoryColor={color}
        />
      </div>
    </div>
  )
}
