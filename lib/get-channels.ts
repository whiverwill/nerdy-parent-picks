import { cacheLife, cacheTag } from 'next/cache'
import { SEED_CHANNELS } from './channels-data'
import { getChannelIdsFromPlaylist, enrichChannels } from './youtube'
import { getDynamicChannelIds, getRemovedChannelIds } from './kv'
import type { Channel } from './types'

/**
 * Returns the full approved channel list — seed channels merged with any
 * channels added via:
 *   (a) the CHANNELS_PLAYLIST_ID YouTube playlist, or
 *   (b) the admin panel (stored in Vercel KV)
 *
 * Channels explicitly removed via the admin panel are excluded.
 * All channels are enriched with YouTube thumbnails and descriptions.
 *
 * Cached 1 hour. Use updateTag('channels') to bust immediately.
 */
export async function getApprovedChannels(): Promise<Channel[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('channels')

  const playlistId = process.env.CHANNELS_PLAYLIST_ID ?? ''

  // Source 1: YouTube playlist (for channels whose videos can be playlist-saved)
  const playlistChannelIds = playlistId
    ? await getChannelIdsFromPlaylist(playlistId)
    : []

  // Source 2: Admin-panel additions stored in KV
  const kvChannelIds = await getDynamicChannelIds()

  // Channels explicitly removed via admin panel
  const removedIds = await getRemovedChannelIds()

  const seedIds = new Set(SEED_CHANNELS.map(c => c.channelId))

  // Merge playlist + KV additions, excluding seed IDs and duplicates
  const extraIds = [
    ...playlistChannelIds.filter(id => !seedIds.has(id)),
    ...kvChannelIds.filter(id => !seedIds.has(id)),
  ]
  const uniqueExtraIds = [...new Set(extraIds)]

  // Enrich ALL channels (seed + extras) in one batched API call = 1 quota unit
  const allIds = [...SEED_CHANNELS.map(c => c.channelId), ...uniqueExtraIds]
  const meta = await enrichChannels(allIds)

  const enrichedSeed: Channel[] = SEED_CHANNELS
    .filter(ch => !removedIds.has(ch.channelId))
    .map(ch => ({
      ...ch,
      thumbnailUrl: meta[ch.channelId]?.thumbnailUrl ?? ch.thumbnailUrl,
      description:  meta[ch.channelId]?.description  ?? ch.description,
    }))

  if (uniqueExtraIds.length === 0) return enrichedSeed

  const dynamicChannels: Channel[] = uniqueExtraIds
    .filter(id => !removedIds.has(id))
    .map(id => ({
      channelId:    id,
      name:         meta[id]?.name        ?? 'Unknown Channel',
      thumbnailUrl: meta[id]?.thumbnailUrl,
      description:  meta[id]?.description,
      category:     'education' as const,
      isActive:     true,
    }))

  return [...enrichedSeed, ...dynamicChannels]
}

/**
 * Returns a Set of all approved channel IDs — for fast lookup during search filtering.
 */
export async function getApprovedChannelIds(): Promise<Set<string>> {
  const channels = await getApprovedChannels()
  return new Set(channels.map(c => c.channelId))
}
