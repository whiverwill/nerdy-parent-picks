'use client'

import { useEffect, useRef } from 'react'

interface Props {
  videoId: string
}

/**
 * Client component wrapper for the YouTube iframe.
 * The useEffect cleanup clears the iframe src when the component unmounts
 * (i.e. the user navigates away), which stops audio playback immediately.
 * Without this, Next.js client-side navigation leaves the iframe alive
 * in memory and audio continues in the background.
 */
export default function VideoPlayer({ videoId }: Props) {
  const ref = useRef<HTMLIFrameElement>(null)

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
      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full"
    />
  )
}
