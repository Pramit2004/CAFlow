import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CheckCircle2, Circle, Plus, Trash2, Calendar,
  FolderOpen, Search, Filter, ChevronRight,
} from 'lucide-react'
import { api } from '@/services/api'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────

interface Task {
  id: string
  caseId: string
  title: string
  type: 'todo' | 'call_client' | 'internal_review' | 'waiting_client' | 'waiting_govt'
  status: 'todo' | 'in_progress' | 'done'
  dueDate: string | null
  completedAt: string | null
  createdAt: string
  case?: { title: string; serviceType: string; clientName: string }
}

const TYPE_LABELS: Record<Task['type'], string> = {
  todo: 'To-Do',
  call_client: 'Call Client',
  internal_review: 'Internal Review',
  waiting_client: 'Waiting on Client',
  waiting_govt: 'Waiting on Govt',
}

const SERVICE_COLORS: Record<string, { bg: string; color: string }> = {
  ITR:         { bg: '#EFF6FF', color: '#1D4ED8' },
  GST:         { bg: '#F5F3FF', color: '#6D28D9' },
  TDS:         { bg: '#FFFBEB', color: '#D97706' },
  ROC:         { bg: '#FDF2F8', color: '#BE185D' },
  AUDIT:       { bg: '#FEF2F2', color: '#DC2626' },
  ADVANCE_TAX: { bg: '#ECFEFF', color: '#0E7490' },
  OTHER:       { bg: '#F9F7F4', color: '#6B6258' },
}

// ── API ────────────────────────────────────────────────────────────────────

function useMyTasks() {
  return useQuery({
    queryKey: ['tasks', 'my'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: Task[] }>('/api/tasks')
      return res.data.data
    },
    staleTime: 30_000,
  })
}

function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ caseId, taskId, ...body }: { caseId: string; taskId: string; status: Task['status'] }) => {
      const res = await api.patch(`/api/cases/${caseId}/tasks/${taskId}`, body)
      return res.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', 'my'] }),
    onError: () => toast.error('Failed to update task'),
  })
}

function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ caseId, taskId }: { caseId: string; taskId: string }) => {
      await api.delete(`/api/cases/${caseId}/tasks/${taskId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', 'my'] })
      toast.success('Task removed')
    },
    onError: () => toast.error('Failed to delete task'),
  })
}

// ── Task Row ───────────────────────────────────────────────────────────────

function TaskRow({ task }: { task: Task }) {
  const navigate = useNavigate()
  const { mutate: updateTask, isPending: updating } = useUpdateTask()
  const { mutate: deleteTask, isPending: deleting } = useDeleteTask()

  const isDone = task.status === 'done'
  const isOverdue = task.dueDate && !isDone && new Date(task.dueDate) < new Date()
  const svc = task.case?.serviceType ?? 'OTHER'
  const svcStyle = SERVICE_COLORS[svc] ?? SERVICE_COLORS.OTHER

  const daysLeft = task.dueDate
    ? Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / 86400000)
    : null

  return (
    <div className={cn(
      'group flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-150',
      isDone
        ? 'opacity-55'
        : 'hover:shadow-sm',
    )}
      style={{
        background: 'white',
        borderColor: isOverdue ? '#FCA5A5' : '#EDE8E1',
        boxShadow: isDone ? 'none' : '0 1px 3px rgba(26,21,18,0.04)',
      }}
    >
      {/* Checkbox */}
      <button
        type="button"
        disabled={updating}
        onClick={() => updateTask({ caseId: task.caseId, taskId: task.id, status: isDone ? 'todo' : 'done' })}
        className="mt-0.5 flex-shrink-0 transition-transform duration-150 hover:scale-110"
      >
        {isDone
          ? <CheckCircle2 className="h-5 w-5" style={{ color: '#16A34A' }} />
          : <Circle className="h-5 w-5" style={{ color: '#C9BFB3' }} />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-[13.5px] font-[600] leading-snug', isDone && 'line-through')}
          style={{ color: isDone ? '#A09890' : '#1A1512' }}>
          {task.title}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          {task.case && (
            <button
              type="button"
              onClick={() => navigate(`/cases/${task.caseId}`)}
              className="flex items-center gap-1.5 transition-colors"
              style={{ color: '#6B6258' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#C84B0F' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6258' }}
            >
              <span className="rounded-md px-1.5 py-0.5 text-[10px] font-[700]"
                style={{ background: svcStyle.bg, color: svcStyle.color }}>
                {svc}
              </span>
              <FolderOpen className="h-3 w-3" />
              <span className="text-[11.5px] font-[500] truncate max-w-[160px]">
                {task.case.clientName}
              </span>
              <ChevronRight className="h-3 w-3 opacity-50" />
            </button>
          )}

          <span className="text-[11px]" style={{ color: '#A09890' }}>
            {TYPE_LABELS[task.type]}
          </span>

          {task.dueDate && (
            <span className={cn('flex items-center gap-1 text-[11px] font-[500]')}
              style={{ color: isOverdue ? '#DC2626' : daysLeft !== null && daysLeft <= 3 ? '#D97706' : '#A09890' }}>
              <Calendar className="h-3 w-3" />
              {isOverdue
                ? `${Math.abs(daysLeft!)}d overdue`
                : daysLeft === 0 ? 'Due today'
                : daysLeft === 1 ? 'Due tomorrow'
                : new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
              }
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        type="button"
        disabled={deleting}
        onClick={() => deleteTask({ caseId: task.caseId, taskId: task.id })}
        className="mt-0.5 flex-shrink-0 opacity-0 transition-all duration-150 group-hover:opacity-100"
        style={{ color: '#C9BFB3' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#DC2626' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#C9BFB3' }}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function TaskSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border px-4 py-3.5 animate-pulse"
          style={{ background: 'white', borderColor: '#EDE8E1', opacity: 1 - i * 0.1 }}>
          <div className="h-5 w-5 rounded-full flex-shrink-0" style={{ background: '#F0ECE7' }} />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/5 rounded-full" style={{ background: '#F0ECE7' }} />
            <div className="h-3 w-2/5 rounded-full" style={{ background: '#F5F2EE' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('todo')
  const [search, setSearch] = useState('')

  const { data: tasks = [], isLoading } = useMyTasks()

  const filtered = tasks.filter((t) => {
    if (filter === 'todo' && t.status === 'done') return false
    if (filter === 'done' && t.status !== 'done') return false
    if (search) {
      const q = search.toLowerCase()
      return (
        t.title.toLowerCase().includes(q) ||
        t.case?.clientName.toLowerCase().includes(q) ||
        t.case?.title.toLowerCase().includes(q)
      )
    }
    return true
  })

  const todoCount = tasks.filter((t) => t.status !== 'done').length
  const doneCount = tasks.filter((t) => t.status === 'done').length
  const overdueCount = tasks.filter((t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date()).length

  const groupedByCase = filter === 'todo'
    ? filtered.reduce((acc, t) => {
        const key = t.caseId
        if (!acc[key]) acc[key] = { label: t.case?.clientName ?? 'Unknown', tasks: [] }
        acc[key].tasks.push(t)
        return acc
      }, {} as Record<string, { label: string; tasks: Task[] }>)
    : null

  return (
    <div className="flex h-full flex-col" style={{ background: '#F9F7F4' }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-[800] tracking-tight"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}>
              My Tasks
            </h1>
            <p className="mt-0.5 text-[13px]" style={{ color: '#6B6258' }}>
              Tasks assigned to you across all cases
            </p>
          </div>
        </div>

        {/* Stat pills */}
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { id: 'todo', label: 'Pending', count: todoCount, color: '#C84B0F', bg: '#FFF4EE', border: '#F97316' },
            { id: 'done', label: 'Completed', count: doneCount, color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
          ].map(({ id, label, count, color, bg, border }) => (
            <button key={id} type="button"
              onClick={() => setFilter(id as any)}
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-all duration-150"
              style={{
                background: filter === id ? bg : 'white',
                border: `1px solid ${filter === id ? border : '#EDE8E1'}`,
                boxShadow: '0 1px 4px rgba(26,21,18,0.05)',
              }}
            >
              <p className="text-[20px] font-[800] leading-none"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: filter === id ? color : '#1A1512' }}>
                {isLoading ? '—' : count}
              </p>
              <p className="text-[11.5px] font-[500]" style={{ color: filter === id ? color : '#6B6258' }}>{label}</p>
            </button>
          ))}

          {overdueCount > 0 && (
            <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
              style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
              <p className="text-[20px] font-[800] leading-none"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#DC2626' }}>
                {overdueCount}
              </p>
              <p className="text-[11.5px] font-[500]" style={{ color: '#DC2626' }}>Overdue</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Card ── */}
      <div className="mx-6 mb-6 flex flex-1 flex-col overflow-hidden rounded-2xl"
        style={{
          background: 'white',
          border: '1px solid #EDE8E1',
          boxShadow: '0 4px 24px -4px rgba(26,21,18,0.10), 0 1px 4px rgba(26,21,18,0.06)',
        }}
      >
        {/* Toolbar */}
        <div className="flex flex-shrink-0 items-center gap-3 px-5 py-3.5" style={{ borderBottom: '1px solid #F5F2EE' }}>
          <div className="relative flex-1" style={{ maxWidth: 320 }}>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: '#A09890' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks, clients…"
              className="h-9 w-full rounded-xl border pl-10 pr-3 text-[13px] outline-none transition-all duration-150 bg-white"
              style={{ borderColor: '#EDE8E1', color: '#1A1512' }}
              onFocus={(e) => { e.target.style.borderColor = '#C84B0F'; e.target.style.boxShadow = '0 0 0 3px rgba(200,75,15,0.12)' }}
              onBlur={(e) => { e.target.style.borderColor = '#EDE8E1'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl border p-1" style={{ borderColor: '#EDE8E1' }}>
            {(['all', 'todo', 'done'] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFilter(f)}
                className="rounded-lg px-3 py-1.5 text-[12px] font-[600] transition-all duration-150 capitalize"
                style={{
                  background: filter === f ? '#1A1512' : 'transparent',
                  color: filter === f ? 'white' : '#6B6258',
                }}>
                {f === 'todo' ? 'Pending' : f === 'done' ? 'Done' : 'All'}
              </button>
            ))}
          </div>

          <span className="ml-auto text-[12px]" style={{ color: '#A09890' }}>
            {filtered.length} task{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <TaskSkeleton />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: '#F5F2EE' }}>
                <CheckCircle2 className="h-7 w-7" style={{ color: '#A09890' }} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[14px] font-[700]" style={{ color: '#1A1512', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                  {filter === 'done' ? 'No completed tasks' : 'All caught up!'}
                </p>
                <p className="mt-1 text-[13px]" style={{ color: '#A09890' }}>
                  {filter === 'done' ? 'Complete tasks to see them here.' : 'No pending tasks assigned to you.'}
                </p>
              </div>
            </div>
          ) : groupedByCase ? (
            <div className="flex flex-col gap-5">
              {Object.entries(groupedByCase).map(([caseId, group]) => (
                <div key={caseId}>
                  <p className="mb-2 flex items-center gap-2 text-[10.5px] font-[700] uppercase tracking-wider px-1"
                    style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#A09890' }}>
                    <FolderOpen className="h-3 w-3" />
                    {group.label}
                    <span className="rounded-full px-1.5 py-0.5 text-[9px]" style={{ background: '#F5F2EE', color: '#6B6258' }}>
                      {group.tasks.length}
                    </span>
                  </p>
                  <div className="flex flex-col gap-2">
                    {group.tasks.map((t) => <TaskRow key={t.id} task={t} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((t) => <TaskRow key={t.id} task={t} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
