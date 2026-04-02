import { pgTable, uuid, varchar, text, pgEnum, timestamp, boolean } from 'drizzle-orm/pg-core'

export const planEnum = pgEnum('plan', ['starter', 'growth', 'pro'])
export const planStatusEnum = pgEnum('plan_status', ['trialing', 'active', 'past_due', 'canceled'])

export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  icaiNumber: varchar('icai_number', { length: 50 }),
  gstin: varchar('gstin', { length: 15 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  address: text('address'),
  pincode: varchar('pincode', { length: 10 }),
  phone: varchar('phone', { length: 15 }),
  email: varchar('email', { length: 255 }),
  logoUrl: text('logo_url'),
  plan: planEnum('plan').notNull().default('starter'),
  planStatus: planStatusEnum('plan_status').notNull().default('trialing'),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  razorpayCustomerId: varchar('razorpay_customer_id', { length: 100 }),
  razorpaySubscriptionId: varchar('razorpay_subscription_id', { length: 100 }),
  storageUsedBytes: text('storage_used_bytes').default('0'),
  isActive: boolean('is_active').notNull().default(true),
  defaultLanguage: varchar('default_language', { length: 5 }).notNull().default('en'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Workspace = typeof workspaces.$inferSelect
export type NewWorkspace = typeof workspaces.$inferInsert
