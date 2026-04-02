import { api } from '@/services/api'
import { buildQueryString } from '@/lib/utils'
import type { PaginatedResponse, ApiResponse } from '@/types/common.types'

// ── Types ──────────────────────────────────────────────────────────────────

export type EntityType =
  | 'individual' | 'huf' | 'partnership' | 'llp'
  | 'pvt_ltd' | 'public_ltd' | 'trust' | 'other'

export type ClientLanguage = 'en' | 'gu' | 'hi'

export interface Client {
  id: string
  workspaceId: string
  assignedTo: string | null
  name: string
  phone: string
  email: string | null
  dob: string | null
  pan: string | null
  aadhaarLast4: string | null
  gstin: string | null
  entityType: EntityType | null
  businessName: string | null
  turnoverRange: string | null
  spousePan: string | null
  hufDetails: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  preferredLanguage: ClientLanguage
  tags: string[]
  notes: string | null
  clientSince: string | null
  isActive: string
  createdAt: string
  updatedAt: string
}

export interface ClientWithStats extends Client {
  stats: {
    totalCases: number
    activeCases: number
    completedCases: number
    totalFeeQuoted: number
    totalFeeReceived: number
    pendingDocs: number
    uploadedDocs: number
  }
}

export interface ListClientsParams {
  page?: number
  limit?: number
  search?: string
  tag?: string
  assignedTo?: string
  city?: string
}

export interface CreateClientPayload {
  name: string
  phone: string
  email?: string
  pan?: string
  aadhaarLast4?: string
  gstin?: string
  dob?: string
  entityType?: EntityType
  businessName?: string
  spousePan?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  preferredLanguage?: ClientLanguage
  assignedTo?: string
  tags?: string[]
  notes?: string
}

export type UpdateClientPayload = Partial<CreateClientPayload>

// ── API Functions ──────────────────────────────────────────────────────────

export async function fetchClients(params: ListClientsParams = {}) {
  const qs = buildQueryString(params as Record<string, string | number | boolean | undefined>)
  const res = await api.get<PaginatedResponse<Client>>(`/api/clients${qs}`)
  return res.data
}

export async function fetchClient(id: string) {
  const res = await api.get<ApiResponse<ClientWithStats>>(`/api/clients/${id}`)
  return res.data.data
}

export async function fetchClientCases(id: string) {
  const res = await api.get<ApiResponse<any[]>>(`/api/clients/${id}/cases`)
  return res.data.data
}

export async function createClient(payload: CreateClientPayload) {
  const res = await api.post<ApiResponse<Client>>('/api/clients', payload)
  return res.data.data
}

export async function updateClient(id: string, payload: UpdateClientPayload) {
  const res = await api.patch<ApiResponse<Client>>(`/api/clients/${id}`, payload)
  return res.data.data
}

export async function deleteClient(id: string) {
  await api.delete(`/api/clients/${id}`)
}

export async function downloadClientsCSV() {
  const res = await api.get('/api/clients/export/csv', { responseType: 'blob' })
  const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
