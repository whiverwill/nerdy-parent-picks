import type { Channel } from './types'

// Seed channel list — edit this file or use the admin panel to manage channels
export const SEED_CHANNELS: Channel[] = [
  { channelId: 'UCAcgY29Ow-ggJSldNTTBdZA', name: "NPR's Skunk Bear",    category: 'science'     },
  { channelId: 'UCJbg_yirB5vm9VKn5yLGCKw', name: 'Andymation',           category: 'art'         },
  { channelId: 'UCUHW94eEFW7hkUMVaZz4eDg', name: 'minutephysics',        category: 'science'     },
  { channelId: 'UCAuUUnT6oDeKwE6v1NGQxug', name: 'TED',                  category: 'education'   },
  { channelId: 'UC6uKrU_WqJ1R2HMTY3LIx5Q', name: 'Everyday Astronaut',   category: 'space'       },
  { channelId: 'UCtI0Hodo5o5dUb67FeUjDeA', name: 'SpaceX',               category: 'space'       },
  { channelId: 'UCHnyfMqiRRG1u-2MsSQLbXA', name: 'Veritasium',           category: 'science'     },
  { channelId: 'UCqTVfT9JQqhA6_Hi_h_h97Q', name: 'J Perm',               category: 'puzzles'     },
  { channelId: 'UCoxcjq-8xIDTYp3uz647V5A', name: 'Numberphile',          category: 'math'        },
  { channelId: 'UCwmZiChSryoWQCZMIQezgTg', name: 'BBC Earth',            category: 'nature'      },
  { channelId: 'UClcvOr7LV8tlJwJvkNMmnKg', name: 'Virgin Galactic',      category: 'space'       },
  { channelId: 'UC194cPvPaGJjhJBEGwG6vxg', name: 'OK Go',                category: 'art'         },
  { channelId: 'UCpVm7bg6pXKo1Pr6k5kxG9A', name: 'National Geographic',  category: 'nature'      },
  { channelId: 'UCqa5gDXXxK0M8gr8WadV4yw', name: 'Travel Kids',          category: 'travel'      },
  { channelId: 'UCY1kMZp36IQSyNx_9h4mpCg', name: 'Mark Rober',           category: 'engineering' },
  { channelId: 'UCMOqf8ab-42UUQIdVoKwjlQ', name: 'Practical Engineering', category: 'engineering' },
  // These three need channel ID resolution via the YouTube API on first run:
  // Peekaboo Kidz  — legacy URL: youtube.com/user/Peekaboo
  // Deep Look      — legacy URL: youtube.com/user/KQEDDeepLook
  // TED-Ed         — handle URL: youtube.com/teded
]

// Approved channel IDs as a Set for fast lookup
export const APPROVED_CHANNEL_IDS = new Set(SEED_CHANNELS.map(c => c.channelId))

// Seed picks video (used when no playlist ID is configured)
export const SEED_PICKS = [
  { videoId: 'M8V_glRW1hA', channelName: "NPR's Skunk Bear" },
]
