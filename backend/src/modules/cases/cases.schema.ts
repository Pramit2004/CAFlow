import { z } from 'zod'
import { paginationSchema, financialYearSchema, uuidSchema } from '../../lib/validators.js'

export const createCaseSchema = z.object({
  clientId: uuidSchema,
  title: z.string().min(2).max(255),
  serviceType: z.enum(['ITR', 'GST', 'TDS', 'ROC', 'AUDIT', 'ADVANCE_TAX', 'OTHER']),
  financialYear: financialYearSchema,
  deadline: z.string().date().optional(),
  description: z.string().optional(),
  assignedTo: uuidSchema.optional(),
  feeQuoted: z.number().positive().optional(),
})

export const updateCaseSchema = createCaseSchema.partial().extend({
  status: z.enum([
    'DOCUMENTS_PENDING', 'DOCS_RECEIVED', 'UNDER_PREPARATION', 'FILED', 'COMPLETE',
  ]).optional(),
  feeQuoted: z.number().nonnegative().optional(),
  feeBilled: z.number().nonnegative().optional(),
  feeReceived: z.number().nonnegative().optional(),
})

export const moveCaseSchema = z.object({
  status: z.enum([
    'DOCUMENTS_PENDING', 'DOCS_RECEIVED', 'UNDER_PREPARATION', 'FILED', 'COMPLETE',
  ]),
})

export const listCasesSchema = paginationSchema.extend({
  status: z.enum([
    'DOCUMENTS_PENDING', 'DOCS_RECEIVED', 'UNDER_PREPARATION', 'FILED', 'COMPLETE',
  ]).optional(),
  serviceType: z.enum(['ITR', 'GST', 'TDS', 'ROC', 'AUDIT', 'ADVANCE_TAX', 'OTHER']).optional(),
  clientId: uuidSchema.optional(),
  assignedTo: uuidSchema.optional(),
  search: z.string().optional(),
  financialYear: z.string().optional(),
})

// ── Tasks ──────────────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['todo', 'call_client', 'internal_review', 'waiting_client', 'waiting_govt']).default('todo'),
  assignedTo: uuidSchema.optional(),
  dueDate: z.string().date().optional(),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
})

export type CreateCaseInput   = z.infer<typeof createCaseSchema>
export type UpdateCaseInput   = z.infer<typeof updateCaseSchema>
export type MoveCaseInput     = z.infer<typeof moveCaseSchema>
export type ListCasesQuery    = z.infer<typeof listCasesSchema>
export type CreateTaskInput   = z.infer<typeof createTaskSchema>
export type UpdateTaskInput   = z.infer<typeof updateTaskSchema>
