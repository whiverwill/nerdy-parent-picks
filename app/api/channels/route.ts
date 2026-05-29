import { SEED_CHANNELS } from '@/lib/channels-data'

export async function GET() {
  return Response.json({ channels: SEED_CHANNELS })
}
