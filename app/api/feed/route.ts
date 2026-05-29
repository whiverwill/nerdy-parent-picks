import { SEED_CHANNELS } from '@/lib/channels-data'
import { getFeedVideos } from '@/lib/youtube'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category')
  const channels = category
    ? SEED_CHANNELS.filter(c => c.category === category)
    : SEED_CHANNELS

  const videos = await getFeedVideos(channels.map(c => c.channelId), 4)
  return Response.json({ videos })
}
