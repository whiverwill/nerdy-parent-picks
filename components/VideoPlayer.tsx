'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface Props {
  videoId: string
}

const buildSrc = (videoId: string) =>
  `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`

/**
 * Client component wrapper for the YouTube iframe.
 *
 * On back/forward navigation, Next.js's router cache can keep this
 * component mounted-but-hidden instead of unmounting it, so the unmount
 * cleanup alone doesn't fire and the iframe keeps playing audio off-screen.
 * We watch the pathname directly (which updates even for a cached, hidden
 * instance) and clear/restore the iframe src to match whether this video's
 * watch page is actually the active route.
 */
export default function VideoPlayer({ videoId }: Props) {
  const ref = useRef<HTMLIFrameElement>(null)
  const pathname = usePathname()
  const isActive = pathname === `/watch/${videoId}`

  useEffect(() => {
    if (!ref.current) return
    ref.current.src = isActive ? buildSrc(videoId) : ''
  }, [isActive, videoId])

  useEffect(() => {
    return () => {
      // Clearing src is the reliable cross-browser way to stop an iframe's media
      if (ref.current) {
        ref.current.src = ''
      }
    }
  }, [])

  return (
    <iframe
      ref={ref}
      src={buildSrc(videoId)}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full"
    />
  )
}
