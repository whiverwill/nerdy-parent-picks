import { cacheLife } from 'next/cache'
import type { Video, Channel, YouTubeSearchResult, YouTubePlaylistItem, YouTubeChannelResult } from './types'

const API_KEY = process.env.YOUTUBE_API_KEY
const BASE = 'https://www.googleapis.com/youtube/v3'

export function isApiConfigured(): boolean {
  return Boolean(API_KEY)
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapSearchItem(item: YouTubeSearchResult): Video {
  const t = item.snippet.thumbnails
  return {
    videoId:      item.id.videoId,
    title:        item.snippet.title,
    description:  item.snippet.description,
    thumbnailUrl: t.high?.url ?? t.medium?.url ?? t.default?.url ?? '',
    channelId:    item.snippet.channelId,
    channelName:  item.snippet.channelTitle,
    publishedAt:  item.snippet.publishedAt,
    embedType:    'youtube',
  }
}

function mapPlaylistItem(item: YouTubePlaylistItem): Video {
  const t = item.snippet.thumbnails
  return {
    videoId:      item.snippet.resourceId.videoId,
    title:        item.snippet.title,
    description:  item.snippet.description,
    thumbnailUrl: t.high?.url ?? t.medium?.url ?? t.default?.url ?? '',
    channelId:    item.snippet.channelId,
    channelName:  item.snippet.channelTitle,
    publishedAt:  item.snippet.publishedAt,
    embedType:    'youtube',
    isPick:       true,
  }
}

function mapChannelItem(item: YouTubeChannelResult): Partial<Channel> {
  const t = item.snippet.thumbnails
  return {
    channelId:    item.id,
    name:         item.snippet.title,
    description:  item.snippet.description,
    thumbnailUrl: t.high?.url ?? t.medium?.url ?? t.default?.url ?? '',
  }
}

// ─── Cached API calls ─────────────────────────────────────────────────────────
// Each function is cached individually by its arguments.
// getChannelVideos is cached per channelId — 17 channels × 100 units = 1,700 units
// per cache cycle (1 hour), well within the 10,000/day free quota.

/** Fetch latest videos from a single channel — cached 1 hour per channelId */
export async function getChannelVideos(channelId: string, maxResults = 8): Promise<Video[]> {
  'use cache'
  cacheLife('hours')

  if (!API_KEY) return []
  try {
    const res = await fetch(
      `${BASE}/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&order=date&type=video&key=${API_KEY}`
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.items ?? []).map(mapSearchItem)
  } catch {
    return []
  }
}

/** Fetch latest videos from multiple channels, merged and sorted by date */
export async function getFeedVideos(channelIds: string[], maxPerChannel = 4): Promise<Video[]> {
  if (!API_KEY || channelIds.length === 0) return []
  const results = await Promise.allSettled(
    channelIds.map(id => getChannelVideos(id, maxPerChannel))
  )
  const videos = results
    .filter((r): r is PromiseFulfilledResult<Video[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)
  return videos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

/** Fetch videos from "The Nerdy Parent's Picks" playlist — cached 1 hour */
export async function getPicksVideos(playlistId: string, maxResults = 20): Promise<Video[]> {
  'use cache'
  cacheLife('hours')

  if (!API_KEY || !playlistId) return []
  try {
    const res = await fetch(
      `${BASE}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${API_KEY}`
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.items ?? []).map(mapPlaylistItem)
  } catch {
    return []
  }
}

/** Search within approved channels — not cached (results should always be fresh) */
export async function searchApprovedVideos(
  query: string,
  approvedChannelIds: Set<string>,
  maxResults = 25
): Promise<Video[]> {
  if (!API_KEY || !query.trim()) return []
  try {
    const res = await fetch(
      `${BASE}/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${maxResults}&type=video&key=${API_KEY}`
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.items ?? [])
      .filter((item: YouTubeSearchResult) => approvedChannelIds.has(item.snippet.channelId))
      .map(mapSearchItem)
  } catch {
    return []
  }
}

/** Enrich channel metadata (thumbnail, description) — cached 24 hours */
export async function enrichChannels(channelIds: string[]): Promise<Record<string, Partial<Channel>>> {
  'use cache'
  cacheLife('days')

  if (!API_KEY || channelIds.length === 0) return {}
  try {
    const ids = channelIds.join(',')
    const res = await fetch(
      `${BASE}/channels?part=snippet&id=${ids}&key=${API_KEY}`
    )
    if (!res.ok) return {}
    const data = await res.json()
    const map: Record<string, Partial<Channel>> = {}
    for (const item of (data.items ?? [])) {
      map[item.id] = mapChannelItem(item)
    }
    return map
  } catch {
    return {}
  }
}

/** Resolve a legacy /user/ or handle URL to a channel ID — cached 24 hours */
export async function resolveChannelId(handle: string): Promise<string | null> {
  'use cache'
  cacheLife('days')

  if (!API_KEY) return null
  try {
    const res = await fetch(
      `${BASE}/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${API_KEY}`
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.items?.[0]?.id ?? null
  } catch {
    return null
  }
}
