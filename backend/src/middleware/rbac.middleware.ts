import type { MiddlewareHandler } from 'hono'
import type { UserRole } from '../types/hono.types.js'
import { forbidden } from '../lib/response.js'

// Role hierarchy: owner > manager > staff
const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 3,
  manager: 2,
  staff: 1,
}

/**
 * Require a minimum role level.
 * requireRole('manager') allows owner + manager but blocks staff.
 */
export const requireRole = (...allowedRoles: UserRole[]): MiddlewareHandler => {
  return async (c, next) => {
    const user = c.get('user')

    if (!user) {
      return forbidden(c, 'No user in context')
    }

    const userLevel = ROLE_HIERARCHY[user.role as UserRole] ?? 0
    const minRequired = Math.min(...allowedRoles.map((r) => ROLE_HIERARCHY[r]))

    if (userLevel < minRequired) {
      return forbidden(c, `Requires role: ${allowedRoles.join(' or ')}`)
    }

    await next()
  }
}

export const ownerOnly = requireRole('owner')
export const managerAndAbove = requireRole('manager', 'owner')
export const allRoles = requireRole('staff', 'manager', 'owner')
