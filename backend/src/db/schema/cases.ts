import { pgTable, uuid, varchar, text, pgEnum, timestamp, date, numeric } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'
import { clients } from './clients.js'
import { users } from './users.js'

export const serviceTypeEnum = pgEnum('service_type', [
  'ITR',
  'GST',
  'TDS',
  'ROC',
  'AUDIT',
  'ADVANCE_TAX',
  'OTHER',
])

export const caseStatusEnum = pgEnum('case_status', [
  'DOCUMENTS_PENDING',
  'DOCS_RECEIVED',
  'UNDER_PREPARATION',
  'FILED',
  'COMPLETE',
])

export const cases = pgTable('cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),

  title: varchar('title', { length: 255 }).notNull(),
  serviceType: serviceTypeEnum('service_type').notNull(),
  financialYear: varchar('financial_year', { length: 10 }),
  status: caseStatusEnum('status').notNull().default('DOCUMENTS_PENDING'),
  deadline: date('deadline'),
  description: text('description'),

  // Fee tracking (internal only)
  feeQuoted: numeric('fee_quoted', { precision: 10, scale: 2 }),
  feeBilled: numeric('fee_billed', { precision: 10, scale: 2 }),
  feeReceived: numeric('fee_received', { precision: 10, scale: 2 }),

  // Source case for duplication
  sourceCaseId: uuid('source_case_id'),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
})

export type Case = typeof cases.$inferSelect
export type NewCase = typeof cases.$inferInsert
