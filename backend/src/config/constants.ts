// Token expiry durations (in seconds)
export const TOKEN_EXPIRY = {
  DOCUMENT_REQUEST: 14 * 24 * 60 * 60,   // 14 days
  DOCUMENT_DOWNLOAD: 30 * 24 * 60 * 60,   // 30 days
  CLIENT_ONBOARDING: 7 * 24 * 60 * 60,    // 7 days
  TEAM_INVITE: 48 * 60 * 60,              // 48 hours
  SIGNED_URL: 60 * 60,                    // 1 hour (R2 presigned)
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// File limits
export const FILE = {
  MAX_SIZE_MB: 50,
  MAX_SIZE_BYTES: 50 * 1024 * 1024,
  COMPRESS_THRESHOLD_MB: 10,
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const

// Workspace plan limits
export const PLAN_LIMITS = {
  starter: {
    users: 1,
    clients: 50,
    storage_gb: 5,
  },
  growth: {
    users: 5,
    clients: 200,
    storage_gb: 20,
  },
  pro: {
    users: Infinity,
    clients: Infinity,
    storage_gb: 100,
  },
} as const

// Service types
export const SERVICE_TYPES = [
  'ITR',
  'GST',
  'TDS',
  'ROC',
  'AUDIT',
  'ADVANCE_TAX',
  'OTHER',
] as const

// Case statuses (Kanban columns)
export const CASE_STATUS = [
  'DOCUMENTS_PENDING',
  'DOCS_RECEIVED',
  'UNDER_PREPARATION',
  'FILED',
  'COMPLETE',
] as const

// User roles
export const USER_ROLES = ['owner', 'manager', 'staff'] as const

// Reminder days before deadline
export const REMINDER_DAYS = [14, 7, 3] as const

// IST timezone
export const IST_TIMEZONE = 'Asia/Kolkata'
