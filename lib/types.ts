export interface Channel {
  channelId: string
  name: string
  description?: string
  thumbnailUrl?: string
  category: string
  customColor?: string
  isActive?: boolean
}

export interface Video {
  videoId: string
  title: string
  description?: string
  thumbnailUrl: string
  channelId: string
  channelName: string
  publishedAt: string
  embedType?: 'youtube' | 'vimeo' | 'direct'
  sourceUrl?: string
  isPick?: boolean
}

export interface Category {
  id: string
  label: string
  color: string
}

export interface YouTubeSearchResult {
  id: { videoId: string }
  snippet: {
    title: string
    description: string
    channelId: string
    channelTitle: string
    publishedAt: string
    thumbnails: {
      medium?: { url: string }
      high?: { url: string }
      default?: { url: string }
    }
  }
}

export interface YouTubePlaylistItem {
  snippet: {
    title: string
    description: string
    channelId: string
    channelTitle: string
    publishedAt: string
    thumbnails: {
      medium?: { url: string }
      high?: { url: string }
      default?: { url: string }
    }
    resourceId: { videoId: string }
  }
}

export interface YouTubeChannelResult {
  id: string
  snippet: {
    title: string
    description: string
    thumbnails: {
      medium?: { url: string }
      high?: { url: string }
      default?: { url: string }
    }
  }
}
