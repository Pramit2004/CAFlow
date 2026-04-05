import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, User, FileText,
  CheckSquare, Plus, Trash2,
  ChevronRight, Edit3, Circle, CheckCircle2,
  Loader2, AlertCircle,
} from 'lucide-react'
import { useCase, useUpdateCase, useCreateTask, useUpdateTask, useDeleteTask } from '@/modules/cases/useCases'
import { Tabs } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { cn, formatCurrency } from '@/lib/utils'
import type { CaseStatus, ServiceType } from '@/types/common.types'
import type { Task } from '@/modules/cases/casesApi'

// ── Config ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: CaseStatus; label: string; variant: any; dot: string }[] = [
  { value: 'DOCUMENTS_PENDING',  label: 'Docs Pending',   variant: 'warning', dot: 'bg-amber-500'  },
  { value: 'DOCS_RECEIVED',      label: 'Docs Received',  variant: 'info',    dot: 'bg-blue-500'   },
  { value: 'UNDER_PREPARATION',  label: 'In Progress',    variant: 'purple',  dot: 'bg-purple-500' },
  { value: 'FILED',              label: 'Filed',          variant: 'brand',   dot: 'bg-brand-500'  },
  { value: 'COMPLETE',           label: 'Complete',       variant: 'success', dot: 'bg-green-500'  },
]

const SERVICE_COLORS: Record<ServiceType, string> = {
  ITR:          'bg-blue-100   text-blue-700   dark:bg-blue-950/50  dark:text-blue-300',
  GST:          'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  TDS:          'bg-amber-100  text-amber-700  dark:bg-amber-950/50 dark:text-amber-300',
  ROC:          'bg-pink-100   text-pink-700   dark:bg-pink-950/50  dark:text-pink-300',
  AUDIT:        'bg-red-100    text-red-700    dark:bg-red-950/50   dark:text-red-300',
  ADVANCE_TAX:  'bg-cyan-100   text-cyan-700   dark:bg-cyan-950/50  dark:text-cyan-300',
  OTHER:        'bg-[var(--bg-subtle)] text-[var(--text-secondary)]',
}

const TASK_TYPE_LABELS: Record<Task['type'], string> = {
  todo:             'To-Do',
  call_client:      'Call Client',
  internal_review:  'Internal Review',
  waiting_client:   'Waiting on Client',
  waiting_govt:     'Waiting on Govt',
}

// ── Status selector (inline) ───────────────────────────────────────────────

function StatusSelector({ current, caseId }: { current: CaseStatus; caseId: string }) {
  const { mutate: update, isPending } = useUpdateCase(caseId)

  return (
    <div className="flex items-center gap-2">
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--text-tertiary)]" />}
      <div className="w-44">
        <Select
          options={STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
          value={current}
          onChange={(v) => update({ status: v as CaseStatus })}
        />
      </div>
    </div>
  )
}

// ── Tasks tab ──────────────────────────────────────────────────────────────

function TasksTab({ caseId, tasks }: { caseId: string; tasks: Task[] }) {
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)

  const { mutate: createTask, isPending: creating } = useCreateTask(caseId)
  const { mutate: updateTask } = useUpdateTask(caseId)
  const { mutate: deleteTask } = useDeleteTask(caseId)

  const handleAdd = () => {
    if (!newTitle.trim()) return
    createTask({ title: newTitle.trim() }, {
      onSuccess: () => { setNewTitle(''); setAdding(false) },
    })
  }

  const todo = tasks.filter((t) => t.status !== 'done')
  const done = tasks.filter((t) => t.status === 'done')

  return (
    <div className="flex flex-col gap-4">

      {/* Add task bar */}
      {adding ? (
        <div className="flex items-center gap-2 rounded-xl border border-brand-300/50 bg-brand-50/40 p-3 dark:bg-brand-950/20">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') setAdding(false)
            }}
            placeholder="Task title… (Enter to save, Esc to cancel)"
            className="flex-1 bg-transparent text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
          />
          <Button size="xs" variant="primary" loading={creating} onClick={handleAdd}>
            Add
          </Button>
          <Button size="xs" variant="ghost" onClick={() => setAdding(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-4 py-3 text-[12.5px] font-[500] text-[var(--text-tertiary)] transition-colors hover:border-brand-400/50 hover:bg-brand-50/30 hover:text-brand-600 dark:hover:bg-brand-950/10 dark:hover:text-brand-400"
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </button>
      )}

      {/* Active tasks */}
      {todo.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {todo.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => updateTask({ taskId: task.id, status: 'done' })}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </div>
      )}

      {/* Done tasks */}
      {done.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-[600] uppercase tracking-wider text-[var(--text-tertiary)]"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
            Completed ({done.length})
          </p>
          <div className="flex flex-col gap-1.5">
            {done.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => updateTask({ taskId: task.id, status: 'todo' })}
                onDelete={() => deleteTask(task.id)}
                done
              />
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && !adding && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <CheckSquare className="h-8 w-8 text-[var(--text-tertiary)]" />
          <p className="text-[13px] font-[600] text-[var(--text-primary)]">No tasks yet</p>
          <p className="text-[12px] text-[var(--text-tertiary)]">Add tasks to track progress on this case.</p>
        </div>
      )}
    </div>
  )
}

function TaskRow({
  task, onToggle, onDelete, done = false,
}: {
  task: Task; onToggle: () => void; onDelete: () => void; done?: boolean
}) {
  return (
    <div className={cn(
      'group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-150',
      done
        ? 'border-[var(--border)] bg-[var(--bg-subtle)]/50 opacity-60'
        : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]',
    )}>
      <button type="button" onClick={onToggle}
        className="flex-shrink-0 text-[var(--text-tertiary)] transition-colors hover:text-brand-600">
        {done
          ? <CheckCircle2 className="h-4 w-4 text-green-500" />
          : <Circle className="h-4 w-4" />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn('text-[13px] font-[500] text-[var(--text-primary)]', done && 'line-through')}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10.5px] text-[var(--text-tertiary)]">
            {TASK_TYPE_LABELS[task.type]}
          </span>
          {task.dueDate && (
            <span className="text-[10.5px] text-[var(--text-tertiary)]">
              · Due {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>

      <button type="button" onClick={onDelete}
        className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100 text-[var(--text-tertiary)] hover:text-red-500">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ── Documents tab (placeholder) ────────────────────────────────────────────

function DocumentsTab({ documents }: { documents: any[] }) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-subtle)]">
          <FileText className="h-6 w-6 text-[var(--text-tertiary)]" />
        </div>
        <div>
          <p className="text-[13.5px] font-[600] text-[var(--text-primary)]">No documents yet</p>
          <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">
            Documents will appear here once the client uploads them.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-[var(--text-tertiary)]" />
            <div>
              <p className="text-[13px] font-[500] text-[var(--text-primary)]">{doc.label}</p>
              {doc.fileName && (
                <p className="text-[11px] text-[var(--text-tertiary)]">{doc.fileName}</p>
              )}
            </div>
          </div>
          <Badge
            variant={
              doc.status === 'ACCEPTED' ? 'success'
              : doc.status === 'REJECTED' ? 'danger'
              : doc.status === 'UPLOADED' ? 'info'
              : 'warning'
            }
            size="sm"
          >
            {doc.status}
          </Badge>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: <CheckSquare className="h-3.5 w-3.5" /> },
  { id: 'tasks',     label: 'Tasks',     icon: <CheckSquare className="h-3.5 w-3.5" /> },
  { id: 'documents', label: 'Documents', icon: <FileText className="h-3.5 w-3.5" />    },
]

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: caseData, isLoading, error } = useCase(id!)

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-[var(--border)]" />
            <div className="flex flex-col gap-2">
              <div className="h-5 w-48 animate-pulse rounded bg-[var(--border)]" />
              <div className="h-3.5 w-32 animate-pulse rounded bg-[var(--border)]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-[var(--text-tertiary)]" />
        <p className="text-[14px] font-[600] text-[var(--text-primary)]">Case not found</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/cases')}>
          Back to Cases
        </Button>
      </div>
    )
  }

  const tasksDone = caseData.tasks.filter((t) => t.status === 'done').length
  const taskPct = caseData.tasks.length > 0
    ? Math.round((tasksDone / caseData.tasks.length) * 100) : 0

  const tabsWithBadges = TABS.map((t) => ({
    ...t,
    badge: t.id === 'tasks' ? caseData.tasks.length || undefined
         : t.id === 'documents' ? caseData.documents.length || undefined
         : undefined,
  }))

  return (
    <div className="flex h-full flex-col" style={{ background: '#F9F7F4' }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-6 py-4" style={{ background: 'white', borderBottom: '1px solid #EDE8E1' }}>

        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-1.5 text-[11.5px] text-[var(--text-tertiary)]">
          <button type="button" onClick={() => navigate('/cases')}
            className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Cases
          </button>
          <span>/</span>
          <span className="text-[var(--text-primary)]">{caseData.title}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Service icon */}
            <div className={cn(
              'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-[12px] font-[800]',
              SERVICE_COLORS[caseData.serviceType],
            )}>
              {caseData.serviceType}
            </div>

            <div>
              <h1
                className="text-[20px] font-[800] tracking-tight text-[var(--text-primary)]"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
              >
                {caseData.title}
              </h1>

              {/* Meta row */}
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[var(--text-tertiary)]">
                {caseData.client?.name && (
                  <button
                    type="button"
                    onClick={() => navigate(`/clients/${caseData.clientId}`)}
                    className="flex items-center gap-1.5 hover:text-brand-600 transition-colors"
                  >
                    <User className="h-3 w-3" />
                    {caseData.client.name}
                    <ChevronRight className="h-3 w-3 opacity-50" />
                  </button>
                )}
                {caseData.financialYear && (
                  <span className="font-mono">FY {caseData.financialYear}</span>
                )}
                {caseData.deadline && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(caseData.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status selector + actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatusSelector current={caseData.status} caseId={caseData.id} />
            <Button variant="secondary" size="sm" leftIcon={<Edit3 className="h-3.5 w-3.5" />}>
              Edit
            </Button>
          </div>
        </div>

        {/* Progress bar (tasks) */}
        {caseData.tasks.length > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className={cn('h-full rounded-full transition-all duration-700',
                  taskPct === 100 ? 'bg-green-500' : 'bg-brand-500')}
                style={{ width: `${taskPct}%` }}
              />
            </div>
            <span className="text-[11.5px] text-[var(--text-tertiary)]">
              {tasksDone}/{caseData.tasks.length} tasks · {taskPct}%
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-4">
          <Tabs tabs={tabsWithBadges} active={activeTab} onChange={setActiveTab} variant="line" />
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-auto p-6" style={{ background: '#F9F7F4' }}>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Left */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Fee summary */}
              {(caseData.feeQuoted || caseData.feeBilled || caseData.feeReceived) && (
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: 'white', border: '1px solid #EDE8E1', boxShadow: '0 2px 8px rgba(26,21,18,0.06)' }}>
                  <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #F5F2EE' }}>
                    <p className="text-[10.5px] font-[700] uppercase tracking-wider"
                      style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#A09890' }}>
                      Fee Summary
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-0 divide-x" style={{ borderColor: '#F5F2EE' }}>
                    {[
                      { label: 'Quoted',   value: caseData.feeQuoted },
                      { label: 'Billed',   value: caseData.feeBilled },
                      { label: 'Received', value: caseData.feeReceived, highlight: true },
                    ].map(({ label, value, highlight }) => (
                      <div key={label} className="px-5 py-4">
                        <p className="text-[11px]" style={{ color: '#A09890' }}>{label}</p>
                        <p className="mt-0.5 text-[20px] font-[800] leading-none"
                          style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: highlight ? '#C84B0F' : '#1A1512' }}>
                          {value ? formatCurrency(value) : '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                  {caseData.feeQuoted && caseData.feeReceived && (
                    <div className="px-5 pb-4">
                      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: '#F5F2EE' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, (parseFloat(caseData.feeReceived) / parseFloat(caseData.feeQuoted)) * 100)}%`, background: 'linear-gradient(90deg, #C84B0F, #F97316)' }} />
                      </div>
                      <p className="mt-1.5 text-[11px]" style={{ color: '#A09890' }}>
                        {Math.round((parseFloat(caseData.feeReceived) / parseFloat(caseData.feeQuoted)) * 100)}% collected
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {caseData.description && (
                <div className="rounded-2xl px-5 py-4"
                  style={{ background: 'white', border: '1px solid #EDE8E1', boxShadow: '0 2px 8px rgba(26,21,18,0.06)' }}>
                  <p className="mb-2.5 text-[10.5px] font-[700] uppercase tracking-wider"
                    style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#A09890' }}>
                    Internal Notes
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: '#6B6258' }}>
                    {caseData.description}
                  </p>
                </div>
              )}
            </div>

            {/* Right: client + details */}
            <div className="flex flex-col gap-5">
              {caseData.client && (
                <div className="cursor-pointer rounded-2xl px-5 py-4 transition-all duration-150"
                  style={{ background: 'white', border: '1px solid #EDE8E1', boxShadow: '0 2px 8px rgba(26,21,18,0.06)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C84B0F'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(200,75,15,0.12)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EDE8E1'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(26,21,18,0.06)' }}
                  onClick={() => navigate(`/clients/${caseData.clientId}`)}
                >
                  <p className="mb-3 text-[10.5px] font-[700] uppercase tracking-wider"
                    style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#A09890' }}>
                    Client
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-[700] text-white"
                      style={{ background: 'linear-gradient(135deg, #C84B0F, #F97316)' }}>
                      {caseData.client.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13.5px] font-[700]" style={{ color: '#1A1512' }}>{caseData.client.name}</p>
                      {caseData.client.phone && (
                        <p className="text-[11.5px]" style={{ color: '#A09890' }}>+91 {caseData.client.phone}</p>
                      )}
                    </div>
                  </div>
                  {caseData.client.pan && (
                    <p className="mt-2 font-mono text-[11.5px]" style={{ color: '#A09890' }}>PAN: {caseData.client.pan}</p>
                  )}
                  <div className="mt-3 flex items-center gap-1 text-[11.5px] font-[600]" style={{ color: '#C84B0F' }}>
                    View profile <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              )}

              <div className="rounded-2xl overflow-hidden"
                style={{ background: 'white', border: '1px solid #EDE8E1', boxShadow: '0 2px 8px rgba(26,21,18,0.06)' }}>
                <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #F5F2EE' }}>
                  <p className="text-[10.5px] font-[700] uppercase tracking-wider"
                    style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#A09890' }}>
                    Details
                  </p>
                </div>
                <div className="px-5 py-1">
                  {[
                    { label: 'Service',        value: caseData.serviceType },
                    { label: 'Financial Year', value: caseData.financialYear ?? '—' },
                    { label: 'Deadline',       value: caseData.deadline ? new Date(caseData.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                    { label: 'Created',        value: new Date(caseData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #F9F7F4' }}>
                      <span className="text-[12px]" style={{ color: '#A09890' }}>{label}</span>
                      <span className="text-[12.5px] font-[600]" style={{ color: '#1A1512' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="max-w-2xl">
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'white', border: '1px solid #EDE8E1', boxShadow: '0 2px 8px rgba(26,21,18,0.06)' }}>
              <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #F5F2EE' }}>
                <p className="text-[10.5px] font-[700] uppercase tracking-wider"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#A09890' }}>
                  Tasks · {caseData.tasks.length}
                </p>
              </div>
              <div className="p-4">
                <TasksTab caseId={caseData.id} tasks={caseData.tasks} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'white', border: '1px solid #EDE8E1', boxShadow: '0 2px 8px rgba(26,21,18,0.06)' }}>
            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #F5F2EE' }}>
              <p className="text-[10.5px] font-[700] uppercase tracking-wider"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#A09890' }}>
                Documents · {caseData.documents.length}
              </p>
            </div>
            <div className="p-4">
              <DocumentsTab documents={caseData.documents} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
