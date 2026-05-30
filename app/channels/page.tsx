import { getApprovedChannels } from '@/lib/get-channels'
import ChannelCard from '@/components/ChannelCard'
import type { Channel } from '@/lib/types'

export default async function ChannelsPage() {
  // getApprovedChannels merges seed channels + playlist-added channels,
  // already enriched with YouTube metadata
  const channels = await getApprovedChannels()

  // Group by category
  const byCategory = channels.reduce<Record<string, Channel[]>>((acc, ch) => {
    ;(acc[ch.category] ??= []).push(ch)
    return acc
  }, {})

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-extrabold text-2xl text-gray-900">All Channels</h1>
        <p className="text-gray-500 text-sm mt-1">{channels.length} approved channels</p>
      </div>

      {Object.entries(byCategory).map(([cat, chs]) => (
        <section key={cat}>
          <h2 className="font-bold text-base text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span>{cat}</span>
            <span className="text-gray-300 font-normal">({chs.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {chs.map(ch => (
              <ChannelCard key={ch.channelId} channel={ch} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
