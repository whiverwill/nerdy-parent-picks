import { cacheLife } from 'next/cache'
import { SEED_CHANNELS } from './channels-data'
import { getChannelIdsFromPlaylist, enrichChannels } from './youtube'
import type { Channel } from './types'

/**
 * Returns the full approved channel list — seed channels merged with any
 * channels added via the CHANNELS_PLAYLIST_ID YouTube playlist.
 *
 * To add a channel: save any video from it to your Channels playlist in YouTube.
 * To remove a channel: remove that video from the playlist.
 *
 * Cached for 1 hour — changes appear within an hour of updating the playlist.
 */
export async function getApprovedChannels(): Promise<Channel[]> {
  'use cache'
  cacheLife('hours')

  const playlistId = process.env.CHANNELS_PLAYLIST_ID ?? ''

  // Get channel IDs from the playlist (empty array if not configured)
  const playlistChannelIds = playlistId
    ? await getChannelIdsFromPlaylist(playlistId)
    : []

  // Find IDs that aren't already in the seed list
  const seedIds = new Set(SEED_CHANNELS.map(c => c.channelId))
  const newIds = playlistChannelIds.filter(id => !seedIds.has(id))

  if (newIds.length === 0) return SEED_CHANNELS

  // Enrich new channels with names and thumbnails from YouTube
  const meta = await enrichChannels(newIds)

  const dynamicChannels: Channel[] = newIds.map(id => ({
    channelId:    id,
    name:         meta[id]?.name        ?? 'Unknown Channel',
    thumbnailUrl: meta[id]?.thumbnailUrl,
    description:  meta[id]?.description,
    category:     'education', // default — can be updated in seed list later
    isActive:     true,
  }))

  return [...SEED_CHANNELS, ...dynamicChannels]
}

/**
 * Returns a Set of all approved channel IDs — for fast lookup during search filtering.
 */
export async function getApprovedChannelIds(): Promise<Set<string>> {
  const channels = await getApprovedChannels()
  return new Set(channels.map(c => c.channelId))
}
