/**
 * Vercel KV helpers for dynamic channel management and video blacklisting.
 * Degrades gracefully when KV is not yet configured.
 */
import { kv } from '@vercel/kv'

// ─── Key names ────────────────────────────────────────────────────────────────
const KEYS = {
  dynamicChannels:   'channels:dynamic',   // Set<channelId>
  removedChannels:   'channels:removed',   // Set<channelId>
  blacklistedVideos: 'videos:blacklisted', // Hash<videoId → JSON BlacklistedVideo>
} as const

export function isKvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BlacklistedVideo {
  videoId:      string
  title:        string
  thumbnailUrl: string
  addedAt:      string
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function getDynamicChannelIds(): Promise<string[]> {
  if (!isKvConfigured()) return []
  try {
    return (await kv.smembers(KEYS.dynamicChannels)) as string[]
  } catch { return [] }
}

export async function getRemovedChannelIds(): Promise<Set<string>> {
  if (!isKvConfigured()) return new Set()
  try {
    return new Set((await kv.smembers(KEYS.removedChannels)) as string[])
  } catch { return new Set() }
}

export async function getBlacklistedVideoIds(): Promise<Set<string>> {
  if (!isKvConfigured()) return new Set()
  try {
    return new Set(await kv.hkeys(KEYS.blacklistedVideos))
  } catch { return new Set() }
}

export async function getBlacklistedVideos(): Promise<BlacklistedVideo[]> {
  if (!isKvConfigured()) return []
  try {
    const hash = await kv.hgetall(KEYS.blacklistedVideos)
    if (!hash) return []
    return Object.values(hash).map(v => JSON.parse(v as string)) as BlacklistedVideo[]
  } catch { return [] }
}

// ─── Channel mutations ────────────────────────────────────────────────────────

export async function addDynamicChannel(channelId: string): Promise<void> {
  await kv.sadd(KEYS.dynamicChannels, channelId)
  await kv.srem(KEYS.removedChannels, channelId) // un-remove if it was hidden
}

export async function removeChannel(channelId: string): Promise<void> {
  await kv.sadd(KEYS.removedChannels, channelId)
  await kv.srem(KEYS.dynamicChannels, channelId) // remove from dynamic set too
}

// ─── Video blacklist mutations ─────────────────────────────────────────────────

export async function blacklistVideo(video: BlacklistedVideo): Promise<void> {
  await kv.hset(KEYS.blacklistedVideos, {
    [video.videoId]: JSON.stringify(video),
  })
}

export async function unblacklistVideo(videoId: string): Promise<void> {
  await kv.hdel(KEYS.blacklistedVideos, videoId)
}
