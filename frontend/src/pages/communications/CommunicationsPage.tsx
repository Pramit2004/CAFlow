import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Bell, Check, CheckCheck, RefreshCw, MessageSquare,
  FolderOpen, Users, FileText, Calendar, Info,
} from 'lucide-react'
import { api } from '@/services/api'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────

interface Notification {
  id: string
  type: string
  title: string
  body: string
  isRead: boolean
  createdAt: string
  metadata?: Record<string, any>
}

// ── Icon by type ───────────────────────────────────────────────────────────

function NotifIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    case_created:       { icon: FolderOpen, bg: '#EFF6FF', color: '#1D4ED8' },
    case_updated:       { icon: FolderOpen, bg: '#F5F3FF', color: '#6D28D9' },
    document_uploaded:  { icon: FileText,   bg: '#FFF4EE', color: '#C84B0F' },
    document_reviewed:  { icon: FileText,   bg: '#F0FDF4', color: '#16A34A' },
    client_added:       { icon: Users,      bg: '#ECFEFF', color: '#0E7490' },
    deadline_reminder:  { icon: Calendar,   bg: '#FFFBEB', color: '#D97706' },
    payment_received:   { icon: Check,      bg: '#F0FDF4', color: '#16A34A' },
  }
  const cfg = map[type] ?? { icon: Info, bg: '#F9F7F4', color: '#6B6258' }
  const Icon = cfg.icon
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
      style={{ background: cfg.bg }}>
      <Icon className="h-4 w-4" style={{ color: cfg.color }} strokeWidth={1.8} />
    </div>
  )
}

// ── Hooks ──────────────────────────────────────────────────────────────────

function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: Notification[] }>('/api/notifications')
      return res.data.data
    },
    staleTime: 20_000,
    refetchInterval: 60_000,
  })
}

function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/notifications/${id}/read`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.patch('/api/notifications/read-all')
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read')
    },
  })
}

// ── Time ago ───────────────────────────────────────────────────────────────

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'just now'
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)   return `${d}d ago`
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ── Group by date ──────────────────────────────────────────────────────────

function groupByDay(notifs: Notification[]) {
  const groups: Record<string, Notification[]> = {}
  notifs.forEach((n) => {
    const d = new Date(n.createdAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let label: string
    if (d.toDateString() === today.toDateString()) label = 'Today'
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday'
    else label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  })
  return groups
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function CommunicationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const { data: notifs = [], isLoading, refetch, isFetching } = useNotifications()
  const { mutate: markRead } = useMarkRead()
  const { mutate: markAll, isPending: markingAll } = useMarkAllRead()

  const unreadCount = notifs.filter((n) => !n.isRead).length

  const filtered = filter === 'unread' ? notifs.filter((n) => !n.isRead) : notifs
  const groups = groupByDay(filtered)

  return (
    <div className="flex h-full flex-col" style={{ background: '#F9F7F4' }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[24px] font-[800] tracking-tight"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}>
                Communications
              </h1>
              {unreadCount > 0 && (
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-[11px] font-[700] text-white"
                  style={{ background: '#C84B0F' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[13px]" style={{ color: '#6B6258' }}>
              Activity feed — updates across your entire practice
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button type="button" onClick={() => markAll()} disabled={markingAll}
                className="flex h-9 items-center gap-2 rounded-xl border px-3.5 text-[13px] font-[600] transition-all duration-150 disabled:opacity-60"
                style={{ borderColor: '#EDE8E1', color: '#1A1512', background: 'white' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F9F7F4' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
              >
                <CheckCheck className="h-4 w-4" /> Mark all read
              </button>
            )}
            <button type="button" onClick={() => refetch()}
              className="flex h-9 items-center gap-2 rounded-xl border px-3.5 text-[13px] font-[600] transition-all duration-150"
              style={{ borderColor: '#EDE8E1', color: '#1A1512', background: 'white' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F9F7F4' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Filter pills */}
        <div className="mt-4 flex gap-3">
          {[
            { id: 'all', label: 'All Activity', count: notifs.length, color: '#C84B0F', bg: '#FFF4EE', border: '#F97316' },
            { id: 'unread', label: 'Unread', count: unreadCount, color: '#0E7490', bg: '#ECFEFF', border: '#67E8F9' },
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
        </div>
      </div>

      {/* ── Feed Card ── */}
      <div className="mx-6 mb-6 flex flex-1 flex-col overflow-hidden rounded-2xl"
        style={{
          background: 'white',
          border: '1px solid #EDE8E1',
          boxShadow: '0 4px 24px -4px rgba(26,21,18,0.10), 0 1px 4px rgba(26,21,18,0.06)',
        }}
      >
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex flex-col gap-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-4 animate-pulse"
                  style={{ borderBottom: '1px solid #F5F2EE', opacity: 1 - i * 0.1 }}>
                  <div className="h-9 w-9 rounded-xl flex-shrink-0" style={{ background: '#F0ECE7' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-2/5 rounded-full" style={{ background: '#F0ECE7' }} />
                    <div className="h-3 w-3/5 rounded-full" style={{ background: '#F5F2EE' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: '#F5F2EE' }}>
                <MessageSquare className="h-7 w-7" style={{ color: '#A09890' }} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[14px] font-[700]" style={{ color: '#1A1512', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                  {filter === 'unread' ? 'All caught up!' : 'No activity yet'}
                </p>
                <p className="mt-1 text-[13px]" style={{ color: '#A09890' }}>
                  {filter === 'unread' ? 'No unread notifications.' : 'Activity from your practice will appear here.'}
                </p>
              </div>
            </div>
          ) : (
            Object.entries(groups).map(([day, items]) => (
              <div key={day}>
                <div className="sticky top-0 z-10 px-5 py-2.5" style={{ background: '#FAFAF8', borderBottom: '1px solid #F5F2EE' }}>
                  <p className="text-[10.5px] font-[700] uppercase tracking-wider"
                    style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#A09890' }}>
                    {day}
                  </p>
                </div>
                {items.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors duration-100"
                    style={{
                      borderBottom: '1px solid #F9F7F4',
                      background: n.isRead ? 'white' : '#FFFDF9',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAF8' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = n.isRead ? 'white' : '#FFFDF9' }}
                    onClick={() => { if (!n.isRead) markRead(n.id) }}
                  >
                    <NotifIcon type={n.type} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-[13px] leading-snug', n.isRead ? '' : 'font-[600]')}
                          style={{ color: '#1A1512' }}>
                          {n.title}
                        </p>
                        <span className="flex-shrink-0 text-[11px]" style={{ color: '#A09890' }}>
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      {n.body && (
                        <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: '#6B6258' }}>
                          {n.body}
                        </p>
                      )}
                    </div>

                    {!n.isRead && (
                      <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: '#C84B0F' }} />
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
