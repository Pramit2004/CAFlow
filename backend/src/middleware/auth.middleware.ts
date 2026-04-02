import type { MiddlewareHandler } from 'hono'
import { createClerkClient } from '@clerk/backend'
import { env } from '../config/index.js'
import { unauthorized } from '../lib/response.js'
import { db } from '../config/database.js'
import { users } from '../db/schema/index.js'
import { eq } from 'drizzle-orm'

const clerk = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return unauthorized(c, 'Missing authorization header')
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = await clerk.verifyToken(token)

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, payload.sub),
      with: { workspace: true } as never,
    })

    if (!user || !user.isActive) {
      return unauthorized(c, 'User not found or inactive')
    }

    // Inject into context
    c.set('user', user)
    c.set('workspaceId', user.workspaceId)

    await next()
  } catch {
    return unauthorized(c, 'Invalid or expired token')
  }
}
