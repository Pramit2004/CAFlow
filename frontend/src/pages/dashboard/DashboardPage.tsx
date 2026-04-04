import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, FolderOpen, FileText, AlertTriangle,
  Calendar, CheckCircle2, IndianRupee, Plus,
  ArrowRight, ChevronRight, Clock, Flame, Zap,
} from 'lucide-react'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { formatCurrency } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/ui/skeleton'

// ─── Types ─────────────────────────────────────────────────────────────────
interface DashboardData {
  stats: {
    clients: number
    activeCases: number
    pendingDocs: number
    overdueCases: number
    newClientsThisMonth: number
  }
  upcomingDeadlines: {
    id: string; title: string; service_type: string; status: string
    deadline: string; client_name: string; days_left: number; fee_quoted: string
  }[]
  myTasks: {
    id: string; title: string; type: string; status: string
    due_date: string; case_title: string; service_type: string; client_name: string
  }[]
  fees: {
    totalBilled: number; totalReceived: number; outstanding: number
    collectionRate: number; paidCount: number; unpaidCount: number
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  DOCUMENTS_PENDING: { label: 'Docs Pending',   color: '#D97706', bg: '#FEF3C7' },
  DOCS_RECEIVED:     { label: 'Docs Received',  color: '#0EA5E9', bg: '#E0F2FE' },
  UNDER_PREPARATION: { label: 'In Prep',         color: '#C84B0F', bg: '#FFF4EE' },
  FILED:             { label: 'Filed',            color: '#16A34A', bg: '#DCFCE7' },
  COMPLETE:          { label: 'Complete',         color: '#16A34A', bg: '#DCFCE7' },
}

const TASK_TYPE_META: Record<string, { icon: string; label: string }> = {
  todo:            { icon: '📋', label: 'To-do' },
  call_client:     { icon: '📞', label: 'Call client' },
  internal_review: { icon: '🔍', label: 'Review' },
  waiting_client:  { icon: '⏳', label: 'Waiting' },
  waiting_govt:    { icon: '🏛', label: 'Govt' },
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

function getAvatarColor(name: string) {
  const palette = ['#C84B0F', '#D97706', '#0EA5E9', '#7C3AED', '#059669', '#DC2626', '#2563EB']
  return palette[name.charCodeAt(0) % palette.length]
}

function formatDaysLeft(days: number) {
  if (days < 0) return `${Math.abs(days)}d late`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `${days}d`
}

function getDaysColor(days: number): { color: string; bg: string } {
  if (days < 0) return { color: '#DC2626', bg: '#FEE2E2' }
  if (days <= 3) return { color: '#DC2626', bg: '#FEE2E2' }
  if (days <= 7) return { color: '#D97706', bg: '#FEF3C7' }
  return { color: '#6B6258', bg: '#F5F2EE' }
}

function getTaskDueLabel(dueDate: string | null) {
  if (!dueDate) return ''
  const due = new Date(dueDate)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (diff < 0) return 'Overdue'
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `In ${diff}d`
}

function getTaskDueColor(dueDate: string | null) {
  if (!dueDate) return '#A09890'
  const due = new Date(dueDate)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (diff < 0) return '#DC2626'
  if (diff === 0) return '#C84B0F'
  return '#A09890'
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-8 w-8 text-[11px]', lg: 'h-9 w-9 text-[12px]' }
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-[700] text-white ${sizes[size]}`}
      style={{ background: getAvatarColor(name), fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      {getInitials(name)}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number | string
  sub: string
  icon: React.ElementType
  color: string
  bg: string
  badge?: string
  badgeVariant?: 'up' | 'down' | 'neutral' | 'danger'
  animDelay?: number
}

function StatCard({ title, value, sub, icon: Icon, color, bg, badge, badgeVariant = 'neutral', animDelay = 0 }: StatCardProps) {
  const badgeColors = {
    up:      { color: '#16A34A', bg: '#DCFCE7' },
    down:    { color: '#DC2626', bg: '#FEE2E2' },
    neutral: { color: '#6B6258', bg: '#F5F2EE' },
    danger:  { color: '#DC2626', bg: '#FEE2E2' },
  }
  const bc = badgeColors[badgeVariant]

  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-white cursor-pointer group"
      style={{
        borderColor: '#EDE8E1',
        boxShadow: '0 1px 4px rgba(26,21,18,0.06), 0 4px 12px -2px rgba(26,21,18,0.05)',
        animation: `fadeIn 0.4s ease both`,
        animationDelay: `${animDelay}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(26,21,18,0.14), 0 4px 12px -2px rgba(26,21,18,0.08)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(26,21,18,0.06), 0 4px 12px -2px rgba(26,21,18,0.05)'
      }}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 h-full w-[3px] rounded-r-full" style={{ background: color }} />

      <div className="pl-4 pr-4 pt-4 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110" style={{ background: bg }}>
            <Icon className="h-[20px] w-[20px]" style={{ color }} strokeWidth={2} />
          </div>
          {badge && (
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-[700]" style={{ background: bc.bg, color: bc.color }}>
              {badge}
            </span>
          )}
        </div>
        <p
          className="text-[30px] font-[800] leading-none tracking-tight"
          style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}
        >
          {value}
        </p>
        <p className="mt-1.5 text-[12.5px] font-[600]" style={{ color: '#1A1512' }}>{title}</p>
        <p className="mt-0.5 text-[11.5px]" style={{ color: '#A09890' }}>{sub}</p>
      </div>
    </div>
  )
}

function SectionHeader({ icon: Icon, iconBg, iconColor, title, action }: {
  icon: React.ElementType; iconBg: string; iconColor: string; title: string; action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #EDE8E1' }}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: iconBg }}>
          <Icon className="h-[15px] w-[15px]" style={{ color: iconColor }} strokeWidth={2} />
        </div>
        <h3 className="text-[14px] font-[700]" style={{ color: '#1A1512', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
          {title}
        </h3>
      </div>
      {action}
    </div>
  )
}

function ViewAllBtn({ label = 'View all', onClick }: { label?: string; href?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-[600] transition-all duration-150"
      style={{ color: '#C84B0F' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF4EE' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {label} <ArrowRight className="h-3 w-3" />
    </button>
  )
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: '#F5F2EE' }}>
        <Icon className="h-5 w-5" style={{ color: '#A09890' }} strokeWidth={1.5} />
      </div>
      <p className="text-[13px]" style={{ color: '#A09890' }}>{message}</p>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  useEffect(() => {
    api.get('/api/dashboard')
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const name = user?.name?.split(' ')[0] ?? 'CA'
  const monthName = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })

  if (loading) return <DashboardSkeleton />

  const s = data?.stats
  const fees = data?.fees

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#F9F7F4' }}>
      <div className="mx-auto max-w-[1400px] p-4 md:p-6 space-y-5">

        {/* ── Page header ──────────────────────────────────── */}
        <div
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          style={{ animation: 'fadeIn 0.35s ease both' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h1
                className="text-[22px] md:text-[26px] font-[800] tracking-tight"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}
              >
                {greeting}, {name}
              </h1>
              <span className="text-[22px]">👋</span>
            </div>
            <p className="mt-0.5 text-[13.5px]" style={{ color: '#6B6258' }}>
              Here's what needs your attention today.
            </p>
          </div>
          <button
            onClick={() => navigate('/cases/new')}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-[700] text-white self-start sm:self-auto transition-all duration-200 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #C84B0F 0%, #F97316 100%)',
              boxShadow: '0 4px 16px rgba(200,75,15,0.32)',
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(200,75,15,0.42)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(200,75,15,0.32)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New Case
          </button>
        </div>

        {/* ── Stat grid ────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            title="Active Clients" value={s?.clients ?? 0}
            sub={`${s?.newClientsThisMonth ?? 0} added this month`}
            icon={Users} color="#0EA5E9" bg="#E0F2FE"
            badge={`+${s?.newClientsThisMonth ?? 0} new`} badgeVariant="up"
            animDelay={0}
          />
          <StatCard
            title="Active Cases" value={s?.activeCases ?? 0}
            sub="Across all service types"
            icon={FolderOpen} color="#C84B0F" bg="#FFF4EE"
            badge={`${s?.activeCases ?? 0} open`} badgeVariant="neutral"
            animDelay={60}
          />
          <StatCard
            title="Docs Pending" value={s?.pendingDocs ?? 0}
            sub="Awaiting client upload"
            icon={FileText} color="#D97706" bg="#FEF3C7"
            badge={s?.pendingDocs ? `${s.pendingDocs} items` : 'All clear'} badgeVariant={s?.pendingDocs ? 'down' : 'up'}
            animDelay={120}
          />
          <StatCard
            title="Overdue Cases" value={s?.overdueCases ?? 0}
            sub="Deadline already passed"
            icon={AlertTriangle} color="#DC2626" bg="#FEE2E2"
            badge={s?.overdueCases ? 'Action needed' : 'All good'} badgeVariant={s?.overdueCases ? 'danger' : 'up'}
            animDelay={180}
          />
        </div>

        {/* ── Middle row: Deadlines + Fee Summary ──────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* Upcoming deadlines — 2/3 width */}
          <div
            className="lg:col-span-2 overflow-hidden rounded-2xl border bg-white"
            style={{ borderColor: '#EDE8E1', boxShadow: '0 1px 4px rgba(26,21,18,0.06)', animation: 'fadeIn 0.4s ease 0.1s both' }}
          >
            <SectionHeader
              icon={Calendar} iconBg="#FFF4EE" iconColor="#C84B0F"
              title="Upcoming Deadlines"
              action={<ViewAllBtn onClick={() => navigate('/cases')} />}
            />

            {!data?.upcomingDeadlines?.length ? (
              <EmptyState icon={Calendar} message="No upcoming deadlines in the next 30 days" />
            ) : (
              <div>
                {data.upcomingDeadlines.map((item, i) => {
                  const status = STATUS_META[item.status] ?? { label: item.status, color: '#6B6258', bg: '#F5F2EE' }
                  const daysColor = getDaysColor(item.days_left)
                  const isUrgent = item.days_left <= 3
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors duration-100"
                      style={{ borderBottom: i < data.upcomingDeadlines.length - 1 ? '1px solid #F5F2EE' : 'none' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAF8' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                      onClick={() => navigate(`/cases/${item.id}`)}
                    >
                      <Avatar name={item.client_name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[13px] font-[600] truncate" style={{ color: '#1A1512' }}>
                            {item.client_name}
                          </p>
                          {isUrgent && <Flame className="h-3 w-3 flex-shrink-0" style={{ color: '#DC2626' }} />}
                        </div>
                        <p className="text-[11.5px] truncate" style={{ color: '#A09890' }}>
                          {item.title} · {item.service_type}
                        </p>
                      </div>
                      <span
                        className="flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10.5px] font-[600] hidden sm:inline-flex"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                      <div
                        className="flex-shrink-0 rounded-lg px-2.5 py-1 text-[11.5px] font-[800] min-w-[44px] text-center"
                        style={{ background: daysColor.bg, color: daysColor.color, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                      >
                        {formatDaysLeft(item.days_left)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Fee Summary — 1/3 width */}
          <div
            className="overflow-hidden rounded-2xl border bg-white"
            style={{ borderColor: '#EDE8E1', boxShadow: '0 1px 4px rgba(26,21,18,0.06)', animation: 'fadeIn 0.4s ease 0.15s both' }}
          >
            <SectionHeader
              icon={IndianRupee} iconBg="#FFF4EE" iconColor="#C84B0F"
              title="Fees — This Month"
              action={
                <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-[600]"
                  style={{ background: '#DCFCE7', color: '#16A34A' }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" style={{ animation: 'pulse 2s infinite' }} />
                  {monthName}
                </span>
              }
            />

            <div className="p-5 space-y-4">
              <div>
                <p className="text-[11px] font-[500] mb-1.5 uppercase tracking-wider" style={{ color: '#A09890' }}>Total Billed</p>
                <p
                  className="text-[30px] font-[800] leading-none tracking-tight"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}
                >
                  {formatCurrency(fees?.totalBilled ?? 0)}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Zap className="h-3 w-3" style={{ color: '#16A34A' }} />
                  <p className="text-[12px] font-[600]" style={{ color: '#16A34A' }}>
                    {fees?.paidCount ?? 0} invoices paid
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl p-3.5" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <p className="text-[10.5px] font-[500] mb-1.5 uppercase tracking-wider" style={{ color: '#16A34A' }}>Received</p>
                  <p className="text-[18px] font-[800]" style={{ color: '#16A34A', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                    {formatCurrency(fees?.totalReceived ?? 0)}
                  </p>
                </div>
                <div className="rounded-xl p-3.5" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <p className="text-[10.5px] font-[500] mb-1.5 uppercase tracking-wider" style={{ color: '#D97706' }}>Outstanding</p>
                  <p className="text-[18px] font-[800]" style={{ color: '#D97706', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                    {formatCurrency(fees?.outstanding ?? 0)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-[500]" style={{ color: '#A09890' }}>Collection rate</span>
                  <span className="text-[13px] font-[800]" style={{ color: '#1A1512', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                    {fees?.collectionRate ?? 0}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: '#EDE8E1' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${fees?.collectionRate ?? 0}%`,
                      background: 'linear-gradient(90deg, #C84B0F 0%, #F97316 60%, #F5A623 100%)',
                      transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => navigate('/invoices')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-[13px] font-[600] transition-all duration-150"
                style={{ borderColor: '#EDE8E1', color: '#1A1512' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F9F7F4'; e.currentTarget.style.borderColor = '#D9D1C7' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#EDE8E1' }}
              >
                View full report <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom row: Tasks + Quick Actions ────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* My Tasks */}
          <div
            className="overflow-hidden rounded-2xl border bg-white"
            style={{ borderColor: '#EDE8E1', boxShadow: '0 1px 4px rgba(26,21,18,0.06)', animation: 'fadeIn 0.4s ease 0.2s both' }}
          >
            <SectionHeader
              icon={CheckCircle2} iconBg="#F5F2EE" iconColor="#5E5650"
              title="My Tasks"
              action={
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-[700]"
                    style={{ background: '#FFF4EE', color: '#C84B0F' }}
                  >
                    {(data?.myTasks?.length ?? 0) - completedTasks.size}
                  </span>
                  <ViewAllBtn onClick={() => navigate('/tasks')} />
                </div>
              }
            />

            {!data?.myTasks?.length ? (
              <EmptyState icon={CheckCircle2} message="You're all caught up!" />
            ) : (
              <div>
                {data.myTasks.map((task, i) => {
                  const isDone = completedTasks.has(task.id)
                  const meta = TASK_TYPE_META[task.type] ?? { icon: '📋', label: 'Task' }
                  const dueLabel = getTaskDueLabel(task.due_date)
                  const dueColor = getTaskDueColor(task.due_date)

                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-all duration-150"
                      style={{
                        borderBottom: i < data.myTasks.length - 1 ? '1px solid #F5F2EE' : 'none',
                        opacity: isDone ? 0.45 : 1,
                      }}
                      onMouseEnter={(e) => { if (!isDone) e.currentTarget.style.background = '#FAFAF8' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      {/* Custom checkbox */}
                      <button
                        className="mt-0.5 h-4.5 w-4.5 flex-shrink-0 rounded-full border-2 transition-all duration-200 flex items-center justify-center"
                        style={{
                          borderColor: isDone ? '#C84B0F' : '#D9D1C7',
                          background: isDone ? '#C84B0F' : 'transparent',
                          width: 18, height: 18, minWidth: 18,
                        }}
                        onClick={() => {
                          const next = new Set(completedTasks)
                          isDone ? next.delete(task.id) : next.add(task.id)
                          setCompletedTasks(next)
                        }}
                      >
                        {isDone && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[13px] font-[500] leading-snug"
                          style={{ color: '#1A1512', textDecoration: isDone ? 'line-through' : 'none' }}
                        >
                          {task.title}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px]">{meta.icon}</span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-[600]"
                            style={{ background: '#F5F2EE', color: '#6B6258' }}
                          >
                            {task.client_name} · {task.service_type}
                          </span>
                          {dueLabel && (
                            <span className="text-[10.5px] font-[600]" style={{ color: dueColor }}>
                              {dueLabel}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: '#F5F2EE' }}
                      >
                        <ChevronRight className="h-3 w-3" style={{ color: '#6B6258' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Action panel */}
          <div
            className="overflow-hidden rounded-2xl border bg-white"
            style={{ borderColor: '#EDE8E1', boxShadow: '0 1px 4px rgba(26,21,18,0.06)', animation: 'fadeIn 0.4s ease 0.25s both' }}
          >
            <SectionHeader
              icon={Clock} iconBg="#F5F2EE" iconColor="#5E5650"
              title="Quick Actions"
            />

            <div className="p-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Add Client', desc: 'Onboard a new client', icon: Users, color: '#0EA5E9', bg: '#E0F2FE', path: '/clients/new' },
                { label: 'New Case', desc: 'Start a case file', icon: FolderOpen, color: '#C84B0F', bg: '#FFF4EE', path: '/cases/new' },
                { label: 'Create Invoice', desc: 'Bill a client', icon: IndianRupee, color: '#16A34A', bg: '#DCFCE7', path: '/invoices/new' },
                { label: 'Add Task', desc: 'Track action item', icon: CheckCircle2, color: '#7C3AED', bg: '#F3E8FF', path: '/tasks/new' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="flex items-start gap-3 rounded-xl p-3.5 text-left transition-all duration-150 group"
                  style={{ border: '1.5px solid #EDE8E1', background: '#FAFAF8' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = item.color; e.currentTarget.style.boxShadow = `0 4px 16px -2px ${item.color}22` }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#FAFAF8'; e.currentTarget.style.borderColor = '#EDE8E1'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                    style={{ background: item.bg }}
                  >
                    <item.icon className="h-4 w-4" style={{ color: item.color }} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-[700]" style={{ color: '#1A1512', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                      {item.label}
                    </p>
                    <p className="text-[11px]" style={{ color: '#A09890' }}>{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Status distribution mini chart */}
            {data?.upcomingDeadlines?.length ? (
              <div className="mx-4 mb-4 rounded-xl p-4" style={{ background: '#F9F7F4', border: '1px solid #EDE8E1' }}>
                <p className="text-[11px] font-[600] mb-3 uppercase tracking-wider" style={{ color: '#A09890' }}>
                  Case Status Breakdown
                </p>
                <div className="space-y-2">
                  {Object.entries(
                    data.upcomingDeadlines.reduce((acc, d) => {
                      acc[d.status] = (acc[d.status] ?? 0) + 1
                      return acc
                    }, {} as Record<string, number>)
                  ).map(([status, cnt]) => {
                    const meta = STATUS_META[status]
                    const pct = Math.round((cnt / data.upcomingDeadlines.length) * 100)
                    if (!meta) return null
                    return (
                      <div key={status}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[11px] font-[500]" style={{ color: '#6B6258' }}>{meta.label}</span>
                          <span className="text-[11px] font-[700]" style={{ color: '#1A1512' }}>{cnt}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: '#EDE8E1' }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: meta.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile bottom spacer */}
        <div className="h-4 lg:hidden" />
      </div>
    </div>
  )
}
