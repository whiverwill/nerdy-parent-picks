import type { NextRequest } from 'next/server'

/**
 * POST /api/add
 * Called by the iOS Share Sheet Siri Shortcut.
 * Body: { url: string, token: string }
 *
 * For V1, this logs the submission and returns success.
 * V2 will write to the database.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.ADD_SECRET_TOKEN
  if (!secret) {
    return Response.json({ error: 'ADD_SECRET_TOKEN not configured' }, { status: 500 })
  }

  let body: { url?: string; token?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (body.token !== secret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = body.url?.trim()
  if (!url) {
    return Response.json({ error: 'Missing url' }, { status: 400 })
  }

  // Parse what was submitted
  const parsed = parseYouTubeUrl(url)

  console.log('[/api/add] Received submission:', parsed)

  // V2: save to database here
  return Response.json({
    ok: true,
    message: 'Received! (V2 will save to database)',
    parsed,
  })
}

function parseYouTubeUrl(url: string) {
  try {
    const u = new URL(url)
    // Video: youtube.com/watch?v=XXX or youtu.be/XXX
    const videoId = u.searchParams.get('v') ?? (u.hostname === 'youtu.be' ? u.pathname.slice(1) : null)
    if (videoId) return { type: 'video', videoId, url }

    // Channel: youtube.com/channel/UCxxx or youtube.com/@handle
    const channelMatch = u.pathname.match(/\/channel\/(UC[\w-]+)/)
    if (channelMatch) return { type: 'channel', channelId: channelMatch[1], url }

    const handleMatch = u.pathname.match(/\/@([\w-]+)/)
    if (handleMatch) return { type: 'channel', handle: handleMatch[1], url }

    return { type: 'unknown', url }
  } catch {
    return { type: 'unknown', url }
  }
}
