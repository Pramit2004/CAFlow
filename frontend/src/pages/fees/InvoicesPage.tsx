import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Receipt, Plus, Search, Download, Send,
  CheckCircle2, Clock, AlertCircle, ChevronRight,
  IndianRupee, MoreHorizontal, X,
} from 'lucide-react'
import { api } from '@/services/api'
import { cn, formatCurrency } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────

interface Invoice {
  id: string
  invoiceNumber: string
  caseId: string
  clientId: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  amount: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  dueDate: string | null
  issuedAt: string | null
  paidAt: string | null
  notes: string | null
  createdAt: string
  case?: { title: string; serviceType: string }
  client?: { name: string }
}

const STATUS_CFG: Record<Invoice['status'], { label: string; bg: string; color: string; border: string; icon: React.ElementType }> = {
  DRAFT:     { label: 'Draft',     bg: '#F9F7F4', color: '#6B6258', border: '#EDE8E1',  icon: Clock },
  SENT:      { label: 'Sent',      bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE',  icon: Send },
  PAID:      { label: 'Paid',      bg: '#F0FDF4', color: '#16A34A', border: '#86EFAC',  icon: CheckCircle2 },
  OVERDUE:   { label: 'Overdue',   bg: '#FEF2F2', color: '#DC2626', border: '#FCA5A5',  icon: AlertCircle },
  CANCELLED: { label: 'Cancelled', bg: '#F9F7F4', color: '#A09890', border: '#EDE8E1',  icon: X },
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

// ── Hooks ──────────────────────────────────────────────────────────────────

function useInvoices(params: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (params.status) qs.set('status', params.status)
      if (params.search) qs.set('search', params.search)
      const res = await api.get<{ success: boolean; data: Invoice[]; meta: any }>(
        `/api/invoices?${qs}`,
      )
      return res.data
    },
    staleTime: 30_000,
    placeholderData: (p) => p,
  })
}

function useUpdateInvoiceStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Invoice['status'] }) => {
      const res = await api.patch(`/api/invoices/${id}`, { status })
      return res.data
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      toast.success(`Invoice marked as ${STATUS_CFG[status]?.label ?? status}`)
    },
    onError: () => toast.error('Failed to update invoice'),
  })
}

// ── Row menu ───────────────────────────────────────────────────────────────

function InvoiceMenu({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false)
  const { mutate: update } = useUpdateInvoiceStatus()

  const actions = [
    invoice.status === 'DRAFT' && { label: 'Mark as Sent', fn: () => update({ id: invoice.id, status: 'SENT' }) },
    invoice.status === 'SENT'  && { label: 'Mark as Paid', fn: () => update({ id: invoice.id, status: 'PAID' }) },
    invoice.status === 'SENT'  && { label: 'Mark Overdue', fn: () => update({ id: invoice.id, status: 'OVERDUE' }) },
  ].filter(Boolean) as { label: string; fn: () => void }[]

  if (actions.length === 0) return null

  return (
    <div className="relative">
      <button type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className="flex h-7 w-7 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-100"
        style={{ color: '#6B6258' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F2EE' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1.5 w-44 overflow-hidden"
            style={{ borderRadius: 12, border: '1px solid #EDE8E1', background: 'white', boxShadow: '0 16px 40px -6px rgba(26,21,18,0.16)' }}>
            {actions.map(({ label, fn }) => (
              <button key={label} type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(false); fn() }}
                className="w-full px-4 py-2.5 text-left text-[13px] transition-colors duration-100"
                style={{ color: '#1A1512' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F9F7F4' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function InvoiceSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} style={{ borderBottom: '1px solid #F5F2EE', animationDelay: `${i * 40}ms` }}
          className="animate-pulse">
          <td className="px-5 py-4">
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 rounded-full" style={{ background: '#F0ECE7' }} />
              <div className="h-3 w-16 rounded-full" style={{ background: '#F5F2EE' }} />
            </div>
          </td>
          <td className="px-5 py-4"><div className="h-3.5 w-32 rounded-full" style={{ background: '#F0ECE7' }} /></td>
          <td className="px-5 py-4"><div className="h-6 w-16 rounded-full" style={{ background: '#F0ECE7' }} /></td>
          <td className="px-5 py-4"><div className="h-3.5 w-20 rounded-full" style={{ background: '#F0ECE7' }} /></td>
          <td className="px-5 py-4"><div className="h-3.5 w-20 rounded-full" style={{ background: '#F0ECE7' }} /></td>
          <td className="px-5 py-4" />
        </tr>
      ))}
    </>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading, isFetching } = useInvoices({ status: statusFilter || undefined, search: search || undefined })
  const invoices = data?.data ?? []

  const totalBilled  = invoices.reduce((s, inv) => s + (inv.totalAmount ?? 0), 0)
  const totalPaid    = invoices.reduce((s, inv) => s + (inv.paidAmount ?? 0), 0)
  const pendingAmt   = invoices
    .filter((i) => i.status === 'SENT' || i.status === 'OVERDUE')
    .reduce((s, inv) => s + ((inv.totalAmount ?? 0) - (inv.paidAmount ?? 0)), 0)

  const countByStatus = invoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex h-full flex-col" style={{ background: '#F9F7F4' }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-[800] tracking-tight"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}>
              Fees &amp; Billing
            </h1>
            <p className="mt-0.5 text-[13px]" style={{ color: '#6B6258' }}>
              Manage invoices and track payments from clients
            </p>
          </div>
          <button
            onClick={() => toast('Create Invoice coming soon')}
            className="flex h-9 items-center gap-2 rounded-xl px-4 text-[13px] font-[700] text-white transition-all duration-150 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #C84B0F 0%, #F97316 100%)',
              boxShadow: '0 4px 14px rgba(200,75,15,0.30)',
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(200,75,15,0.42)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(200,75,15,0.30)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} /> New Invoice
          </button>
        </div>

        {/* Summary cards */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Total Billed',  value: totalBilled,  color: '#1A1512', icon: Receipt,      bg: '#F9F7F4', border: '#EDE8E1' },
            { label: 'Collected',     value: totalPaid,    color: '#16A34A', icon: CheckCircle2, bg: '#F0FDF4', border: '#86EFAC' },
            { label: 'Outstanding',   value: pendingAmt,   color: '#D97706', icon: Clock,        bg: '#FFFBEB', border: '#FDE68A' },
          ].map(({ label, value, color, icon: Icon, bg, border }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
              style={{ background: 'white', border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(26,21,18,0.05)' }}>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: bg }}>
                <Icon className="h-5 w-5" style={{ color }} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[20px] font-[800] leading-none"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color }}>
                  {isLoading ? '—' : formatCurrency(value)}
                </p>
                <p className="mt-0.5 text-[11px] font-[500]" style={{ color: '#A09890' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="mx-6 mb-6 flex flex-1 flex-col overflow-hidden rounded-2xl"
        style={{
          background: 'white',
          border: '1px solid #EDE8E1',
          boxShadow: '0 4px 24px -4px rgba(26,21,18,0.10), 0 1px 4px rgba(26,21,18,0.06)',
        }}
      >
        {/* Toolbar */}
        <div className="flex flex-shrink-0 flex-wrap items-center gap-3 px-5 py-3.5" style={{ borderBottom: '1px solid #F5F2EE' }}>
          <div className="relative" style={{ width: 280 }}>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: '#A09890' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices or clients…"
              className="h-9 w-full rounded-xl border pl-10 pr-3 text-[13px] outline-none transition-all duration-150 bg-white"
              style={{ borderColor: '#EDE8E1', color: '#1A1512' }}
              onFocus={(e) => { e.target.style.borderColor = '#C84B0F'; e.target.style.boxShadow = '0 0 0 3px rgba(200,75,15,0.12)' }}
              onBlur={(e) => { e.target.style.borderColor = '#EDE8E1'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Status filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button type="button" onClick={() => setStatusFilter('')}
              className="rounded-lg px-3 py-1.5 text-[12px] font-[600] transition-all duration-150"
              style={{
                background: !statusFilter ? '#1A1512' : '#F5F2EE',
                color: !statusFilter ? 'white' : '#6B6258',
              }}>
              All ({invoices.length})
            </button>
            {(['DRAFT', 'SENT', 'PAID', 'OVERDUE'] as const).map((s) => {
              const cfg = STATUS_CFG[s]
              return (
                <button key={s} type="button" onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                  className="rounded-lg px-3 py-1.5 text-[12px] font-[600] transition-all duration-150"
                  style={{
                    background: statusFilter === s ? cfg.bg : '#F5F2EE',
                    color: statusFilter === s ? cfg.color : '#6B6258',
                    border: statusFilter === s ? `1px solid ${cfg.border}` : '1px solid transparent',
                  }}>
                  {cfg.label} {countByStatus[s] ? `(${countByStatus[s]})` : ''}
                </button>
              )
            })}
          </div>

          {isFetching && !isLoading && (
            <div className="h-4 w-4 rounded-full border-2 border-[#FFE4D0] border-t-[#C84B0F] ml-auto" style={{ animation: 'spin 0.7s linear infinite' }} />
          )}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full" style={{ minWidth: 640 }}>
            <thead className="sticky top-0" style={{ background: '#FAFAF8', borderBottom: '1px solid #EDE8E1' }}>
              <tr>
                {['Invoice', 'Client / Case', 'Status', 'Amount', 'Due Date', ''].map((h, i) => (
                  <th key={i} className="px-5 py-3 text-left"
                    style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: '#A09890', textTransform: 'uppercase', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <InvoiceSkeleton />
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center gap-4 py-20 text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: '#F5F2EE' }}>
                        <IndianRupee className="h-7 w-7" style={{ color: '#A09890' }} strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[14px] font-[700]" style={{ color: '#1A1512', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                          No invoices found
                        </p>
                        <p className="mt-1 text-[13px]" style={{ color: '#A09890' }}>
                          {search || statusFilter ? 'Try clearing filters.' : 'Create your first invoice to get started.'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : invoices.map((inv, idx) => {
                const cfg = STATUS_CFG[inv.status]
                const StatusIcon = cfg.icon
                const svc = SERVICE_COLORS[inv.case?.serviceType ?? 'OTHER'] ?? SERVICE_COLORS.OTHER
                const isLastRow = idx === invoices.length - 1

                return (
                  <tr key={inv.id}
                    className="group cursor-pointer transition-colors duration-100"
                    style={{ borderBottom: isLastRow ? 'none' : '1px solid #F5F2EE' }}
                    onClick={() => navigate(`/cases/${inv.caseId}`)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAF8' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Invoice # */}
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-[700]" style={{ color: '#1A1512', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                        {inv.invoiceNumber}
                      </p>
                      <p className="text-[11px]" style={{ color: '#A09890' }}>
                        {new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </p>
                    </td>

                    {/* Client / Case */}
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-[600]" style={{ color: '#1A1512' }}>
                        {inv.client?.name ?? '—'}
                      </p>
                      {inv.case && (
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className="rounded-md px-1.5 py-0.5 text-[9.5px] font-[700]"
                            style={{ background: svc.bg, color: svc.color }}>
                            {inv.case.serviceType}
                          </span>
                          <span className="text-[11px] truncate max-w-[140px]" style={{ color: '#A09890' }}>
                            {inv.case.title}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-[700]"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-[700]" style={{ color: '#1A1512' }}>
                        {formatCurrency(inv.totalAmount ?? 0)}
                      </p>
                      {(inv.paidAmount ?? 0) > 0 && inv.status !== 'PAID' && (
                        <p className="text-[11px]" style={{ color: '#16A34A' }}>
                          +{formatCurrency(inv.paidAmount)} paid
                        </p>
                      )}
                    </td>

                    {/* Due date */}
                    <td className="px-5 py-3.5">
                      {inv.dueDate ? (
                        <span className="text-[12.5px]" style={{ color: '#6B6258' }}>
                          {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                      ) : (
                        <span style={{ color: '#C9BFB3' }}>—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <InvoiceMenu invoice={inv} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
