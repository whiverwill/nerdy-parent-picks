import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    // Thumbnails are already-optimized YouTube JPEGs served at the right size.
    // Routing them through Vercel's image optimizer adds no value and exhausts
    // the optimization quota, which makes /_next/image return 402 and breaks
    // every uncached thumbnail. Serve them as-is.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'yt3.ggpht.com' },
      { protocol: 'https', hostname: 'yt3.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Allow YouTube embeds but block navigation to full YouTube
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://i.ytimg.com https://yt3.ggpht.com https://yt3.googleusercontent.com",
              "frame-src https://www.youtube-nocookie.com",
              "connect-src 'self' https://www.googleapis.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
