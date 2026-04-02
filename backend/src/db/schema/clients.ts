import { pgTable, uuid, varchar, text, pgEnum, timestamp, date } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'
import { users } from './users.js'

export const clientLanguageEnum = pgEnum('client_language', ['en', 'gu', 'hi'])
export const entityTypeEnum = pgEnum('entity_type', [
  'individual',
  'huf',
  'partnership',
  'llp',
  'pvt_ltd',
  'public_ltd',
  'trust',
  'other',
])

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),

  // Identity
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 15 }).notNull(),
  email: varchar('email', { length: 255 }),
  dob: date('dob'),

  // Tax IDs
  pan: varchar('pan', { length: 10 }),
  aadhaarLast4: varchar('aadhaar_last4', { length: 4 }),
  gstin: varchar('gstin', { length: 15 }),

  // Business
  entityType: entityTypeEnum('entity_type').default('individual'),
  businessName: varchar('business_name', { length: 255 }),
  turnoverRange: varchar('turnover_range', { length: 50 }),

  // Family
  spousePan: varchar('spouse_pan', { length: 10 }),
  hufDetails: text('huf_details'),

  // Address
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  pincode: varchar('pincode', { length: 10 }),

  // Preferences
  preferredLanguage: clientLanguageEnum('preferred_language').notNull().default('en'),
  tags: text('tags').array().default([]),
  notes: text('notes'),

  // Meta
  clientSince: date('client_since'),
  isActive: varchar('is_active', { length: 5 }).default('true'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Client = typeof clients.$inferSelect
export type NewClient = typeof clients.$inferInsert
