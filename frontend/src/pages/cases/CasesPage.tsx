import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Calendar, FileText,
  CheckSquare, AlertTriangle, Clock, Search,
} from 'lucide-react'
import { useKanban, useMoveCase } from '@/modules/cases/useCases'
import { CreateCaseModal } from '@/modules/cases/CreateCaseModal'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { cn, formatCurrency, getInitials } from '@/lib/utils'
import type { CaseStatus, ServiceType } from '@/types/common.types'
import type { KanbanCase } from '@/modules/cases/casesApi'

// ── Constants ──────────────────────────────────────────────────────────────

const COLUMNS: { id: CaseStatus; label: string; color: string; border: string; dot: string }[] = [
  { id: 'DOCUMENTS_PENDING',  label: 'Docs Pending',    color: 'bg-amber-50  dark:bg-amber-950/20',  border: 'border-amber-200 dark:border-amber-800/50',  dot: 'bg-amber-500'  },
  { id: 'DOCS_RECEIVED',      label: 'Docs Received',   color: 'bg-blue-50   dark:bg-blue-950/20',   border: 'border-blue-200 dark:border-blue-800/50',    dot: 'bg-blue-500'   },
  { id: 'UNDER_PREPARATION',  label: 'In Progress',     color: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800/50',dot: 'bg-purple-500' },
  { id: 'FILED',              label: 'Filed',           color: 'bg-brand-50  dark:bg-brand-950/20',  border: 'border-brand-200 dark:border-brand-800/50',  dot: 'bg-brand-500'  },
  { id: 'COMPLETE',           label: 'Complete',        color: 'bg-green-50  dark:bg-green-950/20',  border: 'border-green-200 dark:border-green-800/50',  dot: 'bg-green-500'  },
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

// Generate FY options
function getFYOptions() {
  const now = new Date()
  const cur = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  return [
    { value: '', label: 'All Years' },
    ...Array.from({ length: 5 }).map((_, i) => {
      const y = cur - i
      const label = `${y}-${String(y + 1).slice(-2)}`
      return { value: label, label }
    }),
  ]
}

// ── Deadline urgency ───────────────────────────────────────────────────────

function deadlineInfo(deadline: string | null) {
  if (!deadline) return null
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
  if (days < 0)  return { label: `${Math.abs(days)}d overdue`, class: 'text-red-600 dark:text-red-400', icon: AlertTriangle }
  if (days <= 3) return { label: `${days}d left`,             class: 'text-red-600 dark:text-red-400', icon: AlertTriangle }
  if (days <= 7) return { label: `${days}d left`,             class: 'text-amber-600 dark:text-amber-400', icon: Clock }
  return { label: new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), class: 'text-[var(--text-tertiary)]', icon: Calendar }
}

// ── Kanban Card ────────────────────────────────────────────────────────────

interface CardProps {
  c: KanbanCase
  onDragStart: (e: React.DragEvent, caseId: string, fromStatus: CaseStatus) => void
  onClick: () => void
}

function KanbanCard({ c, onDragStart, onClick }: CardProps) {
  const dl = deadlineInfo(c.deadline)
  const DlIcon = dl?.icon ?? Calendar
  const taskPct = c.tasks.total > 0 ? Math.round((c.tasks.done / c.tasks.total) * 100) : 0
  const clientInitials = getInitials(c.client?.name ?? '?')
  const hash = (c.client?.name ?? '').split('').reduce((a, ch) => a + ch.charCodeAt(0), 0)
  const hue = (hash * 37) % 360

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, c.id, c.status)}
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-xl border bg-[var(--surface)] p-3.5 shadow-xs',
        'transition-all duration-150 hover:shadow-md hover:border-[var(--border-strong)]',
        'active:opacity-70 active:scale-[0.98]',
        'border-[var(--border)]',
      )}
    >
      {/* Top row: service badge + avatar */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <span className={cn('rounded-md px-2 py-0.5 text-[10.5px] font-[700] leading-none', SERVICE_COLORS[c.serviceType])}>
          {c.serviceType}
        </span>
        <div
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[8px] font-[700] text-white"
          style={{ background: `linear-gradient(135deg, hsl(${hue},55%,42%) 0%, hsl(${(hue+40)%360},60%,52%) 100%)` }}
          title={c.client?.name ?? ''}
        >
          {clientInitials}
        </div>
      </div>

      {/* Title */}
      <p className="text-[12.5px] font-[600] leading-snug text-[var(--text-primary)] mb-1.5">
        {c.title}
      </p>

      {/* Client */}
      <p className="text-[11px] text-[var(--text-tertiary)] mb-2.5">
        {c.client?.name}
        {c.financialYear && <span className="ml-1.5 font-mono">FY {c.financialYear}</span>}
      </p>

      {/* Task progress bar */}
      {c.tasks.total > 0 && (
        <div className="mb-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1 text-[10.5px] text-[var(--text-tertiary)]">
              <CheckSquare className="h-3 w-3" />
              {c.tasks.done}/{c.tasks.total} tasks
            </span>
            <span className="text-[10px] font-[600] text-[var(--text-tertiary)]">{taskPct}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className={cn('h-full rounded-full transition-all duration-500',
                taskPct === 100 ? 'bg-green-500' : 'bg-brand-500')}
              style={{ width: `${taskPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Bottom row: deadline + docs + fee */}
      <div className="flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-2.5">
          {dl && (
            <span className={cn('flex items-center gap-1 text-[10.5px] font-[500]', dl.class)}>
              <DlIcon className="h-3 w-3" />
              {dl.label}
            </span>
          )}
          {c.docs.pending > 0 && (
            <span className="flex items-center gap-1 text-[10.5px] font-[500] text-amber-600 dark:text-amber-400">
              <FileText className="h-3 w-3" />
              {c.docs.pending} pending
            </span>
          )}
        </div>
        {c.feeQuoted && (
          <span className="text-[10.5px] font-[600] text-[var(--text-tertiary)]">
            {formatCurrency(c.feeQuoted)}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Kanban Column ──────────────────────────────────────────────────────────

interface ColumnProps {
  col: typeof COLUMNS[0]
  cards: KanbanCase[]
  onDragStart: (e: React.DragEvent, caseId: string, fromStatus: CaseStatus) => void
  onDrop: (toStatus: CaseStatus) => void
  onCardClick: (id: string) => void
  onAddCase: () => void
}

function KanbanColumn({ col, cards, onDragStart, onDrop, onCardClick, onAddCase }: ColumnProps) {
  const [isOver, setIsOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(true)
  }

  const handleDragLeave = () => setIsOver(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    onDrop(col.id)
  }

  const totalFee = cards.reduce((sum, c) => sum + (c.feeQuoted ? parseFloat(c.feeQuoted) : 0), 0)

  return (
    <div className="flex w-[272px] flex-shrink-0 flex-col">
      {/* Column header */}
      <div className={cn(
        'mb-2 flex items-center justify-between rounded-xl border px-3 py-2.5',
        col.color, col.border,
      )}>
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', col.dot)} />
          <span
            className="text-[12px] font-[700] text-[var(--text-primary)]"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          >
            {col.label}
          </span>
          <span className={cn(
            'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-[700]',
            col.color, 'border', col.border,
          )}>
            {cards.length}
          </span>
        </div>
        {totalFee > 0 && (
          <span className="text-[10.5px] font-[500] text-[var(--text-tertiary)]">
            {formatCurrency(totalFee)}
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-1 flex-col gap-2 rounded-xl min-h-[120px] p-1.5 transition-all duration-150',
          isOver && 'ring-2 ring-brand-400/60 bg-brand-50/30 dark:bg-brand-950/10',
        )}
      >
        {cards.map((c) => (
          <KanbanCard
            key={c.id}
            c={c}
            onDragStart={onDragStart}
            onClick={() => onCardClick(c.id)}
          />
        ))}

        {/* Add card button */}
        <button
          type="button"
          onClick={onAddCase}
          className={cn(
            'flex items-center gap-2 rounded-xl border border-dashed px-3 py-2.5 text-[12px] font-[500]',
            'border-[var(--border)] text-[var(--text-tertiary)] transition-colors',
            'hover:border-brand-400/50 hover:bg-brand-50/30 hover:text-brand-600 dark:hover:bg-brand-950/10 dark:hover:text-brand-400',
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          Add case
        </button>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function CasesPage() {
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  const [fy, setFy] = useState(getFYOptions()[1]?.value ?? '')
  const [search, setSearch] = useState('')

  const dragRef = useRef<{ caseId: string; fromStatus: CaseStatus } | null>(null)

  const { data: board, isLoading } = useKanban(fy || undefined)
  const { mutate: moveCase } = useMoveCase()

  const handleDragStart = useCallback((e: React.DragEvent, caseId: string, fromStatus: CaseStatus) => {
    dragRef.current = { caseId, fromStatus }
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDrop = useCallback((toStatus: CaseStatus) => {
    if (!dragRef.current) return
    const { caseId, fromStatus } = dragRef.current
    if (fromStatus === toStatus) return

    moveCase({ id: caseId, status: toStatus })
    dragRef.current = null
  }, [moveCase])

  // Filter by search
  const filteredBoard = board
    ? Object.fromEntries(
        Object.entries(board).map(([status, cards]) => [
          status,
          search
            ? cards.filter((c) =>
                c.title.toLowerCase().includes(search.toLowerCase()) ||
                c.client?.name?.toLowerCase().includes(search.toLowerCase()),
              )
            : cards,
        ]),
      ) as typeof board
    : null

  const totalCases = filteredBoard
    ? Object.values(filteredBoard).reduce((s, cards) => s + cards.length, 0)
    : 0

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1
              className="text-[22px] font-[800] tracking-tight text-[var(--text-primary)]"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
            >
              Cases
            </h1>
            <p className="mt-0.5 text-[12.5px] text-[var(--text-tertiary)]">
              {isLoading ? 'Loading…' : `${totalCases} cases${fy ? ` · FY ${fy}` : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => setShowCreate(true)}
            >
              New Case
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-3 flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cases or clients…"
              className="h-8 w-56 rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-[13px] text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-tertiary)] focus:border-brand-400 focus:shadow-[0_0_0_3px_rgba(18,110,71,0.1)] hover:border-[var(--border-strong)]"
            />
          </div>

          {/* FY filter */}
          <div className="w-36">
            <Select
              options={getFYOptions()}
              value={fy}
              onChange={setFy}
            />
          </div>

          {/* Column summary pills */}
          {!isLoading && filteredBoard && (
            <div className="flex items-center gap-2 ml-2">
              {COLUMNS.map((col) => {
                const count = filteredBoard[col.id]?.length ?? 0
                if (count === 0) return null
                return (
                  <span key={col.id} className="flex items-center gap-1.5 text-[11.5px] text-[var(--text-tertiary)]">
                    <span className={cn('h-1.5 w-1.5 rounded-full', col.dot)} />
                    {count}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Kanban Board ── */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex gap-4">
            {COLUMNS.map((col) => (
              <div key={col.id} className="w-[272px] flex-shrink-0">
                <div className={cn('mb-2 h-10 animate-pulse rounded-xl border', col.color, col.border)} />
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-[120px] animate-pulse rounded-xl bg-[var(--border)]" style={{ opacity: 1 - i * 0.2 }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 pb-4 min-h-full">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                col={col}
                cards={filteredBoard?.[col.id] ?? []}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onCardClick={(id) => navigate(`/cases/${id}`)}
                onAddCase={() => setShowCreate(true)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateCaseModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
