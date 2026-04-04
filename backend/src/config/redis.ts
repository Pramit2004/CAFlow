import { Redis } from '@upstash/redis'
import { env } from './index.js'

function buildRedisClient(): Redis {
  const rawUrl = env.UPSTASH_REDIS_URL || ''

  // If URL is already REST format (https://), use directly
  if (rawUrl.startsWith('https://')) {
    return new Redis({ url: rawUrl, token: env.UPSTASH_REDIS_TOKEN || '' })
  }

  // Convert rediss://default:TOKEN@HOST:PORT to REST format
  // rediss://default:TOKEN@HOST:6379  →  url=https://HOST  token=TOKEN
  const match = rawUrl.match(/rediss?:\/\/[^:]+:([^@]+)@([^:]+)/)
  if (match) {
    const token = match[1]
    const host = match[2]
    return new Redis({ url: `https://${host}`, token })
  }

  // Fallback: try with whatever we have
  return new Redis({ url: rawUrl, token: env.UPSTASH_REDIS_TOKEN || '' })
}

export const redis = buildRedisClient()
