import { useState } from 'react'
import {
  Users, FolderOpen, FileText, AlertTriangle,
  Clock, CheckCircle2, ArrowRight, Calendar,
  TrendingUp, Plus, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/data-display/StatCard'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge, CaseStatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { formatCurrency } from '@/lib/utils'

const STATS = [
  { title: 'Active Clients', value: '142', subtitle: '12 added this month', icon: Users, variant: 'default' as const, trend: { value: 8, label: 'vs last month' } },
  { title: 'Active Cases', value: '38', subtitle: '6 due this week', icon: FolderOpen, variant: 'brand' as const, trend: { value: 5, label: 'vs last month' } },
  { title: 'Docs Pending', value: '24', subtitle: 'From 16 clients', icon: FileText, variant: 'warning' as const, trend: { value: -12, label: 'vs last week' } },
  { title: 'Overdue Cases', value: '3', subtitle: 'Need immediate action', icon: AlertTriangle, variant: 'danger' as const, trend: { value: -2, label: 'vs last week' } },
]

const DEADLINES = [
  { name: 'Amit Patel', service: 'ITR FY2024-25', daysLeft: 2, status: 'DOCUMENTS_PENDING' },
  { name: 'Priya Shah', service: 'GST GSTR-3B', daysLeft: 4, status: 'UNDER_PREPARATION' },
  { name: 'Ravi Kumar', service: 'TDS Q2 Return', daysLeft: 7, status: 'DOCS_RECEIVED' },
  { name: 'Meena Desai', service: 'ROC Annual Filing', daysLeft: 9, status: 'DOCUMENTS_PENDING' },
  { name: 'Suresh Joshi', service: 'ITR FY2024-25', daysLeft: 12, status: 'UNDER_PREPARATION' },
]

const ACTIVITY = [
  { icon: '📄', client: 'Amit Patel', action: 'uploaded Form 16', time: '5 min ago' },
  { icon: '🔄', client: 'Priya Shah', action: 'case moved to preparation', time: '1 hr ago' },
  { icon: '💳', client: 'Ravi Kumar', action: 'paid invoice ₹8,000', time: '2 hr ago' },
  { icon: '📁', client: 'Meena Desai', action: 'uploaded 3 documents', time: '3 hr ago' },
  { icon: '✅', client: 'Neha Sharma', action: 'case marked complete', time: 'Yesterday' },
]

const TASKS = [
  { title: 'Call Amit Patel about Form 16 mismatch', case: 'ITR FY24-25', due: 'Today', priority: 'high' as const },
  { title: 'Verify TDS data for Priya Shah', case: 'TDS Q2', due: 'Tomorrow', priority: 'medium' as const },
  { title: 'Send advance tax reminder', case: 'Bulk Action', due: 'In 3 days', priority: 'low' as const },
  { title: 'Review audit report — Sunrise Traders', case: 'Audit FY24', due: 'In 5 days', priority: 'medium' as const },
]

export default function DashboardPage() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="h-full overflow-y-auto">
    <div className="space-y-6 stagger-children p-6">
      <PageHeader
        title={`${greeting}, CA Gopal 👋`}
        subtitle="Here's what needs your attention today."
        actions={
          <Button size="md" leftIcon={<Plus className="h-3.5 w-3.5" />}>
            New Case
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => <StatCard key={stat.title} {...stat} />)}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Deadlines */}
        <div className="lg:col-span-2">
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/50">
                  <Calendar className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" strokeWidth={1.8} />
                </div>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </div>
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>View all</Button>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {DEADLINES.map((item, i) => {
                const urgency = item.daysLeft <= 3 ? 'text-red-500 dark:text-red-400' : item.daysLeft <= 7 ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--text-tertiary)]'
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-subtle)] transition-colors duration-100 cursor-pointer">
                    <Avatar name={item.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-[500] text-[var(--text-primary)] truncate">{item.name}</p>
                      <p className="text-[11px] text-[var(--text-tertiary)] truncate">{item.service}</p>
                    </div>
                    <CaseStatusBadge status={item.status} size="xs" />
                    <p className={cn('flex-shrink-0 text-[12px] font-[600]', urgency)}>
                      {item.daysLeft <= 0 ? 'Overdue' : `${item.daysLeft}d`}
                    </p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Activity feed */}
        <div>
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
                  <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" strokeWidth={1.8} />
                </div>
                <CardTitle>Recent Activity</CardTitle>
              </div>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-[var(--bg-subtle)] transition-colors duration-100">
                  <span className="mt-0.5 flex-shrink-0 text-sm leading-none">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] text-[var(--text-primary)] leading-snug">
                      <span className="font-[500]">{item.client}</span>
                      {' '}{item.action}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-[var(--text-tertiary)]">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Tasks */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-950/40">
                <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" strokeWidth={1.8} />
              </div>
              <CardTitle>My Tasks Today</CardTitle>
              <Badge variant="brand" size="xs">{TASKS.length}</Badge>
            </div>
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>All tasks</Button>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {TASKS.map((task, i) => <TaskRow key={i} task={task} />)}
          </div>
        </Card>

        {/* Revenue */}
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950/40">
                <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" strokeWidth={1.8} />
              </div>
              <CardTitle>Fees This Month</CardTitle>
            </div>
            <Badge variant="success" dot size="sm">April 2025</Badge>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <p className="mb-1 text-[11.5px] font-[500] text-[var(--text-tertiary)]">Total Billed</p>
              <p className="text-[30px] font-[800] tracking-tight text-[var(--text-primary)]"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                {formatCurrency(186000)}
              </p>
              <p className="mt-0.5 text-[12px] font-[500] text-green-600 dark:text-green-400">↑ 24% vs last month</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] p-3">
                <p className="text-[10.5px] font-[500] text-[var(--text-tertiary)] mb-1">Received</p>
                <p className="text-[16px] font-[700] text-green-600 dark:text-green-400"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                  {formatCurrency(142000)}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] p-3">
                <p className="text-[10.5px] font-[500] text-[var(--text-tertiary)] mb-1">Outstanding</p>
                <p className="text-[16px] font-[700] text-amber-600 dark:text-amber-400"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                  {formatCurrency(44000)}
                </p>
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-[10.5px] text-[var(--text-tertiary)]">
                <span>Collection rate</span>
                <span className="font-[600] text-[var(--text-primary)]">76%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                <div className="h-full w-[76%] rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-700" />
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
              View full report
            </Button>
          </div>
        </Card>
      </div>
    </div>
    </div>
  )
}

function TaskRow({ task }: { task: { title: string; case: string; due: string; priority: 'high' | 'medium' | 'low' } }) {
  const [done, setDone] = useState(false)
  const dot = task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-[var(--border-strong)]'

  return (
    <div
      className={cn('flex cursor-pointer items-start gap-3 px-5 py-3 transition-colors duration-100 hover:bg-[var(--bg-subtle)]', done && 'opacity-50')}
      onClick={() => setDone(!done)}
    >
      <div className={cn('mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150',
        done ? 'border-brand-500 bg-brand-500' : 'border-[var(--border-strong)]')}>
        {done && <CheckCircle2 className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-[12.5px] font-[500] leading-snug text-[var(--text-primary)]', done && 'line-through text-[var(--text-tertiary)]')}>
          {task.title}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10.5px] text-[var(--text-tertiary)]">{task.case}</span>
          <span className="h-1 w-1 rounded-full bg-[var(--border-strong)]" />
          <span className={cn('flex items-center gap-1 text-[10.5px] font-[500]', task.due === 'Today' ? 'text-red-500' : 'text-[var(--text-tertiary)]')}>
            <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
            {task.due}
          </span>
        </div>
      </div>
    </div>
  )
}
