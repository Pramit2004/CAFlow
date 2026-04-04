import type { MiddlewareHandler } from 'hono'
import { verify } from 'hono/jwt'
import { env } from '../config/index.js'
import { unauthorized } from '../lib/response.js'

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return unauthorized(c, 'Missing authorization header')
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = await verify(token, env.TOKEN_SECRET, 'HS256') as {
      sub: string
      workspaceId: string
      role: string
      purpose?: string
    }

    if (payload.purpose === 'onboarding') {
      return unauthorized(c, 'Please complete onboarding first')
    }

    c.set('userId', payload.sub)
    c.set('workspaceId', payload.workspaceId)
    c.set('role', payload.role as import('../types/hono.types.js').UserRole)

    await next()
  } catch {
    return unauthorized(c, 'Invalid or expired token')
  }
}

// Alias for backward compat
export const requireAuth = authMiddleware
