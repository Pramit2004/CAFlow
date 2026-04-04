import { Redis } from '@upstash/redis'
import { env } from './index.js'

function buildRedisClient(): Redis {
  const rawUrl = env.UPSTASH_REDIS_URL || ''

  const opts = { automaticDeserialization: false } as const

  // If URL is already REST format (https://), use directly
  if (rawUrl.startsWith('https://')) {
    return new Redis({ url: rawUrl, token: env.UPSTASH_REDIS_TOKEN || '', ...opts })
  }

  // Convert rediss://default:TOKEN@HOST:PORT to REST format
  // rediss://default:TOKEN@HOST:6379  →  url=https://HOST  token=TOKEN
  const match = rawUrl.match(/rediss?:\/\/[^:]+:([^@]+)@([^:]+)/)
  if (match) {
    const token = match[1]
    const host = match[2]
    return new Redis({ url: `https://${host}`, token, ...opts })
  }

  // Fallback: try with whatever we have
  return new Redis({ url: rawUrl, token: env.UPSTASH_REDIS_TOKEN || '', ...opts })
}

export const redis = buildRedisClient()
