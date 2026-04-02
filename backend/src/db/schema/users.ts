import { pgTable, uuid, varchar, pgEnum, timestamp, boolean } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'

export const userRoleEnum = pgEnum('user_role', ['owner', 'manager', 'staff'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 15 }),
  role: userRoleEnum('role').notNull().default('staff'),
  isActive: boolean('is_active').notNull().default(true),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
