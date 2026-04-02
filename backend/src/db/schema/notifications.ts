import { pgTable, uuid, varchar, text, pgEnum, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'
import { users } from './users.js'

export const notificationTypeEnum = pgEnum('notification_type', [
  'document_uploaded',
  'document_rejected',
  'case_status_changed',
  'deadline_approaching',
  'payment_received',
  'task_assigned',
  'team_invite',
  'reminder_sent',
])

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),

  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body'),
  meta: jsonb('meta'),

  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
