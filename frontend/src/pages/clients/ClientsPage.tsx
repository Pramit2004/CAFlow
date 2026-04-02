import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserPlus, Search, Download, Users, TrendingUp,
  Building2, Phone, Mail, Tag, MoreHorizontal,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react'
import { useClients, useDeleteClient } from '@/modules/clients/useClients'
import { downloadClientsCSV, type Client } from '@/modules/clients/clientsApi'
import { AddClientModal } from '@/modules/clients/AddClientModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { cn, getInitials } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'

// ── Entity type badge map ──────────────────────────────────────────────────

const ENTITY_BADGE: Record<string, { label: string; variant: any }> = {
  individual:  { label: 'Individual',   variant: 'default'  },
  huf:         { label: 'HUF',          variant: 'purple'   },
  partnership: { label: 'Partnership',  variant: 'info'     },
  llp:         { label: 'LLP',          variant: 'info'     },
  pvt_ltd:     { label: 'Pvt. Ltd',     variant: 'brand'    },
  public_ltd:  { label: 'Public Ltd',   variant: 'brand'    },
  trust:       { label: 'Trust',        variant: 'warning'  },
  other:       { label: 'Other',        variant: 'default'  },
}

// ── Client Avatar ──────────────────────────────────────────────────────────

function ClientAvatar({ name }: { name: string }) {
  const initials = getInitials(name)
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const hue = (hash * 37) % 360
  return (
    <div
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-[700] text-white"
      style={{ background: `linear-gradient(135deg, hsl(${hue},60%,42%) 0%, hsl(${(hue+40)%360},65%,52%) 100%)` }}
    >
      {initials}
    </div>
  )
}

// ── Row actions ────────────────────────────────────────────────────────────

function RowActions({ client }: { client: Client }) {
  const [open, setOpen] = useState(false)
  const { mutate: del } = useDeleteClient()
  const navigate = useNavigate()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-tertiary)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
            {[
              { label: 'View Profile',  fn: () => navigate(`/clients/${client.id}`) },
              { label: 'Add Case',      fn: () => navigate(`/cases/new?clientId=${client.id}`) },
            ].map(({ label, fn }) => (
              <button key={label} type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(false); fn() }}
                className="w-full px-3 py-2 text-left text-[12.5px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-subtle)]">
                {label}
              </button>
            ))}
            <div className="my-1 h-px bg-[var(--border)]" />
            <button type="button"
              onClick={(e) => {
                e.stopPropagation(); setOpen(false)
                if (window.confirm(`Remove ${client.name}?`)) del(client.id)
              }}
              className="w-full px-3 py-2 text-left text-[12.5px] text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30">
              Remove Client
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Skeleton rows ──────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-[var(--border)]">
      {[200, 130, 90, 110, 80].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 animate-pulse rounded-full bg-[var(--border)]" style={{ width: w }} />
        </td>
      ))}
      <td className="px-4 py-3" />
    </tr>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

const ENTITY_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'individual',  label: 'Individual' },
  { value: 'huf',         label: 'HUF' },
  { value: 'pvt_ltd',     label: 'Pvt. Limited' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'llp',         label: 'LLP' },
  { value: 'trust',       label: 'Trust' },
]

const PAGE_SIZE = 20

export default function ClientsPage() {
  const navigate = useNavigate()
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, 350)

  const queryParams = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  }), [page, debouncedSearch])

  const { data, isLoading, isFetching } = useClients(queryParams)

  const clients = data?.data ?? []
  const meta    = data?.meta
  const totalPages = meta?.totalPages ?? 1

  const filtered = entityFilter
    ? clients.filter((c) => c.entityType === entityFilter)
    : clients

  return (
    <div className="flex h-full flex-col">

      {/* ── Header ── */}
      <div className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-[800] tracking-tight text-[var(--text-primary)]"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
              Clients
            </h1>
            <p className="mt-0.5 text-[12.5px] text-[var(--text-tertiary)]">
              {meta?.total !== undefined
                ? `${meta.total} client${meta.total !== 1 ? 's' : ''} in your practice`
                : 'Manage your client portfolio'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}
              onClick={downloadClientsCSV}>
              Export CSV
            </Button>
            <Button variant="primary" size="sm" leftIcon={<UserPlus className="h-3.5 w-3.5" />}
              onClick={() => setShowAdd(true)}>
              Add Client
            </Button>
          </div>
        </div>

        {/* Stat pills */}
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { label: 'Total Clients',  value: meta?.total ?? '–',   icon: Users,      color: 'text-brand-600 dark:text-brand-400',  bg: 'bg-brand-50 dark:bg-brand-950/50'   },
            { label: 'Businesses',     value: clients.filter(c => !['individual','huf'].includes(c.entityType ?? '')).length, icon: Building2, color: 'text-blue-600 dark:text-blue-400',  bg: 'bg-blue-50 dark:bg-blue-950/50'     },
            { label: 'Individuals',    value: clients.filter(c => c.entityType === 'individual').length, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/50' },
            { label: 'With GST',       value: clients.filter(c => c.gstin).length, icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] px-3 py-2">
              <span className={cn('flex h-6 w-6 items-center justify-center rounded-md', bg)}>
                <Icon className={cn('h-3.5 w-3.5', color)} />
              </span>
              <span className="text-[20px] font-[800] leading-none text-[var(--text-primary)]"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                {value}
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search name, phone, PAN…"
              className="h-8 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-8 text-[13px] text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-tertiary)] focus:border-brand-400 focus:shadow-[0_0_0_3px_rgba(18,110,71,0.1)] hover:border-[var(--border-strong)]"
            />
            {search && (
              <button type="button" onClick={() => { setSearch(''); setPage(1) }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="w-40">
            <Select options={ENTITY_OPTIONS} value={entityFilter}
              onChange={(v) => { setEntityFilter(v); setPage(1) }} />
          </div>

          {(search || entityFilter) && (
            <button type="button"
              onClick={() => { setSearch(''); setEntityFilter(''); setPage(1) }}
              className="flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11.5px] font-[500] text-brand-700 hover:bg-brand-100 dark:bg-brand-950/50 dark:text-brand-300">
              <X className="h-3 w-3" /> Clear
            </button>
          )}

          {isFetching && !isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[680px] border-collapse">
          <thead className="sticky top-0 z-10 bg-[var(--surface)]">
            <tr className="border-b border-[var(--border)]">
              {['Client', 'Contact', 'Type', 'Tax IDs', 'Tags', ''].map((h, i) => (
                <th key={i}
                  className="px-4 py-2.5 text-left text-[10.5px] font-[600] uppercase tracking-wider text-[var(--text-tertiary)]"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 9 }).map((_, i) => <SkeletonRow key={i} />)
              : filtered.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-subtle)]">
                        <Users className="h-6 w-6 text-[var(--text-tertiary)]" />
                      </div>
                      <div>
                        <p className="text-[13.5px] font-[600] text-[var(--text-primary)]">
                          {search ? 'No matching clients' : 'No clients yet'}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">
                          {search ? 'Try a different search term.' : 'Add your first client to get started.'}
                        </p>
                      </div>
                      {!search && (
                        <Button variant="primary" size="sm"
                          leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                          onClick={() => setShowAdd(true)}>
                          Add First Client
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
              : filtered.map((client) => (
                <tr key={client.id}
                  onClick={() => navigate(`/clients/${client.id}`)}
                  className="group cursor-pointer border-b border-[var(--border)] transition-colors hover:bg-[var(--bg-subtle)]">

                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ClientAvatar name={client.name} />
                      <div>
                        <p className="text-[13px] font-[600] text-[var(--text-primary)] leading-snug">
                          {client.name}
                        </p>
                        {client.businessName && (
                          <p className="text-[11px] text-[var(--text-tertiary)]">{client.businessName}</p>
                        )}
                        {client.city && (
                          <p className="text-[11px] text-[var(--text-tertiary)]">{client.city}{client.state ? `, ${client.state}` : ''}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 text-[12.5px] text-[var(--text-primary)]">
                        <Phone className="h-3 w-3 flex-shrink-0 text-[var(--text-tertiary)]" />
                        +91 {client.phone}
                      </span>
                      {client.email && (
                        <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          {client.email}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Entity */}
                  <td className="px-4 py-3">
                    {client.entityType
                      ? <Badge variant={ENTITY_BADGE[client.entityType]?.variant ?? 'default'} size="sm">
                          {ENTITY_BADGE[client.entityType]?.label ?? client.entityType}
                        </Badge>
                      : <span className="text-[12px] text-[var(--text-tertiary)]">–</span>
                    }
                  </td>

                  {/* Tax IDs */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {client.pan && (
                        <span className="font-mono text-[12px] font-[500] text-[var(--text-primary)]">{client.pan}</span>
                      )}
                      {client.gstin && (
                        <span className="font-mono text-[10.5px] text-[var(--text-tertiary)]">{client.gstin}</span>
                      )}
                      {!client.pan && !client.gstin && (
                        <span className="text-[12px] text-[var(--text-tertiary)]">–</span>
                      )}
                    </div>
                  </td>

                  {/* Tags */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(client.tags ?? []).slice(0, 2).map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[10.5px] font-[500] text-[var(--text-secondary)]">
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                      {(client.tags?.length ?? 0) > 2 && (
                        <span className="rounded-md bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[10.5px] text-[var(--text-tertiary)]">
                          +{(client.tags?.length ?? 0) - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <RowActions client={client} />
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface)] px-6 py-3">
          <p className="text-[12px] text-[var(--text-tertiary)]">
            Showing{' '}
            <span className="font-[500] text-[var(--text-primary)]">
              {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, meta?.total ?? 0)}
            </span>
            {' '}of <span className="font-[500] text-[var(--text-primary)]">{meta?.total}</span>
          </p>
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="xs"
              leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
              disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
              <button key={i + 1} type="button" onClick={() => setPage(i + 1)}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-[500] transition-colors',
                  page === i + 1 ? 'bg-brand-600 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]',
                )}>
                {i + 1}
              </button>
            ))}
            <Button variant="secondary" size="xs"
              rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
              disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <AddClientModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
