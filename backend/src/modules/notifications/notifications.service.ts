import { eq, and, desc, count } from 'drizzle-orm'
import { db } from '../../config/database.js'
import { notifications, users } from '../../db/schema/index.js'
import type { CreateNotificationInput, ListNotificationsQuery } from './notifications.schema.js'

// ──────────────────────────────────────────────────
// List notifications for a user
// ──────────────────────────────────────────────────
export async function listNotifications(
  workspaceId: string,
  userId: string,
  query: ListNotificationsQuery,
) {
  const { page, limit, unreadOnly } = query
  const offset = (page - 1) * limit

  const conditions: ReturnType<typeof eq>[] = [
    eq(notifications.workspaceId, workspaceId),
    eq(notifications.userId, userId),
  ]
  if (unreadOnly) conditions.push(eq(notifications.isRead, false))

  const where = and(...conditions)

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(where)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(notifications).where(where),
  ])

  return { rows, total: Number(total) }
}

// ──────────────────────────────────────────────────
// Unread count
// ──────────────────────────────────────────────────
export async function getUnreadCount(workspaceId: string, userId: string) {
  const [{ value }] = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(
        eq(notifications.workspaceId, workspaceId),
        eq(notifications.userId, userId),
        eq(notifications.isRead, false),
      ),
    )
  return Number(value)
}

// ──────────────────────────────────────────────────
// Mark single notification as read
// ──────────────────────────────────────────────────
export async function markAsRead(workspaceId: string, userId: string, notificationId: string) {
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.workspaceId, workspaceId),
        eq(notifications.userId, userId),
      ),
    )
}

// ──────────────────────────────────────────────────
// Mark all notifications as read
// ──────────────────────────────────────────────────
export async function markAllAsRead(workspaceId: string, userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(
      and(
        eq(notifications.workspaceId, workspaceId),
        eq(notifications.userId, userId),
        eq(notifications.isRead, false),
      ),
    )
}

// ──────────────────────────────────────────────────
// Create notification (internal helper used by other services)
// ──────────────────────────────────────────────────
export async function createNotification(
  workspaceId: string,
  data: CreateNotificationInput,
) {
  if (data.userId) {
    const [notification] = await db
      .insert(notifications)
      .values({
        workspaceId,
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        meta: data.meta,
      })
      .returning()
    return [notification]
  }

  // Fan out to all active workspace users
  const members = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.workspaceId, workspaceId), eq(users.isActive, true)))

  if (members.length === 0) return []

  const inserted = await db
    .insert(notifications)
    .values(
      members.map((m) => ({
        workspaceId,
        userId: m.id,
        type: data.type,
        title: data.title,
        body: data.body,
        meta: data.meta,
      })),
    )
    .returning()

  return inserted
}
