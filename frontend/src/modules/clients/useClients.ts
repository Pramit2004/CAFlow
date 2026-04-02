import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchClients,
  fetchClient,
  fetchClientCases,
  createClient,
  updateClient,
  deleteClient,
  type ListClientsParams,
  type CreateClientPayload,
  type UpdateClientPayload,
} from './clientsApi'

// ── Query Keys ─────────────────────────────────────────────────────────────

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params: ListClientsParams) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  cases: (id: string) => [...clientKeys.detail(id), 'cases'] as const,
}

// ── List ───────────────────────────────────────────────────────────────────

export function useClients(params: ListClientsParams = {}) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => fetchClients(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}

// ── Single ─────────────────────────────────────────────────────────────────

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => fetchClient(id),
    enabled: !!id,
    staleTime: 60_000,
  })
}

// ── Client Cases ───────────────────────────────────────────────────────────

export function useClientCases(clientId: string) {
  return useQuery({
    queryKey: clientKeys.cases(clientId),
    queryFn: () => fetchClientCases(clientId),
    enabled: !!clientId,
    staleTime: 30_000,
  })
}

// ── Create ─────────────────────────────────────────────────────────────────

export function useCreateClient() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateClientPayload) => createClient(payload),
    onSuccess: (newClient) => {
      qc.invalidateQueries({ queryKey: clientKeys.lists() })
      toast.success(`${newClient.name} added successfully`)
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error ?? 'Failed to add client'
      toast.error(msg)
    },
  })
}

// ── Update ─────────────────────────────────────────────────────────────────

export function useUpdateClient(id: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateClientPayload) => updateClient(id, payload),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: clientKeys.lists() })
      qc.setQueryData(clientKeys.detail(id), (old: any) =>
        old ? { ...old, ...updated } : updated,
      )
      toast.success('Client updated')
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.error ?? 'Failed to update client'
      toast.error(msg)
    },
  })
}

// ── Delete ─────────────────────────────────────────────────────────────────

export function useDeleteClient() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientKeys.lists() })
      toast.success('Client removed')
    },
    onError: () => {
      toast.error('Failed to remove client')
    },
  })
}
