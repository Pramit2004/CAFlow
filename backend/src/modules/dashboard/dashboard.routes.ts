import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { allRoles } from '../../middleware/rbac.middleware.js'
import { getDashboardData } from './dashboard.service.js'
import { ok } from '../../lib/response.js'

export const dashboardRoutes = new Hono()

dashboardRoutes.use('*', requireAuth)

dashboardRoutes.get('/', allRoles, async (c) => {
  const workspaceId = c.get('workspaceId')
  const userId = c.get('userId')
  const data = await getDashboardData(workspaceId, userId)
  return ok(c, data)
})
