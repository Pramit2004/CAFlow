import { useState } from 'react'
import {
  Users, FolderOpen, FileText, AlertTriangle,
  Clock, CheckCircle2, ArrowRight, Calendar,
  TrendingUp, Plus, ChevronRight, BarChart3, IndianRupee,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { formatCurrency } from '@/lib/utils'

// ─── Static mock data (will be replaced by real API calls) ─────────────────
const STATS = [
  { title: 'Active Clients', value: '142', sub: '12 added this month', icon: Users, trend: '+8%', trendUp: true, color: '#0EA5E9', bg: '#E0F2FE' },
  { title: 'Active Cases', value: '38', sub: '6 due this week', icon: FolderOpen, trend: '+5', trendUp: true, color: '#C84B0F', bg: '#FFF4EE' },
  { title: 'Docs Pending', value: '24', sub: 'From 16 clients', icon: FileText, trend: '−12 vs last wk', trendUp: true, color: '#D97706', bg: '#FEF3C7' },
  { title: 'Overdue Cases', value: '3', sub: 'Need action now', icon: AlertTriangle, trend: '−2 this week', trendUp: true, color: '#DC2626', bg: '#FEE2E2' },
]

const DEADLINES = [
  { name: 'Amit Patel', service: 'ITR FY2024-25', daysLeft: 2, status: 'DOCUMENTS_PENDING' },
  { name: 'Priya Shah', service: 'GST GSTR-3B', daysLeft: 4, status: 'UNDER_PREPARATION' },
  { name: 'Ravi Kumar', service: 'TDS Q2 Return', daysLeft: 7, status: 'DOCS_RECEIVED' },
  { name: 'Meena Desai', service: 'ROC Annual Filing', daysLeft: 9, status: 'DOCUMENTS_PENDING' },
  { name: 'Suresh Joshi', service: 'ITR FY2024-25', daysLeft: 12, status: 'UNDER_PREPARATION' },
]

const ACTIVITY = [
  { emoji: '📄', client: 'Amit Patel', action: 'uploaded Form 16', time: '5 min ago' },
  { emoji: '🔄', client: 'Priya Shah', action: 'case moved to preparation', time: '1 hr ago' },
  { emoji: '💳', client: 'Ravi Kumar', action: 'paid invoice ₹8,000', time: '2 hr ago' },
  { emoji: '📁', client: 'Meena Desai', action: 'uploaded 3 documents', time: '3 hr ago' },
  { emoji: '✅', client: 'Neha Sharma', action: 'case marked complete', time: 'Yesterday' },
]

const TASKS = [
  { title: 'Call Amit Patel about Form 16 mismatch', case: 'ITR FY24-25', due: 'Today', priority: 'high' as const },
  { title: 'Verify TDS data for Priya Shah', case: 'TDS Q2', due: 'Tomorrow', priority: 'medium' as const },
  { title: 'Send advance tax reminder', case: 'Bulk Action', due: 'In 3 days', priority: 'low' as const },
  { title: 'Review audit report — Sunrise Traders', case: 'Audit FY24', due: 'In 5 days', priority: 'medium' as const },
]

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  DOCUMENTS_PENDING: { label: 'Docs Pending', color: '#D97706', bg: '#FEF3C7' },
  DOCS_RECEIVED:     { label: 'Docs Received', color: '#0EA5E9', bg: '#E0F2FE' },
  UNDER_PREPARATION: { label: 'In Preparation', color: '#C84B0F', bg: '#FFF4EE' },
  FILED:             { label: 'Filed', color: '#16A34A', bg: '#DCFCE7' },
  COMPLETE:          { label: 'Complete', color: '#16A34A', bg: '#DCFCE7' },
}

const PRIORITY_COLORS = {
  high:   { dot: '#DC2626', bg: '#FEE2E2', label: 'High' },
  medium: { dot: '#D97706', bg: '#FEF3C7', label: 'Medium' },
  low:    { dot: '#0EA5E9', bg: '#E0F2FE', label: 'Low' },
}

// ─── Components ────────────────────────────────────────────────────────────

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['#C84B0F', '#D97706', '#0EA5E9', '#7C3AED', '#059669']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div
      className={cn(
        'flex flex-shrink-0 items-center justify-center rounded-full font-[700] text-white',
        size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-8 w-8 text-[11px]',
      )}
      style={{ background: color, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      {initials}
    </div>
  )
}

function StatCard({ stat }: { stat: typeof STATS[0] }) {
  const Icon = stat.icon
  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-white p-5 transition-all duration-250 group cursor-pointer"
      style={{ borderColor: '#EDE8E1', boxShadow: '0 1px 4px rgba(26,21,18,0.06), 0 4px 12px -2px rgba(26,21,18,0.05)' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px -2px rgba(26,21,18,0.12), 0 8px 24px -4px rgba(26,21,18,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(26,21,18,0.06), 0 4px 12px -2px rgba(26,21,18,0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-[3px] rounded-r-full"
        style={{ background: stat.color }}
      />

      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: stat.bg }}
        >
          <Icon className="h-5 w-5" style={{ color: stat.color }} strokeWidth={2} />
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-[10.5px] font-[600]"
          style={{ background: stat.bg, color: stat.color }}
        >
          {stat.trend}
        </span>
      </div>

      <div className="mt-3">
        <p
          className="text-[32px] font-[800] leading-none tracking-tight text-[#1A1512]"
          style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
        >
          {stat.value}
        </p>
        <p className="mt-1.5 text-[12px] font-[500] text-[#1A1512]">{stat.title}</p>
        <p className="mt-0.5 text-[11px]" style={{ color: '#A09890' }}>{stat.sub}</p>
      </div>
    </div>
  )
}

function SectionCard({ title, icon: Icon, iconBg, iconColor, action, children }: {
  title: string; icon: React.ElementType; iconBg: string; iconColor: string
  action?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-white"
      style={{ borderColor: '#EDE8E1', boxShadow: '0 1px 4px rgba(26,21,18,0.06), 0 4px 12px -2px rgba(26,21,18,0.05)' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid #EDE8E1' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: iconBg }}
          >
            <Icon className="h-[15px] w-[15px]" style={{ color: iconColor }} strokeWidth={2} />
          </div>
          <h3
            className="text-[14px] font-[700] text-[#1A1512]"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          >
            {title}
          </h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function ViewAllBtn({ href }: { href?: string }) {
  return (
    <button
      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-[600] transition-all duration-150"
      style={{ color: '#C84B0F' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF4EE' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      View all <ArrowRight className="h-3 w-3" />
    </button>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const name = user?.name?.split(' ')[0] ?? 'CA'

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#F9F7F4' }}>
      <div className="mx-auto max-w-[1400px] p-5 md:p-6 space-y-6 stagger-children">

        {/* ── Page header ────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-[24px] font-[800] tracking-tight text-[#1A1512]"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
            >
              {greeting}, {name} 👋
            </h1>
            <p className="mt-0.5 text-[13.5px]" style={{ color: '#6B6258' }}>
              Here's what needs your attention today.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-[700] text-white transition-all duration-150 self-start sm:self-auto"
            style={{ background: '#C84B0F', boxShadow: '0 4px 14px rgba(200,75,15,0.28)', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#A33A0C' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#C84B0F' }}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New Case
          </button>
        </div>

        {/* ── Stat grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STATS.map((s) => <StatCard key={s.title} stat={s} />)}
        </div>

        {/* ── Middle row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* Upcoming deadlines */}
          <div className="lg:col-span-2">
            <SectionCard
              title="Upcoming Deadlines"
              icon={Calendar}
              iconBg="#FFF4EE"
              iconColor="#C84B0F"
              action={<ViewAllBtn />}
            >
              <div>
                {DEADLINES.map((item, i) => {
                  const urgency = item.daysLeft <= 3
                    ? { color: '#DC2626', bg: '#FEE2E2' }
                    : item.daysLeft <= 7
                    ? { color: '#D97706', bg: '#FEF3C7' }
                    : { color: '#A09890', bg: 'transparent' }
                  const status = STATUS_LABELS[item.status]
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-5 py-3 transition-colors duration-100 cursor-pointer"
                      style={{ borderBottom: i < DEADLINES.length - 1 ? '1px solid #F5F2EE' : 'none' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAF8' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <Avatar name={item.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-[600] text-[#1A1512] truncate">{item.name}</p>
                        <p className="text-[11px] truncate" style={{ color: '#A09890' }}>{item.service}</p>
                      </div>
                      <span
                        className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-[600]"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {status.label}
                      </span>
                      <div
                        className="flex-shrink-0 rounded-lg px-2 py-1 text-[11px] font-[700] min-w-[40px] text-center"
                        style={{ background: urgency.bg, color: urgency.color }}
                      >
                        {item.daysLeft <= 0 ? 'Late' : `${item.daysLeft}d`}
                      </div>
                    </div>
                  )
                })}
              </div>
            </SectionCard>
          </div>

          {/* Activity feed */}
          <SectionCard
            title="Recent Activity"
            icon={Clock}
            iconBg="#F5F2EE"
            iconColor="#7A7068"
          >
            <div>
              {ACTIVITY.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-5 py-3 transition-colors duration-100"
                  style={{ borderBottom: i < ACTIVITY.length - 1 ? '1px solid #F5F2EE' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAF8' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <span className="mt-0.5 flex-shrink-0 text-[14px] leading-none">{item.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] leading-snug text-[#1A1512]">
                      <span className="font-[600]">{item.client}</span>
                      {' '}{item.action}
                    </p>
                    <p className="mt-0.5 text-[10.5px]" style={{ color: '#A09890' }}>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* ── Bottom row ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Tasks */}
          <SectionCard
            title="My Tasks Today"
            icon={CheckCircle2}
            iconBg="#F5F2EE"
            iconColor="#5E5650"
            action={
              <div className="flex items-center gap-2">
                <span
                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-[700]"
                  style={{ background: '#FFF4EE', color: '#C84B0F' }}
                >
                  {TASKS.length}
                </span>
                <ViewAllBtn />
              </div>
            }
          >
            <div>
              {TASKS.map((task, i) => {
                const p = PRIORITY_COLORS[task.priority]
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-5 py-3.5 transition-colors duration-100 cursor-pointer"
                    style={{ borderBottom: i < TASKS.length - 1 ? '1px solid #F5F2EE' : 'none' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAF8' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div
                      className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                      style={{ background: p.dot }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-[500] text-[#1A1512] leading-snug">{task.title}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-[600]"
                          style={{ background: '#F5F2EE', color: '#6B6258' }}
                        >
                          {task.case}
                        </span>
                        <span className="text-[10.5px]" style={{ color: '#A09890' }}>{task.due}</span>
                      </div>
                    </div>
                    <input type="checkbox" className="mt-1 h-4 w-4 flex-shrink-0 rounded accent-brand-600 cursor-pointer" />
                  </div>
                )
              })}
            </div>
          </SectionCard>

          {/* Fees */}
          <SectionCard
            title="Fees This Month"
            icon={IndianRupee}
            iconBg="#FFF4EE"
            iconColor="#C84B0F"
            action={
              <span
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-[600]"
                style={{ background: '#DCFCE7', color: '#16A34A' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse-soft" />
                April 2025
              </span>
            }
          >
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[11.5px] font-[500] mb-1" style={{ color: '#A09890' }}>Total Billed</p>
                <p
                  className="text-[32px] font-[800] leading-none tracking-tight text-[#1A1512]"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                >
                  {formatCurrency(186000)}
                </p>
                <p className="mt-1 text-[12px] font-[600]" style={{ color: '#16A34A' }}>↑ 24% vs last month</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3.5" style={{ background: '#F9F7F4', border: '1px solid #EDE8E1' }}>
                  <p className="text-[10.5px] font-[500] mb-1" style={{ color: '#A09890' }}>Received</p>
                  <p
                    className="text-[17px] font-[800]"
                    style={{ color: '#16A34A', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                  >
                    {formatCurrency(142000)}
                  </p>
                </div>
                <div className="rounded-xl p-3.5" style={{ background: '#F9F7F4', border: '1px solid #EDE8E1' }}>
                  <p className="text-[10.5px] font-[500] mb-1" style={{ color: '#A09890' }}>Outstanding</p>
                  <p
                    className="text-[17px] font-[800]"
                    style={{ color: '#D97706', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                  >
                    {formatCurrency(44000)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="mb-1.5 flex justify-between">
                  <span className="text-[11px]" style={{ color: '#A09890' }}>Collection rate</span>
                  <span className="text-[11px] font-[700]" style={{ color: '#1A1512' }}>76%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: '#F5F2EE' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: '76%', background: 'linear-gradient(90deg, #C84B0F 0%, #F97316 100%)' }}
                  />
                </div>
              </div>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-[13px] font-[600] transition-all duration-150"
                style={{ borderColor: '#EDE8E1', color: '#1A1512' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F2EE' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                View full report <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </SectionCard>
        </div>

        {/* bottom spacer for mobile nav bar */}
        <div className="h-4 lg:hidden" />
      </div>
    </div>
  )
}
