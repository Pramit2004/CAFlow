import { pgTable, uuid, varchar, text, pgEnum, timestamp, date } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'
import { cases } from './cases.js'
import { users } from './users.js'

export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done'])
export const taskTypeEnum = pgEnum('task_type', [
  'todo',
  'call_client',
  'internal_review',
  'waiting_client',
  'waiting_govt',
])

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),

  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: taskTypeEnum('type').notNull().default('todo'),
  status: taskStatusEnum('status').notNull().default('todo'),
  dueDate: date('due_date'),

  completedAt: timestamp('completed_at', { withTimezone: true }),
  completedBy: uuid('completed_by').references(() => users.id, { onDelete: 'set null' }),

  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert
