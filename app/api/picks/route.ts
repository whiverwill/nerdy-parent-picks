import { SEED_PICKS } from '@/lib/channels-data'
import { getPicksVideos } from '@/lib/youtube'

export async function GET() {
  const playlistId = process.env.PICKS_PLAYLIST_ID ?? ''
  if (!playlistId) {
    // Return seed picks with basic metadata
    const videos = SEED_PICKS.map(p => ({
      videoId: p.videoId,
      title: "The Nerdy Parent's Pick",
      thumbnailUrl: `https://i.ytimg.com/vi/${p.videoId}/hqdefault.jpg`,
      channelId: '',
      channelName: p.channelName,
      publishedAt: new Date().toISOString(),
      embedType: 'youtube',
      isPick: true,
    }))
    return Response.json({ videos })
  }

  const videos = await getPicksVideos(playlistId)
  return Response.json({ videos })
}
