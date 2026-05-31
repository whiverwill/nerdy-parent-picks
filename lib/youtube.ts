import { cacheLife, cacheTag } from 'next/cache'
import type { Video, Channel, YouTubeSearchResult, YouTubePlaylistItem, YouTubeChannelResult } from './types'
import { getBlacklistedVideoIds } from './kv'

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
    // videoOwnerChannelId/Title are the actual creator, not the playlist owner
    channelId:    item.snippet.videoOwnerChannelId ?? item.snippet.channelId,
    channelName:  item.snippet.videoOwnerChannelTitle ?? item.snippet.channelTitle,
    publishedAt:  item.snippet.publishedAt,
    embedType:    'youtube',
    isPick:       true,
  }
}

// Same shape as mapPlaylistItem but without isPick — used for uploads playlist fetches
function mapUploadsItem(item: YouTubePlaylistItem): Video {
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

/**
 * Fetch latest videos from a single channel via its uploads playlist.
 * Costs 1 quota unit per call (vs 100 for search.list) — cached 1 hour per channelId.
 *
 * YouTube channels have a hidden uploads playlist whose ID is the channel ID
 * with the leading "UC" replaced by "UU".
 */
export async function getChannelVideos(channelId: string, maxResults = 8): Promise<Video[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('videos')

  if (!API_KEY) return []
  try {
    const uploadsPlaylistId = 'UU' + channelId.slice(2)
    const res = await fetch(
      `${BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${API_KEY}`
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.items ?? [])
      .filter((item: YouTubePlaylistItem) =>
        item.snippet.title !== 'Private video' &&
        item.snippet.title !== 'Deleted video'
      )
      .map(mapUploadsItem)
  } catch {
    return []
  }
}

/**
 * Fetch a page of videos from a channel's uploads playlist, with pagination support.
 * Returns videos + nextPageToken for infinite scroll. Costs 1 quota unit per call.
 */
export async function getChannelVideosPage(
  channelId: string,
  maxResults = 20,
  pageToken?: string,
): Promise<{ videos: Video[]; nextPageToken?: string }> {
  'use cache'
  cacheLife('hours')
  cacheTag('videos')

  if (!API_KEY) return { videos: [] }
  try {
    const uploadsPlaylistId = 'UU' + channelId.slice(2)
    const tokenParam = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''
    const res = await fetch(
      `${BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}${tokenParam}&key=${API_KEY}`
    )
    if (!res.ok) return { videos: [] }
    const data = await res.json()
    const videos = (data.items ?? [])
      .filter((item: YouTubePlaylistItem) =>
        item.snippet.title !== 'Private video' &&
        item.snippet.title !== 'Deleted video'
      )
      .map(mapUploadsItem)
    return { videos, nextPageToken: data.nextPageToken ?? undefined }
  } catch {
    return { videos: [] }
  }
}

/** Fetch latest videos from multiple channels, merged, sorted by date, with blacklist applied */
export async function getFeedVideos(channelIds: string[], maxPerChannel = 8): Promise<Video[]> {
  if (!API_KEY || channelIds.length === 0) return []
  const [results, blacklist] = await Promise.all([
    Promise.allSettled(channelIds.map(id => getChannelVideos(id, maxPerChannel))),
    getBlacklistedVideoIds(),
  ])
  const videos = results
    .filter((r): r is PromiseFulfilledResult<Video[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .filter(v => !blacklist.has(v.videoId))
  return videos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

/** Read a playlist and return the unique channel IDs of all videos in it — cached 1 hour */
export async function getChannelIdsFromPlaylist(playlistId: string): Promise<string[]> {
  'use cache'
  cacheLife('hours')

  if (!API_KEY || !playlistId) return []
  try {
    const res = await fetch(
      `${BASE}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`
    )
    if (!res.ok) return []
    const data = await res.json()
    // videoOwnerChannelId = the actual video creator; channelId = playlist owner (not what we want)
    const ids = (data.items ?? []).map((item: YouTubePlaylistItem) =>
      item.snippet.videoOwnerChannelId ?? item.snippet.channelId
    )
    // Return unique channel IDs preserving order of first appearance
    return [...new Set(ids)] as string[]
  } catch {
    return []
  }
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

/**
 * Fetch metadata for specific video IDs — used by admin to get titles/thumbnails.
 * Not cached (admin needs fresh data). Costs 1 quota unit per call.
 */
export async function getVideosByIds(
  videoIds: string[],
): Promise<Record<string, { title: string; thumbnailUrl: string; channelId: string; channelName: string }>> {
  if (!API_KEY || videoIds.length === 0) return {}
  try {
    const res = await fetch(
      `${BASE}/videos?part=snippet&id=${videoIds.join(',')}&key=${API_KEY}`
    )
    if (!res.ok) return {}
    const data = await res.json()
    const map: Record<string, { title: string; thumbnailUrl: string; channelId: string; channelName: string }> = {}
    for (const item of (data.items ?? [])) {
      const t = item.snippet.thumbnails
      map[item.id] = {
        title:        item.snippet.title,
        thumbnailUrl: t.high?.url ?? t.medium?.url ?? t.default?.url ?? '',
        channelId:    item.snippet.channelId,
        channelName:  item.snippet.channelTitle,
      }
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
