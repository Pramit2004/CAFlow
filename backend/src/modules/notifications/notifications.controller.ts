import type { Context } from 'hono'
import { listNotificationsSchema } from './notifications.schema.js'
import * as notificationService from './notifications.service.js'
import { ok, noContent, paginate } from '../../lib/response.js'

export async function listNotificationsHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const userId = c.get('userId')
  const query = listNotificationsSchema.parse(c.req.query())
  const { rows, total } = await notificationService.listNotifications(workspaceId, userId, query)
  return paginate(c, rows, total, query.page, query.limit)
}

export async function getUnreadCountHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const userId = c.get('userId')
  const count = await notificationService.getUnreadCount(workspaceId, userId)
  return ok(c, { count })
}

export async function markAsReadHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const userId = c.get('userId')
  const { id } = c.req.param()
  await notificationService.markAsRead(workspaceId, userId, id)
  return noContent(c)
}

export async function markAllAsReadHandler(c: Context) {
  const workspaceId = c.get('workspaceId')
  const userId = c.get('userId')
  await notificationService.markAllAsRead(workspaceId, userId)
  return noContent(c)
}
