import { pgTable, uuid, varchar, text, pgEnum, timestamp, numeric, integer } from 'drizzle-orm/pg-core'
import { workspaces } from './workspaces.js'
import { cases } from './cases.js'
import { clients } from './clients.js'

export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'sent', 'paid', 'cancelled'])

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  caseId: uuid('case_id').references(() => cases.id, { onDelete: 'set null' }),
  clientId: uuid('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),

  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  description: text('description'),

  // Amounts
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  gstRate: numeric('gst_rate', { precision: 5, scale: 2 }).default('18.00'),
  gstAmount: numeric('gst_amount', { precision: 10, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),

  status: invoiceStatusEnum('status').notNull().default('draft'),

  // Razorpay
  razorpayPaymentLinkId: varchar('razorpay_payment_link_id', { length: 100 }),
  razorpayPaymentLinkUrl: text('razorpay_payment_link_url'),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 100 }),

  // Dates
  issuedAt: timestamp('issued_at', { withTimezone: true }),
  dueDate: timestamp('due_date', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),

  // Sequence number for workspace
  sequenceNumber: integer('sequence_number').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
