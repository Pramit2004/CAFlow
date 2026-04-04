import { Hono } from 'hono'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { allRoles } from '../../middleware/rbac.middleware.js'
import {
  listNotificationsHandler,
  getUnreadCountHandler,
  markAsReadHandler,
  markAllAsReadHandler,
} from './notifications.controller.js'

export const notificationRoutes = new Hono()

notificationRoutes.use('*', requireAuth)

notificationRoutes.get('/', allRoles, listNotificationsHandler)
notificationRoutes.get('/unread-count', allRoles, getUnreadCountHandler)
notificationRoutes.patch('/mark-all-read', allRoles, markAllAsReadHandler)
notificationRoutes.patch('/:id/read', allRoles, markAsReadHandler)
