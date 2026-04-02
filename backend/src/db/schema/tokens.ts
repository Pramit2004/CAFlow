import { pgTable, varchar, uuid, pgEnum, timestamp, integer } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'
import { clients } from './clients.js'
import { cases } from './cases.js'

export const tokenPurposeEnum = pgEnum('token_purpose', [
  'upload',
  'download',
  'onboarding',
])

export const clientTokens = pgTable('client_tokens', {
  token: varchar('token', { length: 64 }).primaryKey(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  caseId: uuid('case_id').references(() => cases.id, { onDelete: 'cascade' }),
  purpose: tokenPurposeEnum('purpose').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedCount: integer('used_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ClientToken = typeof clientTokens.$inferSelect
export type NewClientToken = typeof clientTokens.$inferInsert
