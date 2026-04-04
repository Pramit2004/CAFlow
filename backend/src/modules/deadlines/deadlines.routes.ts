import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { allRoles } from '../../middleware/rbac.middleware.js'
import {
  getUpcomingDeadlinesHandler,
  getOverdueDeadlinesHandler,
  getDeadlineSummaryHandler,
} from './deadlines.controller.js'

export const deadlineRoutes = new Hono()

deadlineRoutes.use('*', requireAuth)

deadlineRoutes.get('/summary', allRoles, getDeadlineSummaryHandler)
deadlineRoutes.get('/upcoming', allRoles, getUpcomingDeadlinesHandler)
deadlineRoutes.get('/overdue', allRoles, getOverdueDeadlinesHandler)
