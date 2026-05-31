'use client'

import { useEffect } from 'react'
import { markWatched } from '@/lib/watched'

/**
 * Renders nothing — just records the video as watched in localStorage
 * as soon as the watch page mounts.
 */
export default function WatchedTracker({ videoId }: { videoId: string }) {
  useEffect(() => {
    markWatched(videoId)
  }, [videoId])
  return null
}
