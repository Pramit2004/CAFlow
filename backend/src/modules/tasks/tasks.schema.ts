import { z } from 'zod'

export const createTaskSchema = z.object({
  caseId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['todo', 'call_client', 'internal_review', 'waiting_client', 'waiting_govt']).default('todo'),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.string().optional(), // ISO date string YYYY-MM-DD
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  type: z.enum(['todo', 'call_client', 'internal_review', 'waiting_client', 'waiting_govt']).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  dueDate: z.string().nullable().optional(),
})

export const listTasksSchema = z.object({
  caseId: z.string().uuid().optional(),
  assignedTo: z.string().uuid().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type ListTasksQuery = z.infer<typeof listTasksSchema>
