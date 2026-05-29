import Link from 'next/link'
import Image from 'next/image'
import type { Channel } from '@/lib/types'
import { getCategoryColor, getCategoryLabel } from '@/lib/categories'

interface Props {
  channel: Channel
}

export default function ChannelCard({ channel }: Props) {
  const color = channel.customColor ?? getCategoryColor(channel.category)
  const label = getCategoryLabel(channel.category)

  return (
    <Link
      href={`/channels/${channel.channelId}`}
      className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 hover:border-tnp-purple hover:shadow-md transition-all"
    >
      {/* Channel avatar */}
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 ring-2 ring-transparent group-hover:ring-tnp-purple transition-all">
        {channel.thumbnailUrl ? (
          <Image
            src={channel.thumbnailUrl}
            alt={channel.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-2xl font-extrabold text-white"
            style={{ backgroundColor: color }}
          >
            {channel.name[0]}
          </div>
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <p className="font-semibold text-sm text-gray-900 group-hover:text-tnp-purple transition-colors line-clamp-2 leading-snug">
          {channel.name}
        </p>
        <span
          className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          {label}
        </span>
      </div>
    </Link>
  )
}
