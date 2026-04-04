import { z } from 'zod'

export const createInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  caseId: z.string().uuid().optional(),
  description: z.string().optional(),
  subtotal: z.number().positive(),
  gstRate: z.number().min(0).max(100).default(18),
  dueDate: z.string().optional(), // ISO datetime
})

export const updateInvoiceSchema = z.object({
  description: z.string().optional(),
  subtotal: z.number().positive().optional(),
  gstRate: z.number().min(0).max(100).optional(),
  status: z.enum(['draft', 'sent', 'paid', 'cancelled']).optional(),
  dueDate: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
})

export const listInvoicesSchema = z.object({
  clientId: z.string().uuid().optional(),
  caseId: z.string().uuid().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'cancelled']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>
export type ListInvoicesQuery = z.infer<typeof listInvoicesSchema>
