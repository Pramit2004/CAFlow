export type ServiceType = 'ITR' | 'GST' | 'TDS' | 'ROC' | 'AUDIT' | 'ADVANCE_TAX' | 'OTHER'

export type CaseStatus =
  | 'DOCUMENTS_PENDING'
  | 'DOCS_RECEIVED'
  | 'UNDER_PREPARATION'
  | 'FILED'
  | 'COMPLETE'

export type UserRole = 'owner' | 'manager' | 'staff'
export type Language = 'en' | 'gu' | 'hi'
export type Plan = 'starter' | 'growth' | 'pro'

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  message?: string
}
