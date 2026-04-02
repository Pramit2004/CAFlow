export type PaginatedQuery = {
  page: number
  limit: number
}

export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type ServiceType = 'ITR' | 'GST' | 'TDS' | 'ROC' | 'AUDIT' | 'ADVANCE_TAX' | 'OTHER'

export type CaseStatus =
  | 'DOCUMENTS_PENDING'
  | 'DOCS_RECEIVED'
  | 'UNDER_PREPARATION'
  | 'FILED'
  | 'COMPLETE'

export type Language = 'en' | 'gu' | 'hi'
