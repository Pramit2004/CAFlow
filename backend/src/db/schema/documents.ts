import { pgTable, uuid, varchar, text, pgEnum, timestamp, integer, boolean } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'
import { cases } from './cases.js'
import { users } from './users.js'

export const documentStatusEnum = pgEnum('document_status', [
  'PENDING',
  'UPLOADED',
  'ACCEPTED',
  'REJECTED',
  'RESUBMIT',
])

export const documentDirectionEnum = pgEnum('document_direction', [
  'inbound',   // Client → CA
  'outbound',  // CA → Client
])

export const documentRejectionReasonEnum = pgEnum('document_rejection_reason', [
  'blurry',
  'wrong_document',
  'wrong_year',
  'password_protected',
  'incomplete',
  'other',
])

export const caseDocuments = pgTable('case_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseId: uuid('case_id').notNull().references(() => cases.id, { onDelete: 'cascade' }),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),

  label: varchar('label', { length: 255 }).notNull(),
  status: documentStatusEnum('status').notNull().default('PENDING'),
  direction: documentDirectionEnum('direction').notNull().default('inbound'),
  isRequired: boolean('is_required').notNull().default(true),
  sortOrder: integer('sort_order').default(0),

  // Storage
  fileKey: text('file_key'),           // R2 object key
  fileName: varchar('file_name', { length: 255 }),
  fileMimeType: varchar('file_mime_type', { length: 100 }),
  fileSizeBytes: integer('file_size_bytes'),

  // Review
  rejectionReason: documentRejectionReasonEnum('rejection_reason'),
  rejectionNote: text('rejection_note'),
  verifiedBy: uuid('verified_by').references(() => users.id, { onDelete: 'set null' }),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),

  // Upload info
  uploadedBy: varchar('uploaded_by', { length: 50 }), // 'client' | userId
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type CaseDocument = typeof caseDocuments.$inferSelect
export type NewCaseDocument = typeof caseDocuments.$inferInsert
