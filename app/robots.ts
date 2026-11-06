import type { MetadataRoute } from 'next'

// The app is members-only (family code gate) — keep it out of search indexes.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  }
}
