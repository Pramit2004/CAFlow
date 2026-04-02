// Real-time event type definitions
// Uses Supabase Realtime for push to frontend

export const SOCKET_EVENTS = {
  // Document events
  DOCUMENT_UPLOADED: 'document:uploaded',
  DOCUMENT_VERIFIED: 'document:verified',
  DOCUMENT_REJECTED: 'document:rejected',

  // Case events
  CASE_STATUS_CHANGED: 'case:status_changed',
  CASE_ASSIGNED: 'case:assigned',

  // Task events
  TASK_ASSIGNED: 'task:assigned',
  TASK_COMPLETED: 'task:completed',

  // Notification events
  NOTIFICATION_NEW: 'notification:new',

  // Payment events
  PAYMENT_RECEIVED: 'payment:received',
} as const

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS]
