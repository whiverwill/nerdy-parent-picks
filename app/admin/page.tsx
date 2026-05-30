import Image from 'next/image'
import { cookies } from 'next/headers'
import { SEED_CHANNELS } from '@/lib/channels-data'
import { enrichChannels } from '@/lib/youtube'
import {
  getDynamicChannelIds,
  getRemovedChannelIds,
  getBlacklistedVideos,
  isKvConfigured,
  type BlacklistedVideo,
} from '@/lib/kv'
import { getCategoryColor, getCategoryLabel } from '@/lib/categories'
import {
  login,
  logout,
  addChannel,
  deleteChannel,
  addToBlacklist,
  removeFromBlacklist,
} from './actions'
import type { Channel } from '@/lib/types'

// ─── Auth check ───────────────────────────────────────────────────────────────

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const { error, success } = await searchParams
  const jar    = await cookies()
  const token  = jar.get('admin_token')?.value
  const secret = process.env.ADD_SECRET_TOKEN

  if (!secret || !token || token !== secret) {
    return <LoginPage error={error} />
  }

  return <AdminPanel error={error} success={success} />
}

// ─── Login page ───────────────────────────────────────────────────────────────

function LoginPage({ error }: { error?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="text-center">
          <p className="text-3xl mb-2">🛡️</p>
          <h1 className="font-extrabold text-xl text-gray-900">Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Nerdy Parent Picks</p>
        </div>

        {error === 'wrong-password' && (
          <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2 text-center">
            Wrong password. Try again.
          </p>
        )}

        <form action={login} className="space-y-4">
          <input
            type="password"
            name="token"
            placeholder="Admin password"
            autoFocus
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tnp-purple"
          />
          <button
            type="submit"
            className="w-full bg-tnp-purple text-white font-semibold rounded-xl py-3 text-sm hover:opacity-90 transition-opacity"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Admin panel ──────────────────────────────────────────────────────────────

async function AdminPanel({ error, success }: { error?: string; success?: string }) {
  const kvReady = isKvConfigured()

  // Read all state directly from KV (bypasses cache — always fresh)
  const [dynamicIds, removedIds, blacklistedVideos] = await Promise.all([
    getDynamicChannelIds(),
    getRemovedChannelIds(),
    getBlacklistedVideos(),
  ])

  // Build full channel list with metadata
  const allIds = [...SEED_CHANNELS.map(c => c.channelId), ...dynamicIds]
  const meta   = await enrichChannels(allIds)

  type AdminChannel = Channel & { source: 'seed' | 'dynamic'; isRemoved: boolean }

  const channels: AdminChannel[] = [
    ...SEED_CHANNELS.map(ch => ({
      ...ch,
      thumbnailUrl: meta[ch.channelId]?.thumbnailUrl ?? ch.thumbnailUrl,
      description:  meta[ch.channelId]?.description  ?? ch.description,
      source: 'seed' as const,
      isRemoved: removedIds.has(ch.channelId),
    })),
    ...dynamicIds.map(id => ({
      channelId:    id,
      name:         meta[id]?.name        ?? 'Unknown Channel',
      thumbnailUrl: meta[id]?.thumbnailUrl,
      description:  meta[id]?.description,
      category:     'education' as const,
      source:       'dynamic' as const,
      isRemoved:    removedIds.has(id),
    })),
  ]

  const activeChannels  = channels.filter(c => !c.isRemoved)
  const removedChannels = channels.filter(c => c.isRemoved)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-gray-900">🛡️ Admin</h1>
          <p className="text-sm text-gray-500">Nerdy Parent Picks</p>
        </div>
        <form action={logout}>
          <button type="submit" className="text-xs text-gray-400 hover:text-gray-600 underline">
            Sign out
          </button>
        </form>
      </div>

      {/* Flash messages */}
      {success && (
        <div className="bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm">
          {success === 'channel-added'   && '✅ Channel added successfully.'}
          {success === 'channel-removed' && '✅ Channel removed.'}
          {success === 'video-blocked'   && '🚫 Video blocked.'}
          {success === 'video-unblocked' && '✅ Video unblocked.'}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error === 'unresolved-channel' && "❌ Couldn't resolve that URL to a channel. Try pasting the channel page URL directly."}
          {error === 'not-a-video'        && '❌ That doesn\'t look like a video URL. Paste a YouTube watch link.'}
          {error === 'unauthorized'       && '❌ Session expired. Please sign in again.'}
        </div>
      )}

      {!kvReady && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 text-sm">
          <strong>Vercel KV not configured.</strong> Add/remove and blacklist won't persist.{' '}
          Set up a KV store in your Vercel dashboard and connect it to this project.
        </div>
      )}

      {/* ── Channels ── */}
      <section className="space-y-4">
        <h2 className="font-bold text-lg text-gray-900">
          Channels
          <span className="ml-2 text-gray-400 font-normal text-sm">({activeChannels.length} active)</span>
        </h2>

        <div className="space-y-2">
          {activeChannels.map(ch => (
            <ChannelRow key={ch.channelId} channel={ch} />
          ))}
        </div>

        {removedChannels.length > 0 && (
          <details className="text-sm text-gray-400">
            <summary className="cursor-pointer hover:text-gray-600 select-none">
              {removedChannels.length} hidden channel{removedChannels.length !== 1 ? 's' : ''}
            </summary>
            <div className="mt-2 space-y-2 opacity-50">
              {removedChannels.map(ch => (
                <ChannelRow key={ch.channelId} channel={ch} />
              ))}
            </div>
          </details>
        )}

        {/* Add channel form */}
        <div className="pt-2">
          <p className="text-sm font-semibold text-gray-700 mb-2">Add a channel</p>
          <p className="text-xs text-gray-400 mb-3">
            Paste a YouTube channel URL, handle (/@name), or any video URL from the channel.
          </p>
          <form action={addChannel} className="flex gap-2">
            <input
              type="url"
              name="url"
              placeholder="https://youtube.com/@channelname"
              required
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tnp-purple"
            />
            <button
              type="submit"
              className="shrink-0 bg-tnp-purple text-white font-semibold rounded-xl px-4 py-2 text-sm hover:opacity-90 transition-opacity"
            >
              Add
            </button>
          </form>
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* ── Blacklisted videos ── */}
      <section className="space-y-4">
        <h2 className="font-bold text-lg text-gray-900">
          Blocked Videos
          <span className="ml-2 text-gray-400 font-normal text-sm">
            ({blacklistedVideos.length} blocked)
          </span>
        </h2>

        {blacklistedVideos.length === 0 ? (
          <p className="text-sm text-gray-400">No videos blocked yet.</p>
        ) : (
          <div className="space-y-2">
            {blacklistedVideos.map(v => (
              <BlacklistedVideoRow key={v.videoId} video={v} />
            ))}
          </div>
        )}

        {/* Add to blacklist form */}
        <div className="pt-2">
          <p className="text-sm font-semibold text-gray-700 mb-2">Block a video</p>
          <p className="text-xs text-gray-400 mb-3">
            Paste a YouTube watch URL. The video will be hidden everywhere in the app.
          </p>
          <form action={addToBlacklist} className="flex gap-2">
            <input
              type="url"
              name="url"
              placeholder="https://youtube.com/watch?v=..."
              required
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tnp-purple"
            />
            <button
              type="submit"
              className="shrink-0 bg-red-500 text-white font-semibold rounded-xl px-4 py-2 text-sm hover:opacity-90 transition-opacity"
            >
              Block
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ChannelRow({
  channel,
}: {
  channel: { channelId: string; name: string; category: string; thumbnailUrl?: string; source: 'seed' | 'dynamic'; isRemoved: boolean }
}) {
  const color = getCategoryColor(channel.category)
  const label = getCategoryLabel(channel.category)

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
      {/* Avatar */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
        {channel.thumbnailUrl ? (
          <Image src={channel.thumbnailUrl} alt={channel.name} fill sizes="40px" className="object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-base font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {channel.name[0]}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 truncate">{channel.name}</p>
        <span
          className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white mt-0.5"
          style={{ backgroundColor: color }}
        >
          {label}
        </span>
      </div>

      {/* Remove / restore button */}
      <form action={deleteChannel}>
        <input type="hidden" name="channelId" value={channel.channelId} />
        <button
          type="submit"
          className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
          title="Remove channel"
        >
          Remove
        </button>
      </form>
    </div>
  )
}

function BlacklistedVideoRow({ video }: { video: BlacklistedVideo }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
      {video.thumbnailUrl && (
        <div className="relative w-20 h-12 rounded-lg overflow-hidden shrink-0">
          <Image src={video.thumbnailUrl} alt={video.title} fill sizes="80px" className="object-cover" />
        </div>
      )}
      <p className="flex-1 text-sm text-gray-700 line-clamp-2 min-w-0">{video.title}</p>
      <form action={removeFromBlacklist}>
        <input type="hidden" name="videoId" value={video.videoId} />
        <button
          type="submit"
          className="text-xs text-gray-400 hover:text-green-600 px-2 py-1 rounded-lg hover:bg-green-50 transition-colors shrink-0"
        >
          Unblock
        </button>
      </form>
    </div>
  )
}
