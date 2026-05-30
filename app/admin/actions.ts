'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { updateTag } from 'next/cache'
import { resolveChannelId, getVideosByIds } from '@/lib/youtube'
import {
  addDynamicChannel,
  removeChannel,
  setAgeRestriction,
  blacklistVideo,
  unblacklistVideo,
  addAdminPick,
  removeAdminPick,
} from '@/lib/kv'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(formData: FormData) {
  const token    = formData.get('token') as string
  const secret   = process.env.ADD_SECRET_TOKEN
  if (!secret || token !== secret) {
    redirect('/admin?error=wrong-password')
  }
  const jar = await cookies()
  jar.set('admin_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   60 * 60 * 24 * 30, // 30 days
    path:     '/',
  })
  redirect('/admin')
}

export async function logout() {
  const jar = await cookies()
  jar.delete('admin_token')
  redirect('/admin')
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function requireAdmin() {
  const jar    = await cookies()
  const token  = jar.get('admin_token')?.value
  const secret = process.env.ADD_SECRET_TOKEN
  if (!secret || token !== secret) redirect('/admin?error=unauthorized')
}

// ─── URL parser (shared with /api/add) ────────────────────────────────────────

function parseYouTubeUrl(url: string) {
  try {
    const u = new URL(url.trim())
    const videoId = u.searchParams.get('v') ??
      (u.hostname === 'youtu.be' ? u.pathname.slice(1) : null)
    if (videoId) return { type: 'video' as const, videoId }

    const channelMatch = u.pathname.match(/\/channel\/(UC[\w-]+)/)
    if (channelMatch) return { type: 'channel' as const, channelId: channelMatch[1] }

    const handleMatch = u.pathname.match(/\/@([\w.-]+)/)
    if (handleMatch) return { type: 'handle' as const, handle: handleMatch[1] }

    return { type: 'unknown' as const }
  } catch {
    return { type: 'unknown' as const }
  }
}

// ─── Channel actions ──────────────────────────────────────────────────────────

export async function addChannel(formData: FormData) {
  await requireAdmin()

  const url    = formData.get('url') as string
  const parsed = parseYouTubeUrl(url ?? '')

  let channelId: string | null = null

  if (parsed.type === 'channel') {
    channelId = parsed.channelId
  } else if (parsed.type === 'handle') {
    channelId = await resolveChannelId(parsed.handle)
  } else if (parsed.type === 'video') {
    // Resolve the channel that owns this video
    const meta = await getVideosByIds([parsed.videoId])
    channelId = meta[parsed.videoId]?.channelId ?? null
  }

  if (!channelId) {
    redirect('/admin?error=unresolved-channel')
  }

  await addDynamicChannel(channelId)
  updateTag('channels')
  redirect('/admin?success=channel-added')
}

export async function toggleAgeRestriction(formData: FormData) {
  await requireAdmin()
  const channelId = formData.get('channelId') as string
  const restricted = formData.get('restricted') === 'true'
  if (!channelId) redirect('/admin')
  await setAgeRestriction(channelId, restricted)
  updateTag('channels')
  redirect('/admin')
}

export async function deleteChannel(formData: FormData) {
  await requireAdmin()
  const channelId = formData.get('channelId') as string
  if (!channelId) redirect('/admin')
  await removeChannel(channelId)
  updateTag('channels')
  redirect('/admin?success=channel-removed')
}

// ─── Video blacklist actions ──────────────────────────────────────────────────

export async function addToBlacklist(formData: FormData) {
  await requireAdmin()

  const url    = formData.get('url') as string
  const parsed = parseYouTubeUrl(url ?? '')

  if (parsed.type !== 'video') {
    redirect('/admin?error=not-a-video')
  }

  // Fetch title + thumbnail so we can display it in the admin list
  const meta = await getVideosByIds([parsed.videoId])
  const info = meta[parsed.videoId]

  await blacklistVideo({
    videoId:      parsed.videoId,
    title:        info?.title        ?? 'Unknown Video',
    thumbnailUrl: info?.thumbnailUrl ?? '',
    addedAt:      new Date().toISOString(),
  })
  updateTag('videos')
  redirect('/admin?success=video-blocked')
}

export async function removeFromBlacklist(formData: FormData) {
  await requireAdmin()
  const videoId = formData.get('videoId') as string
  if (!videoId) redirect('/admin')
  await unblacklistVideo(videoId)
  updateTag('videos')
  redirect('/admin?success=video-unblocked')
}

// ─── Picks actions ────────────────────────────────────────────────────────────

export async function addPick(formData: FormData) {
  await requireAdmin()

  const url    = formData.get('url') as string
  const parsed = parseYouTubeUrl(url ?? '')

  if (parsed.type !== 'video') {
    redirect('/admin?error=not-a-video')
  }

  const meta = await getVideosByIds([parsed.videoId])
  const info = meta[parsed.videoId]

  await addAdminPick({
    videoId:      parsed.videoId,
    title:        info?.title        ?? 'Unknown Video',
    thumbnailUrl: info?.thumbnailUrl ?? '',
    channelId:    info?.channelId    ?? '',
    channelName:  info?.channelName  ?? '',
    addedAt:      new Date().toISOString(),
  })
  updateTag('picks')
  redirect('/admin?success=pick-added')
}

export async function removePick(formData: FormData) {
  await requireAdmin()
  const videoId = formData.get('videoId') as string
  if (!videoId) redirect('/admin')
  await removeAdminPick(videoId)
  updateTag('picks')
  redirect('/admin?success=pick-removed')
}
