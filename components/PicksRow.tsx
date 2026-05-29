import Link from 'next/link'
import Image from 'next/image'
import type { Video } from '@/lib/types'

interface Props {
  videos: Video[]
}

export default function PicksRow({ videos }: Props) {
  if (videos.length === 0) return null

  return (
    <section className="py-4">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3 px-4 md:px-0">
        <span className="text-xl">⭐</span>
        <h2 className="font-extrabold text-lg text-gray-900">
          The Nerdy Parent&apos;s Picks
        </h2>
        <div className="flex-1 h-0.5 bg-gradient-to-r from-tnp-purple/30 to-transparent rounded-full ml-2" />
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {videos.map(video => (
          <Link
            key={video.videoId}
            href={`/watch/${video.videoId}`}
            className="group shrink-0 w-52 snap-start"
          >
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 ring-2 ring-tnp-purple/30 group-hover:ring-tnp-purple transition-all">
              {video.thumbnailUrl ? (
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  sizes="208px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl bg-tnp-purple/10">
                  🎬
                </div>
              )}
              {/* Star badge */}
              <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-tnp-purple flex items-center justify-center shadow">
                <span className="text-xs">⭐</span>
              </div>
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-tnp-purple ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="mt-1.5 text-xs font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-tnp-purple transition-colors">
              {video.title}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{video.channelName}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
