import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axios from 'axios'
import {
  Inbox, FileText, CheckCircle2, XCircle, Clock,
  Download, Eye, AlertTriangle, ChevronRight,
  Upload, Filter, Search, RefreshCw, ExternalLink,
} from 'lucide-react'
import { api } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────

interface InboxDoc {
  id: string
  caseId: string
  label: string
  status: 'PENDING' | 'UPLOADED' | 'ACCEPTED' | 'REJECTED'
  direction: 'inbound' | 'outbound'
  isRequired: boolean
  fileName: string | null
  fileMimeType: string | null
  fileSizeBytes: number | null
  uploadedAt: string | null
  rejectionReason: string | null
  rejectionNote: string | null
  updatedAt: string
  case: { title: string; serviceType: string; financialYear: string | null }
  client: { name: string; phone: string }
}

const REJECTION_REASONS = [
  { value: 'blurry',           label: 'Image is blurry / unclear' },
  { value: 'wrong_document',   label: 'Wrong document uploaded' },
  { value: 'wrong_year',       label: 'Wrong financial year' },
  { value: 'password_protected', label: 'File is password protected' },
  { value: 'incomplete',       label: 'Document is incomplete' },
  { value: 'other',            label: 'Other reason' },
]

// ── Hooks ──────────────────────────────────────────────────────────────────

function useDocumentInbox() {
  return useQuery({
    queryKey: ['documents', 'inbox'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: InboxDoc[] }>('/api/documents/inbox')
      return res.data.data
    },
    staleTime: 20_000,
    refetchInterval: 60_000,
  })
}

function useReviewDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, action, rejectionReason, rejectionNote }: {
      id: string; action: 'accept' | 'reject'; rejectionReason?: string; rejectionNote?: string
    }) => {
      const res = await api.post(`/api/documents/${id}/review`, { action, rejectionReason, rejectionNote })
      return res.data
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['documents', 'inbox'] })
      toast.success(vars.action === 'accept' ? 'Document accepted ✓' : 'Document rejected')
    },
    onError: () => toast.error('Action failed'),
  })
}

function useDownloadUrl() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.get<{ success: boolean; data: { url: string; fileName: string } }>(
        `/api/documents/${id}/download-url`,
      )
      return res.data.data
    },
    onSuccess: ({ url, fileName }) => {
      const a = document.createElement('a')
      a.href = url
      a.download = fileName ?? 'document'
      a.click()
    },
    onError: () => toast.error('Failed to get download link'),
  })
}

// ── File size formatter ────────────────────────────────────────────────────

function fmtSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Status badge ───────────────────────────────────────────────────────────

function DocStatusBadge({ status }: { status: InboxDoc['status'] }) {
  const map = {
    PENDING:  { label: 'Awaiting Upload', variant: 'warning' as const, icon: Clock },
    UPLOADED: { label: 'Needs Review',    variant: 'info'    as const, icon: Eye },
    ACCEPTED: { label: 'Accepted',        variant: 'success' as const, icon: CheckCircle2 },
    REJECTED: { label: 'Rejected',        variant: 'danger'  as const, icon: XCircle },
  }
  const cfg = map[status]
  const Icon = cfg.icon
  return (
    <Badge variant={cfg.variant} size="sm">
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  )
}

// ── Reject dialog ──────────────────────────────────────────────────────────

function RejectDialog({
  doc,
  onClose,
}: {
  doc: InboxDoc
  onClose: () => void
}) {
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const { mutate: review, isPending } = useReviewDocument()

  const submit = () => {
    if (!reason) return
    review(
      { id: doc.id, action: 'reject', rejectionReason: reason, rejectionNote: note || undefined },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 text-[15px] font-[700] text-[var(--text-primary)]"
          style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
          Reject Document
        </h3>
        <p className="mb-4 text-[12.5px] text-[var(--text-tertiary)]">
          "{doc.label}" from {doc.client.name}
        </p>

        <div className="mb-3 flex flex-col gap-1.5">
          <label className="text-[12px] font-[500] text-[var(--text-primary)]">Reason *</label>
          <div className="grid grid-cols-1 gap-1.5">
            {REJECTION_REASONS.map((r) => (
              <label key={r.value} className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-all',
                reason === r.value
                  ? 'border-red-400/60 bg-red-50 dark:bg-red-950/20'
                  : 'border-[var(--border)] hover:border-[var(--border-strong)]',
              )}>
                <input type="radio" className="accent-red-500" value={r.value}
                  checked={reason === r.value} onChange={() => setReason(r.value)} />
                <span className="text-[12.5px] text-[var(--text-primary)]">{r.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-1.5">
          <label className="text-[12px] font-[500] text-[var(--text-primary)]">
            Additional note <span className="text-[var(--text-tertiary)]">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Explain what the client should resubmit…"
            className="min-h-[72px] w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
          />
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="danger"
            size="sm"
            disabled={!reason}
            loading={isPending}
            onClick={submit}
          >
            Reject Document
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Document row ───────────────────────────────────────────────────────────

function DocRow({ doc }: { doc: InboxDoc }) {
  const navigate = useNavigate()
  const [rejectOpen, setRejectOpen] = useState(false)
  const { mutate: review, isPending: reviewing } = useReviewDocument()
  const { mutate: download, isPending: downloading } = useDownloadUrl()

  const isUploaded = doc.status === 'UPLOADED'
  const isPending = doc.status === 'PENDING'

  return (
    <>
      <div className={cn(
        'group flex items-center gap-4 rounded-xl border bg-[var(--surface)] px-4 py-3.5 transition-all hover:border-[var(--border-strong)] hover:shadow-sm',
        isUploaded ? 'border-blue-200/80 dark:border-blue-800/30' : 'border-[var(--border)]',
      )}>
        {/* File icon */}
        <div className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
          isUploaded ? 'bg-blue-50 dark:bg-blue-950/40' : 'bg-[var(--bg-subtle)]',
        )}>
          <FileText className={cn('h-5 w-5', isUploaded ? 'text-blue-500' : 'text-[var(--text-tertiary)]')} />
        </div>

        {/* Doc info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-[600] text-[var(--text-primary)] truncate">{doc.label}</p>
            {doc.isRequired && (
              <span className="text-[10px] font-[600] uppercase tracking-wider text-red-500">Required</span>
            )}
          </div>

          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[var(--text-tertiary)]">
            <button
              type="button"
              onClick={() => navigate(`/clients/${doc.client.name}`)}
              className="font-[500] text-[var(--text-secondary)] hover:text-brand-600 transition-colors"
            >
              {doc.client.name}
            </button>
            <span className="hidden sm:inline">·</span>
            <button
              type="button"
              onClick={() => navigate(`/cases/${doc.caseId}`)}
              className="hidden sm:inline hover:text-brand-600 transition-colors"
            >
              {doc.case.title}
            </button>
            {doc.fileName && (
              <>
                <span>·</span>
                <span className="font-mono">{doc.fileName}</span>
                {doc.fileSizeBytes && <span>{fmtSize(doc.fileSizeBytes)}</span>}
              </>
            )}
            {doc.uploadedAt && (
              <>
                <span>·</span>
                <span>
                  {new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </>
            )}
          </div>

          {doc.status === 'REJECTED' && doc.rejectionNote && (
            <p className="mt-1 text-[11.5px] text-red-600 dark:text-red-400">
              Note: {doc.rejectionNote}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="flex-shrink-0 hidden sm:block">
          <DocStatusBadge status={doc.status} />
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {isUploaded && (
            <>
              <Button
                variant="ghost"
                size="xs"
                leftIcon={<Download className="h-3.5 w-3.5" />}
                loading={downloading}
                onClick={() => download(doc.id)}
              >
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button
                variant="secondary"
                size="xs"
                leftIcon={<XCircle className="h-3.5 w-3.5 text-red-500" />}
                onClick={() => setRejectOpen(true)}
              >
                <span className="hidden sm:inline">Reject</span>
              </Button>
              <Button
                variant="primary"
                size="xs"
                leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                loading={reviewing}
                onClick={() => review({ id: doc.id, action: 'accept' })}
              >
                Accept
              </Button>
            </>
          )}

          {(doc.status === 'ACCEPTED' || doc.status === 'REJECTED') && doc.fileName && (
            <Button
              variant="ghost"
              size="xs"
              leftIcon={<Download className="h-3.5 w-3.5" />}
              loading={downloading}
              onClick={() => download(doc.id)}
            >
              <span className="hidden sm:inline">Download</span>
            </Button>
          )}

          <button
            type="button"
            onClick={() => navigate(`/cases/${doc.caseId}`)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {rejectOpen && <RejectDialog doc={doc} onClose={() => setRejectOpen(false)} />}
    </>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function DocumentInboxPage() {
  const [filter, setFilter] = useState<'all' | 'uploaded' | 'pending'>('all')
  const [search, setSearch] = useState('')

  const { data: docs = [], isLoading, refetch, isFetching } = useDocumentInbox()

  const filtered = docs.filter((d) => {
    if (filter === 'uploaded' && d.status !== 'UPLOADED') return false
    if (filter === 'pending'  && d.status !== 'PENDING')  return false
    if (search) {
      const q = search.toLowerCase()
      return (
        d.label.toLowerCase().includes(q) ||
        d.client.name.toLowerCase().includes(q) ||
        d.case.title.toLowerCase().includes(q)
      )
    }
    return true
  })

  const uploadedCount = docs.filter((d) => d.status === 'UPLOADED').length
  const pendingCount  = docs.filter((d) => d.status === 'PENDING').length

  return (
    <div className="flex h-full flex-col">

      {/* ── Header ── */}
      <div className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-[800] tracking-tight text-[var(--text-primary)]"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                Document Inbox
              </h1>
              {uploadedCount > 0 && (
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-blue-500 px-1.5 text-[11px] font-[700] text-white">
                  {uploadedCount}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[12.5px] text-[var(--text-tertiary)]">
              Review documents uploaded by your clients
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { id: 'all',      label: 'All',           count: docs.length,    color: 'text-[var(--text-primary)]', bg: 'bg-[var(--bg-subtle)]' },
            { id: 'uploaded', label: 'Needs Review',  count: uploadedCount,  color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
            { id: 'pending',  label: 'Awaiting Upload', count: pendingCount, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
          ].map(({ id, label, count, color, bg }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id as any)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-[500] transition-all',
                filter === id
                  ? `border-transparent ${bg} ${color} shadow-sm`
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]',
              )}
            >
              <span className={cn('text-[18px] font-[800] leading-none', color)}
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                {count}
              </span>
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mt-3 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents, clients…"
            className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-[13px] outline-none transition-all placeholder:text-[var(--text-tertiary)] focus:border-brand-400 focus:shadow-[0_0_0_3px_rgba(18,110,71,0.1)] hover:border-[var(--border-strong)]"
          />
        </div>
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[72px] animate-pulse rounded-xl bg-[var(--border)]"
                style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-subtle)]">
              <Inbox className="h-7 w-7 text-[var(--text-tertiary)]" />
            </div>
            <div>
              <p className="text-[14px] font-[600] text-[var(--text-primary)]">
                {filter === 'all' ? 'Inbox is empty' : `No ${filter === 'uploaded' ? 'pending review' : 'awaiting upload'} documents`}
              </p>
              <p className="mt-1 text-[12.5px] text-[var(--text-tertiary)]">
                {filter === 'all'
                  ? 'Documents uploaded by clients will appear here.'
                  : 'Try switching the filter above.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {/* Needs review section */}
            {filter === 'all' && uploadedCount > 0 && (
              <div className="mb-1">
                <p className="mb-2 flex items-center gap-2 text-[11px] font-[600] uppercase tracking-wider text-blue-600 dark:text-blue-400"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                  <Eye className="h-3.5 w-3.5" />
                  Needs Review ({uploadedCount})
                </p>
                <div className="flex flex-col gap-2">
                  {filtered.filter(d => d.status === 'UPLOADED').map((d) => (
                    <DocRow key={d.id} doc={d} />
                  ))}
                </div>
              </div>
            )}

            {/* Other docs */}
            {filter !== 'uploaded' && (
              <>
                {filter === 'all' && filtered.filter(d => d.status !== 'UPLOADED').length > 0 && (
                  <p className="mt-2 mb-2 text-[11px] font-[600] uppercase tracking-wider text-[var(--text-tertiary)]"
                    style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                    All Other ({filtered.filter(d => d.status !== 'UPLOADED').length})
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  {filtered.filter(d => filter === 'all' ? d.status !== 'UPLOADED' : true).map((d) => (
                    <DocRow key={d.id} doc={d} />
                  ))}
                </div>
              </>
            )}

            {filter === 'uploaded' && (
              <div className="flex flex-col gap-2">
                {filtered.map((d) => <DocRow key={d.id} doc={d} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
