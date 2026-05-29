import { APPROVED_CHANNEL_IDS } from '@/lib/channels-data'
import { searchApprovedVideos } from '@/lib/youtube'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''
  if (!q.trim()) return Response.json({ videos: [] })

  const videos = await searchApprovedVideos(q, APPROVED_CHANNEL_IDS)
  return Response.json({ videos })
}
