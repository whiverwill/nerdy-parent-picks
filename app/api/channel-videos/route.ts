import { getChannelVideosPage } from '@/lib/youtube'
import { getApprovedChannelIds } from '@/lib/get-channels'
import { getBlacklistedVideoIds } from '@/lib/kv'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const channelId  = searchParams.get('channelId')
  const pageToken  = searchParams.get('pageToken') ?? undefined

  if (!channelId) {
    return Response.json({ error: 'Missing channelId' }, { status: 400 })
  }

  // Only serve videos from approved channels
  const [approvedIds, blacklist] = await Promise.all([
    getApprovedChannelIds(),
    getBlacklistedVideoIds(),
  ])
  if (!approvedIds.has(channelId)) {
    return Response.json({ error: 'Channel not approved' }, { status: 403 })
  }

  const result = await getChannelVideosPage(channelId, 20, pageToken)

  return Response.json({
    videos:        result.videos.filter(v => !blacklist.has(v.videoId)),
    nextPageToken: result.nextPageToken,
  })
}
