import Link from 'next/link'
import Image from 'next/image'
import type { Video } from '@/lib/types'
import { getCategoryColor } from '@/lib/categories'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

interface Props {
  video: Video
  categoryColor?: string
}

export default function VideoCard({ video, categoryColor }: Props) {
  return (
    <Link
      href={`/watch/${video.videoId}`}
      className="group flex flex-col gap-2"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-100">
            🎬
          </div>
        )}
        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-tnp-purple ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-0.5">
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-tnp-purple transition-colors leading-snug">
          {video.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
          {categoryColor && (
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: categoryColor }} />
          )}
          <span className="text-xs text-gray-500 truncate">{video.channelName}</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(video.publishedAt)}</span>
        </div>
      </div>
    </Link>
  )
}
