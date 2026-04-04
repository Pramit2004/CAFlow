import { z } from 'zod'

export const listNotificationsSchema = z.object({
  unreadOnly: z.coerce.boolean().default(false),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
})

export const createNotificationSchema = z.object({
  userId: z.string().uuid().optional(), // if omitted, fan out to all workspace users
  type: z.enum([
    'document_uploaded',
    'document_rejected',
    'case_status_changed',
    'deadline_approaching',
    'payment_received',
    'task_assigned',
    'team_invite',
    'reminder_sent',
  ]),
  title: z.string().min(1).max(255),
  body: z.string().optional(),
  meta: z.record(z.unknown()).optional(),
})

export type ListNotificationsQuery = z.infer<typeof listNotificationsSchema>
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>
