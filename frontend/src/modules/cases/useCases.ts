import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchKanban, fetchCases, fetchCase,
  createCase, updateCase, moveCase, deleteCase,
  createTask, updateTask, deleteTask,
  type CreateCasePayload, type UpdateCasePayload, type CreateTaskPayload,
} from './casesApi'
import type { CaseStatus } from '@/types/common.types'

// ── Query Keys ─────────────────────────────────────────────────────────────

export const caseKeys = {
  all: ['cases'] as const,
  kanban: (fy?: string) => ['cases', 'kanban', fy] as const,
  lists: () => ['cases', 'list'] as const,
  list: (p: any) => ['cases', 'list', p] as const,
  detail: (id: string) => ['cases', 'detail', id] as const,
}

// ── Kanban ─────────────────────────────────────────────────────────────────

export function useKanban(financialYear?: string) {
  return useQuery({
    queryKey: caseKeys.kanban(financialYear),
    queryFn: () => fetchKanban(financialYear),
    staleTime: 30_000,
  })
}

// ── List ───────────────────────────────────────────────────────────────────

export function useCases(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: caseKeys.list(params),
    queryFn: () => fetchCases(params),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}

// ── Single ─────────────────────────────────────────────────────────────────

export function useCase(id: string) {
  return useQuery({
    queryKey: caseKeys.detail(id),
    queryFn: () => fetchCase(id),
    enabled: !!id,
    staleTime: 60_000,
  })
}

// ── Create ─────────────────────────────────────────────────────────────────

export function useCreateCase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCasePayload) => createCase(payload),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ['cases'] })
      toast.success(`Case "${c.title}" created`)
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to create case'),
  })
}

// ── Update ─────────────────────────────────────────────────────────────────

export function useUpdateCase(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateCasePayload) => updateCase(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Case updated')
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to update case'),
  })
}

// ── Move (Kanban optimistic) ───────────────────────────────────────────────

export function useMoveCase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CaseStatus }) => moveCase(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cases', 'kanban'] })
    },
    onError: (_e: any) => {
      toast.error('Failed to move case')
      qc.invalidateQueries({ queryKey: ['cases', 'kanban'] })
    },
  })
}

// ── Delete ─────────────────────────────────────────────────────────────────

export function useDeleteCase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCase(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cases'] })
      toast.success('Case deleted')
    },
    onError: () => toast.error('Failed to delete case'),
  })
}

// ── Tasks ──────────────────────────────────────────────────────────────────

export function useCreateTask(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(caseId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: caseKeys.detail(caseId) })
    },
    onError: () => toast.error('Failed to add task'),
  })
}

export function useUpdateTask(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, ...payload }: { taskId: string } & Partial<CreateTaskPayload> & { status?: 'todo' | 'in_progress' | 'done' }) =>
      updateTask(caseId, taskId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: caseKeys.detail(caseId) })
    },
  })
}

export function useDeleteTask(caseId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(caseId, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: caseKeys.detail(caseId) })
    },
  })
}
