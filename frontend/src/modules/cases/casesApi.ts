import { api } from '@/services/api'
import { buildQueryString } from '@/lib/utils'
import type { PaginatedResponse, ApiResponse, CaseStatus, ServiceType } from '@/types/common.types'

// ── Types ──────────────────────────────────────────────────────────────────

export interface Case {
  id: string
  workspaceId: string
  clientId: string
  assignedTo: string | null
  title: string
  serviceType: ServiceType
  financialYear: string | null
  status: CaseStatus
  deadline: string | null
  description: string | null
  feeQuoted: string | null
  feeBilled: string | null
  feeReceived: string | null
  sourceCaseId: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
  client?: {
    name: string | null
    phone: string | null
    pan: string | null
    email?: string | null
    entityType?: string | null
  }
}

export interface KanbanCase extends Case {
  tasks: { total: number; done: number }
  docs: { pending: number; total: number }
}

export type KanbanBoard = Record<CaseStatus, KanbanCase[]>

export interface Task {
  id: string
  caseId: string
  workspaceId: string
  assignedTo: string | null
  title: string
  description: string | null
  type: 'todo' | 'call_client' | 'internal_review' | 'waiting_client' | 'waiting_govt'
  status: 'todo' | 'in_progress' | 'done'
  dueDate: string | null
  completedAt: string | null
  createdAt: string
}

export interface CaseWithDetail extends Case {
  tasks: Task[]
  documents: any[]
}

export interface CreateCasePayload {
  clientId: string
  title: string
  serviceType: ServiceType
  financialYear?: string
  deadline?: string
  description?: string
  assignedTo?: string
  feeQuoted?: number
}

export type UpdateCasePayload = Partial<CreateCasePayload> & { status?: CaseStatus }

export interface CreateTaskPayload {
  title: string
  description?: string
  type?: Task['type']
  assignedTo?: string
  dueDate?: string
}

// ── API Functions ──────────────────────────────────────────────────────────

export async function fetchKanban(financialYear?: string) {
  const qs = financialYear ? `?financialYear=${financialYear}` : ''
  const res = await api.get<ApiResponse<KanbanBoard>>(`/api/cases/kanban${qs}`)
  return res.data.data
}

export async function fetchCases(params: Record<string, any> = {}) {
  const qs = buildQueryString(params)
  const res = await api.get<PaginatedResponse<Case>>(`/api/cases${qs}`)
  return res.data
}

export async function fetchCase(id: string) {
  const res = await api.get<ApiResponse<CaseWithDetail>>(`/api/cases/${id}`)
  return res.data.data
}

export async function createCase(payload: CreateCasePayload) {
  const res = await api.post<ApiResponse<Case>>('/api/cases', payload)
  return res.data.data
}

export async function updateCase(id: string, payload: UpdateCasePayload) {
  const res = await api.patch<ApiResponse<Case>>(`/api/cases/${id}`, payload)
  return res.data.data
}

export async function moveCase(id: string, status: CaseStatus) {
  const res = await api.patch<ApiResponse<Case>>(`/api/cases/${id}/move`, { status })
  return res.data.data
}

export async function deleteCase(id: string) {
  await api.delete(`/api/cases/${id}`)
}

export async function createTask(caseId: string, payload: CreateTaskPayload) {
  const res = await api.post<ApiResponse<Task>>(`/api/cases/${caseId}/tasks`, payload)
  return res.data.data
}

export async function updateTask(caseId: string, taskId: string, payload: Partial<CreateTaskPayload> & { status?: Task['status'] }) {
  const res = await api.patch<ApiResponse<Task>>(`/api/cases/${caseId}/tasks/${taskId}`, payload)
  return res.data.data
}

export async function deleteTask(caseId: string, taskId: string) {
  await api.delete(`/api/cases/${caseId}/tasks/${taskId}`)
}
