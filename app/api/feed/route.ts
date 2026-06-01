import { getChannelVideosPage } from '@/lib/youtube'
import { getApprovedChannelIds } from '@/lib/get-channels'
import { getBlacklistedVideoIds } from '@/lib/kv'
import type { Video } from '@/lib/types'

/**
 * POST /api/feed
 * Loads the next page of the multi-channel home feed.
 *
 * Body: { channelIds: string[], pageTokens: Record<string, string> }
 * Returns: { videos: Video[], nextPageTokens: Record<string, string> }
 *
 * Each channel has its own pageToken cursor. We fetch the next 8 videos per
 * channel, merge + sort by date, and return updated cursors for the next call.
 * Channel IDs are validated against the approved list to prevent quota abuse.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      channelIds: string[]
      pageTokens: Record<string, string>
    }
    const { channelIds, pageTokens } = body

    if (!Array.isArray(channelIds) || channelIds.length === 0) {
      return Response.json({ error: 'Missing channelIds' }, { status: 400 })
    }

    // Only serve approved channels (prevents quota abuse from arbitrary IDs)
    const [approvedIds, blacklist] = await Promise.all([
      getApprovedChannelIds(),
      getBlacklistedVideoIds(),
    ])
    const validIds = channelIds.filter(id => approvedIds.has(id))
    if (validIds.length === 0) {
      return Response.json({ videos: [], nextPageTokens: {} })
    }

    const results = await Promise.allSettled(
      validIds.map(id => getChannelVideosPage(id, 8, pageTokens?.[id]))
    )

    const nextPageTokens: Record<string, string> = {}
    const videos: Video[] = results
      .flatMap((r, i) => {
        if (r.status !== 'fulfilled') return []
        if (r.value.nextPageToken) nextPageTokens[validIds[i]] = r.value.nextPageToken
        return r.value.videos
      })
      .filter(v => !blacklist.has(v.videoId))

    videos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

    return Response.json({ videos, nextPageTokens })
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
