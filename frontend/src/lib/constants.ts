export const SERVICE_TYPE_LABELS: Record<string, string> = {
  ITR: 'Income Tax Return',
  GST: 'GST Filing',
  TDS: 'TDS Return',
  ROC: 'ROC Compliance',
  AUDIT: 'Audit',
  ADVANCE_TAX: 'Advance Tax',
  OTHER: 'Other',
}

export const CASE_STATUS_LABELS: Record<string, string> = {
  DOCUMENTS_PENDING: 'Documents Pending',
  DOCS_RECEIVED: 'Docs Received',
  UNDER_PREPARATION: 'Under Preparation',
  FILED: 'Filed',
  COMPLETE: 'Complete',
}

export const CASE_STATUS_COLORS: Record<string, string> = {
  DOCUMENTS_PENDING: 'bg-amber-100 text-amber-800',
  DOCS_RECEIVED: 'bg-blue-100 text-blue-800',
  UNDER_PREPARATION: 'bg-purple-100 text-purple-800',
  FILED: 'bg-emerald-100 text-emerald-800',
  COMPLETE: 'bg-green-100 text-green-800',
}

export const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  staff: 'Staff',
}

export const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  gu: 'ગુજરાતી',
  hi: 'हिंदी',
}

export const FINANCIAL_YEARS = ['2025-26', '2024-25', '2023-24', '2022-23', '2021-22']

export const QUERY_KEYS = {
  clients: 'clients',
  client: (id: string) => ['client', id],
  cases: 'cases',
  case: (id: string) => ['case', id],
  documents: 'documents',
  tasks: 'tasks',
  invoices: 'invoices',
  deadlines: 'deadlines',
  notifications: 'notifications',
  workspace: 'workspace',
  team: 'team',
} as const
