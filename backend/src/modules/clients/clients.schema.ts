import { z } from 'zod'
import { indianPhoneSchema, panSchema, gstinSchema, paginationSchema } from '../../lib/validators.js'

export const createClientSchema = z.object({
  name: z.string().min(2).max(255),
  phone: indianPhoneSchema,
  email: z.string().email().optional(),
  pan: panSchema,
  aadhaarLast4: z.string().length(4).optional(),
  gstin: gstinSchema,
  dob: z.string().date().optional(),
  entityType: z.enum(['individual', 'huf', 'partnership', 'llp', 'pvt_ltd', 'public_ltd', 'trust', 'other']).optional(),
  businessName: z.string().max(255).optional(),
  spousePan: panSchema,
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  preferredLanguage: z.enum(['en', 'gu', 'hi']).default('en'),
  assignedTo: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
})

export const updateClientSchema = createClientSchema.partial()

export const listClientsSchema = paginationSchema.extend({
  search: z.string().optional(),
  tag: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  city: z.string().optional(),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ListClientsQuery = z.infer<typeof listClientsSchema>
