import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar, AlertTriangle, Clock, ChevronRight,
  CheckCircle2, Flame, TrendingUp,
} from 'lucide-react'
import { api } from '@/services/api'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────

interface DeadlineCase {
  id: string
  title: string
  clientId: string
  clientName: string
  serviceType: string
  deadline: string
  status: string
  daysLeft: number
}

interface DeadlineSummary {
  overdue: number
  dueSoon: number   // ≤7 days
  upcoming: number  // 8–30 days
}

// ── Colors ─────────────────────────────────────────────────────────────────

const SERVICE_COLORS: Record<string, { bg: string; color: string }> = {
  ITR:         { bg: '#EFF6FF', color: '#1D4ED8' },
  GST:         { bg: '#F5F3FF', color: '#6D28D9' },
  TDS:         { bg: '#FFFBEB', color: '#D97706' },
  ROC:         { bg: '#FDF2F8', color: '#BE185D' },
  AUDIT:       { bg: '#FEF2F2', color: '#DC2626' },
  ADVANCE_TAX: { bg: '#ECFEFF', color: '#0E7490' },
  OTHER:       { bg: '#F9F7F4', color: '#6B6258' },
}

function urgencyStyle(daysLeft: number): { color: string; bg: string; label: string } {
  if (daysLeft < 0) return { color: '#DC2626', bg: '#FEF2F2', label: `${Math.abs(daysLeft)}d overdue` }
  if (daysLeft === 0) return { color: '#DC2626', bg: '#FEF2F2', label: 'Due today' }
  if (daysLeft <= 3) return { color: '#D97706', bg: '#FFFBEB', label: `${daysLeft}d left` }
  if (daysLeft <= 7) return { color: '#D97706', bg: '#FFFBEB', label: `${daysLeft}d left` }
  return { color: '#6B6258', bg: '#F5F2EE', label: `${daysLeft}d left` }
}

// ── Hooks ──────────────────────────────────────────────────────────────────

function useDeadlines(days: number) {
  return useQuery({
    queryKey: ['deadlines', 'upcoming', days],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: DeadlineCase[] }>(
        `/api/deadlines/upcoming?days=${days}`,
      )
      return res.data.data
    },
    staleTime: 60_000,
  })
}

function useOverdue() {
  return useQuery({
    queryKey: ['deadlines', 'overdue'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: DeadlineCase[] }>('/api/deadlines/overdue')
      return res.data.data
    },
    staleTime: 60_000,
  })
}

function useDeadlineSummary() {
  return useQuery({
    queryKey: ['deadlines', 'summary'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: DeadlineSummary }>('/api/deadlines/summary')
      return res.data.data
    },
    staleTime: 60_000,
  })
}

// ── Case Row ───────────────────────────────────────────────────────────────

function DeadlineRow({ item }: { item: DeadlineCase }) {
  const navigate = useNavigate()
  const urg = urgencyStyle(item.daysLeft)
  const svc = SERVICE_COLORS[item.serviceType] ?? SERVICE_COLORS.OTHER

  return (
    <div
      className="group flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors duration-100"
      style={{ borderBottom: '1px solid #F9F7F4' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAF8' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      onClick={() => navigate(`/cases/${item.id}`)}
    >
      {/* Service badge */}
      <span className="rounded-lg px-2 py-1 text-[10.5px] font-[700] flex-shrink-0"
        style={{ background: svc.bg, color: svc.color }}>
        {item.serviceType}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-[13px] font-[600]" style={{ color: '#1A1512' }}>
          {item.title}
        </p>
        <p className="text-[11.5px]" style={{ color: '#6B6258' }}>{item.clientName}</p>
      </div>

      {/* Deadline */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="rounded-lg px-2.5 py-0.5 text-[11px] font-[700]"
          style={{ background: urg.bg, color: urg.color }}>
          {urg.label}
        </span>
        <span className="text-[10.5px]" style={{ color: '#A09890' }}>
          {new Date(item.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
        </span>
      </div>

      <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: '#A09890' }} />
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function DeadlineSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5 animate-pulse"
          style={{ borderBottom: '1px solid #F5F2EE', opacity: 1 - i * 0.15 }}>
          <div className="h-7 w-12 rounded-lg flex-shrink-0" style={{ background: '#F0ECE7' }} />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-2/5 rounded-full" style={{ background: '#F0ECE7' }} />
            <div className="h-3 w-1/4 rounded-full" style={{ background: '#F5F2EE' }} />
          </div>
          <div className="h-6 w-16 rounded-lg" style={{ background: '#F0ECE7' }} />
        </div>
      ))}
    </>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [tab, setTab] = useState<'overdue' | '7d' | '30d' | '90d'>('30d')
  const dayMap = { '7d': 7, '30d': 30, '90d': 90 } as const

  const { data: summary, isLoading: loadingSummary } = useDeadlineSummary()
  const { data: overdue = [], isLoading: loadingOverdue } = useOverdue()
  const { data: upcoming = [], isLoading: loadingUpcoming } = useDeadlines(
    tab === 'overdue' ? 0 : dayMap[tab],
  )

  const items = tab === 'overdue' ? overdue : upcoming
  const isLoading = tab === 'overdue' ? loadingOverdue : loadingUpcoming

  return (
    <div className="flex h-full flex-col" style={{ background: '#F9F7F4' }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <div>
          <h1 className="text-[24px] font-[800] tracking-tight"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}>
            Compliance Calendar
          </h1>
          <p className="mt-0.5 text-[13px]" style={{ color: '#6B6258' }}>
            Track deadlines and filing dates across all your cases
          </p>
        </div>

        {/* Summary stat pills */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          {[
            {
              label: 'Overdue', value: summary?.overdue ?? 0,
              icon: AlertTriangle, color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5',
            },
            {
              label: 'Due in 7 days', value: summary?.dueSoon ?? 0,
              icon: Flame, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
            },
            {
              label: 'Upcoming (30d)', value: summary?.upcoming ?? 0,
              icon: TrendingUp, color: '#C84B0F', bg: '#FFF4EE', border: '#FED7AA',
            },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl px-4 py-3"
              style={{ background: 'white', border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(26,21,18,0.05)' }}>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: bg }}>
                <Icon className="h-4.5 w-4.5" style={{ color }} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[22px] font-[800] leading-none"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color }}>
                  {loadingSummary ? '—' : value}
                </p>
                <p className="text-[11px] font-[500]" style={{ color }}>{label}</p>
              </div>
            </div>
          ))}
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
        {/* Tab toolbar */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 px-5 py-3.5"
          style={{ borderBottom: '1px solid #EDE8E1' }}>
          <div className="flex items-center gap-1 rounded-xl border p-1" style={{ borderColor: '#EDE8E1' }}>
            {([
              { id: 'overdue', label: 'Overdue' },
              { id: '7d',     label: 'Next 7 days' },
              { id: '30d',    label: 'Next 30 days' },
              { id: '90d',    label: 'Next 90 days' },
            ] as const).map(({ id, label }) => (
              <button key={id} type="button" onClick={() => setTab(id)}
                className="rounded-lg px-3 py-1.5 text-[12px] font-[600] transition-all duration-150"
                style={{
                  background: tab === id ? '#1A1512' : 'transparent',
                  color: tab === id ? 'white' : '#6B6258',
                }}>
                {label}
                {id === 'overdue' && (summary?.overdue ?? 0) > 0 && (
                  <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-[700]"
                    style={{ background: '#DC2626', color: 'white' }}>
                    {summary.overdue}
                  </span>
                )}
              </button>
            ))}
          </div>

          <span className="text-[12px]" style={{ color: '#A09890' }}>
            {isLoading ? '…' : `${items.length} case${items.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <DeadlineSkeleton />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: '#F5F2EE' }}>
                {tab === 'overdue'
                  ? <CheckCircle2 className="h-7 w-7" style={{ color: '#16A34A' }} strokeWidth={1.5} />
                  : <Calendar className="h-7 w-7" style={{ color: '#A09890' }} strokeWidth={1.5} />
                }
              </div>
              <div>
                <p className="text-[14px] font-[700]" style={{ color: '#1A1512', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                  {tab === 'overdue' ? 'No overdue cases' : 'No upcoming deadlines'}
                </p>
                <p className="mt-1 text-[13px]" style={{ color: '#A09890' }}>
                  {tab === 'overdue' ? 'Great — all cases are on track!' : `No cases due in the next ${tab === '7d' ? '7' : tab === '30d' ? '30' : '90'} days.`}
                </p>
              </div>
            </div>
          ) : (
            items.map((item) => <DeadlineRow key={item.id} item={item} />)
          )}
        </div>
      </div>
    </div>
  )
}
