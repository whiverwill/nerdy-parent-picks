/**
 * Vercel KV helpers for dynamic channel management and video blacklisting.
 * Degrades gracefully when KV is not yet configured.
 */
import { createClient } from '@vercel/kv'

// Support both Vercel KV (KV_REST_API_*) and Upstash marketplace (UPSTASH_REDIS_REST_*)
const kvUrl   = process.env.KV_REST_API_URL   ?? process.env.UPSTASH_REDIS_REST_URL
const kvToken = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN

const kv = kvUrl && kvToken ? createClient({ url: kvUrl, token: kvToken }) : null

// ─── Key names ────────────────────────────────────────────────────────────────
const KEYS = {
  dynamicChannels:    'channels:dynamic',      // Set<channelId>
  removedChannels:    'channels:removed',      // Set<channelId>
  ageRestrictedChannels: 'channels:age-restricted', // Set<channelId>
  blacklistedVideos:  'videos:blacklisted',    // Hash<videoId → JSON BlacklistedVideo>
  adminPicks:         'picks:videos',          // Hash<videoId → JSON AdminPick>
} as const

export function isKvConfigured(): boolean {
  return kv !== null
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface BlacklistedVideo {
  videoId:      string
  title:        string
  thumbnailUrl: string
  addedAt:      string
}

export interface AdminPick {
  videoId:      string
  title:        string
  thumbnailUrl: string
  channelId:    string
  channelName:  string
  addedAt:      string
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function getDynamicChannelIds(): Promise<string[]> {
  if (!kv) return []
  try {
    return (await kv.smembers(KEYS.dynamicChannels)) as string[]
  } catch { return [] }
}

export async function getRemovedChannelIds(): Promise<Set<string>> {
  if (!kv) return new Set()
  try {
    return new Set((await kv.smembers(KEYS.removedChannels)) as string[])
  } catch { return new Set() }
}

export async function getBlacklistedVideoIds(): Promise<Set<string>> {
  if (!kv) return new Set()
  try {
    return new Set(await kv.hkeys(KEYS.blacklistedVideos))
  } catch { return new Set() }
}

export async function getBlacklistedVideos(): Promise<BlacklistedVideo[]> {
  if (!kv) return []
  try {
    const hash = await kv.hgetall(KEYS.blacklistedVideos)
    if (!hash) return []
    return Object.values(hash).map(v => JSON.parse(v as string)) as BlacklistedVideo[]
  } catch { return [] }
}

export async function getAgeRestrictedChannelIds(): Promise<Set<string>> {
  if (!kv) return new Set()
  try {
    return new Set((await kv.smembers(KEYS.ageRestrictedChannels)) as string[])
  } catch { return new Set() }
}

export async function setAgeRestriction(channelId: string, restricted: boolean): Promise<void> {
  if (!kv) throw new Error('KV not configured')
  if (restricted) {
    await kv.sadd(KEYS.ageRestrictedChannels, channelId)
  } else {
    await kv.srem(KEYS.ageRestrictedChannels, channelId)
  }
}

export async function getAdminPicks(): Promise<AdminPick[]> {
  if (!kv) return []
  try {
    const hash = await kv.hgetall(KEYS.adminPicks)
    if (!hash) return []
    const picks = Object.values(hash).map(v => JSON.parse(v as string)) as AdminPick[]
    return picks.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
  } catch { return [] }
}

// ─── Channel mutations ────────────────────────────────────────────────────────

export async function addDynamicChannel(channelId: string): Promise<void> {
  if (!kv) throw new Error('KV not configured')
  await kv.sadd(KEYS.dynamicChannels, channelId)
  await kv.srem(KEYS.removedChannels, channelId)
}

export async function removeChannel(channelId: string): Promise<void> {
  if (!kv) throw new Error('KV not configured')
  await kv.sadd(KEYS.removedChannels, channelId)
  await kv.srem(KEYS.dynamicChannels, channelId)
}

// ─── Video blacklist mutations ─────────────────────────────────────────────────

export async function blacklistVideo(video: BlacklistedVideo): Promise<void> {
  if (!kv) throw new Error('KV not configured')
  await kv.hset(KEYS.blacklistedVideos, {
    [video.videoId]: JSON.stringify(video),
  })
}

export async function unblacklistVideo(videoId: string): Promise<void> {
  if (!kv) throw new Error('KV not configured')
  await kv.hdel(KEYS.blacklistedVideos, videoId)
}

// ─── Picks mutations ──────────────────────────────────────────────────────────

export async function addAdminPick(pick: AdminPick): Promise<void> {
  if (!kv) throw new Error('KV not configured')
  await kv.hset(KEYS.adminPicks, { [pick.videoId]: JSON.stringify(pick) })
}

export async function removeAdminPick(videoId: string): Promise<void> {
  if (!kv) throw new Error('KV not configured')
  await kv.hdel(KEYS.adminPicks, videoId)
}
