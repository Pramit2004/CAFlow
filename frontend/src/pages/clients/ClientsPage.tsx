import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserPlus, Search, Download, Users, Building2,
  Phone, Mail, Tag, MoreHorizontal, X,
  ChevronLeft, ChevronRight, MapPin,
} from 'lucide-react'
import { useClients, useDeleteClient } from '@/modules/clients/useClients'
import { downloadClientsCSV, type Client } from '@/modules/clients/clientsApi'
import { AddClientModal } from '@/modules/clients/AddClientModal'
import { useDebounce } from '@/hooks/useDebounce'
import { getInitials } from '@/lib/utils'

// ── Entity meta ─────────────────────────────────────────────────────────────
const ENTITY_META: Record<string, { label: string; color: string; bg: string }> = {
  individual:  { label: 'Individual',    color: '#0EA5E9', bg: '#E0F2FE' },
  huf:         { label: 'HUF',           color: '#7C3AED', bg: '#F3E8FF' },
  partnership: { label: 'Partnership',   color: '#D97706', bg: '#FEF3C7' },
  llp:         { label: 'LLP',           color: '#0EA5E9', bg: '#E0F2FE' },
  pvt_ltd:     { label: 'Pvt. Ltd',      color: '#C84B0F', bg: '#FFF4EE' },
  public_ltd:  { label: 'Public Ltd',    color: '#C84B0F', bg: '#FFF4EE' },
  trust:       { label: 'Trust',         color: '#D97706', bg: '#FEF3C7' },
  other:       { label: 'Other',         color: '#6B6258', bg: '#F5F2EE' },
}

const ENTITY_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'individual',   label: 'Individual' },
  { value: 'huf',          label: 'HUF' },
  { value: 'pvt_ltd',      label: 'Pvt. Limited' },
  { value: 'partnership',  label: 'Partnership' },
  { value: 'llp',          label: 'LLP' },
  { value: 'trust',        label: 'Trust' },
]

const PAGE_SIZE = 20

// ── Avatar ───────────────────────────────────────────────────────────────────
function ClientAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = getInitials(name)
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const palettes = [
    'linear-gradient(135deg,#C84B0F 0%,#F97316 100%)',
    'linear-gradient(135deg,#0EA5E9 0%,#38BDF8 100%)',
    'linear-gradient(135deg,#7C3AED 0%,#A78BFA 100%)',
    'linear-gradient(135deg,#059669 0%,#34D399 100%)',
    'linear-gradient(135deg,#D97706 0%,#FCD34D 100%)',
    'linear-gradient(135deg,#DC2626 0%,#F87171 100%)',
  ]
  const bg = palettes[hash % palettes.length]
  const s = size === 'sm' ? 'h-8 w-8 text-[10.5px]' : 'h-10 w-10 text-[12px]'
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-[700] text-white ${s}`}
      style={{ background: bg, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      {initials}
    </div>
  )
}

// ── Row context menu ─────────────────────────────────────────────────────────
function RowMenu({ client }: { client: Client }) {
  const [open, setOpen] = useState(false)
  const { mutate: del } = useDeleteClient()
  const navigate = useNavigate()

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        className="flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-100 opacity-0 group-hover:opacity-100"
        style={{ color: '#6B6258' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#F5F2EE' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full z-20 mt-1.5 w-48 overflow-hidden"
            style={{ borderRadius: 12, border: '1px solid #EDE8E1', background: 'white', boxShadow: '0 16px 40px -6px rgba(26,21,18,0.16), 0 4px 12px -2px rgba(26,21,18,0.10)' }}
          >
            {[
              { label: 'View Profile',   fn: () => navigate(`/clients/${client.id}`) },
              { label: 'Add Case',       fn: () => navigate(`/cases/new?clientId=${client.id}`) },
            ].map(({ label, fn }) => (
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
            <div style={{ height: 1, background: '#F5F2EE' }} />
            <button type="button"
              onClick={(e) => {
                e.stopPropagation(); setOpen(false)
                if (window.confirm(`Remove ${client.name} from your client list?`)) del(client.id)
              }}
              className="w-full px-4 py-2.5 text-left text-[13px] transition-colors duration-100"
              style={{ color: '#DC2626' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              Remove Client
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow({ i }: { i: number }) {
  return (
    <tr style={{ borderBottom: '1px solid #F5F2EE', animationDelay: `${i * 40}ms` }}
      className="animate-pulse">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#EDE8E1]" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 rounded-full bg-[#EDE8E1]" />
            <div className="h-3 w-20 rounded-full bg-[#F5F2EE]" />
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="space-y-1.5">
          <div className="h-3 w-28 rounded-full bg-[#EDE8E1]" />
          <div className="h-3 w-36 rounded-full bg-[#F5F2EE]" />
        </div>
      </td>
      <td className="px-5 py-4"><div className="h-6 w-20 rounded-full bg-[#EDE8E1]" /></td>
      <td className="px-5 py-4"><div className="h-3 w-24 rounded-full bg-[#EDE8E1]" /></td>
      <td className="px-5 py-4"><div className="flex gap-1.5"><div className="h-5 w-10 rounded-lg bg-[#EDE8E1]" /><div className="h-5 w-10 rounded-lg bg-[#F5F2EE]" /></div></td>
      <td className="px-5 py-4" />
    </tr>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientsPage() {
  const navigate = useNavigate()
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search, 350)
  const queryParams = useMemo(() => ({
    page, limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  }), [page, debouncedSearch])

  const { data, isLoading, isFetching } = useClients(queryParams)
  const clients = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1

  const filtered = entityFilter
    ? clients.filter((c) => c.entityType === entityFilter)
    : clients

  const businessCount = clients.filter((c) => !['individual', 'huf'].includes(c.entityType ?? '')).length
  const individualCount = clients.filter((c) => c.entityType === 'individual').length
  const gstCount = clients.filter((c) => c.gstin).length

  return (
    <div className="flex h-full flex-col" style={{ background: '#F9F7F4' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[24px] font-[800] tracking-tight" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}>
              Clients
            </h1>
            <p className="mt-0.5 text-[13px]" style={{ color: '#6B6258' }}>
              {meta?.total !== undefined ? `${meta.total} clients in your practice` : 'Manage your client portfolio'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start">
            <button
              onClick={downloadClientsCSV}
              className="flex h-9 items-center gap-2 rounded-xl border px-3.5 text-[13px] font-[600] transition-all duration-150"
              style={{ borderColor: '#EDE8E1', color: '#1A1512', background: 'white' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#F9F7F4'; e.currentTarget.style.borderColor = '#D9D1C7' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#EDE8E1' }}
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex h-9 items-center gap-2 rounded-xl px-4 text-[13px] font-[700] text-white transition-all duration-150 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #C84B0F 0%, #F97316 100%)',
                boxShadow: '0 4px 14px rgba(200,75,15,0.30)',
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(200,75,15,0.42)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(200,75,15,0.30)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <UserPlus className="h-4 w-4" strokeWidth={2.2} /> Add Client
            </button>
          </div>
        </div>

        {/* Stat pills */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
          {[
            { label: 'Total',       value: meta?.total ?? 0,   icon: Users,     color: '#C84B0F', bg: '#FFF4EE' },
            { label: 'Businesses',  value: businessCount,       icon: Building2, color: '#0EA5E9', bg: '#E0F2FE' },
            { label: 'Individuals', value: individualCount,     icon: Users,     color: '#7C3AED', bg: '#F3E8FF' },
            { label: 'With GST',    value: gstCount,            icon: Tag,       color: '#D97706', bg: '#FEF3C7' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
              style={{ background: 'white', border: '1px solid #EDE8E1', boxShadow: '0 1px 4px rgba(26,21,18,0.05)' }}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: bg }}>
                <Icon className="h-3.5 w-3.5" style={{ color }} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[18px] font-[800] leading-none" style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}>
                  {isLoading ? '—' : value}
                </p>
                <p className="text-[10.5px] font-[500]" style={{ color: '#A09890' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Table Card ─────────────────────────────────────────────────────── */}
      <div className="mx-6 mb-6 flex flex-1 flex-col overflow-hidden rounded-2xl"
        style={{
          background: 'white',
          border: '1px solid #EDE8E1',
          boxShadow: '0 4px 24px -4px rgba(26,21,18,0.10), 0 1px 4px rgba(26,21,18,0.06)',
        }}
      >
        {/* Toolbar */}
        <div className="flex flex-shrink-0 items-center gap-3 px-5 py-3.5" style={{ borderBottom: '1px solid #F5F2EE' }}>
          {/* Search */}
          <div className="relative flex-1" style={{ maxWidth: 320 }}>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: '#A09890' }} />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name, phone, PAN…"
              className="h-9 w-full rounded-xl border pl-10 pr-8 text-[13px] outline-none transition-all duration-150 bg-white"
              style={{ borderColor: '#EDE8E1', color: '#1A1512' }}
              onFocus={(e) => { e.target.style.borderColor = '#C84B0F'; e.target.style.boxShadow = '0 0 0 3px rgba(200,75,15,0.12)' }}
              onBlur={(e) => { e.target.style.borderColor = '#EDE8E1'; e.target.style.boxShadow = 'none' }}
            />
            {search && (
              <button type="button" onClick={() => { setSearch(''); setPage(1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity"
                style={{ color: '#A09890' }}>
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Entity filter */}
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1) }}
            className="h-9 rounded-xl border px-3 pr-8 text-[13px] outline-none transition-all duration-150"
            style={{
              borderColor: '#EDE8E1', color: '#1A1512', background: 'white',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A09890' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#C84B0F' }}
            onBlur={(e) => { e.target.style.borderColor = '#EDE8E1' }}
          >
            {ENTITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {(search || entityFilter) && (
            <button
              onClick={() => { setSearch(''); setEntityFilter(''); setPage(1) }}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-[600] transition-colors"
              style={{ background: '#FFF4EE', color: '#C84B0F' }}
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}

          {isFetching && !isLoading && (
            <div className="h-4 w-4 rounded-full border-2 border-[#FFE4D0] border-t-[#C84B0F]" style={{ animation: 'spin 0.7s linear infinite' }} />
          )}

          <span className="ml-auto text-[12px]" style={{ color: '#A09890' }}>
            {meta?.total !== undefined && `${meta.total} result${meta.total !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full" style={{ minWidth: 680 }}>
            <thead className="sticky top-0" style={{ background: '#FAFAF8', borderBottom: '1px solid #EDE8E1' }}>
              <tr>
                {['Client', 'Contact', 'Type', 'Tax IDs', 'Tags', ''].map((h, i) => (
                  <th key={i} className="px-5 py-3 text-left"
                    style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: '#A09890', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} i={i} />)
                : filtered.length === 0
                ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: '#F5F2EE' }}>
                          <Users className="h-7 w-7" style={{ color: '#A09890' }} strokeWidth={1.5} />
                        </div>
                        <div className="text-center">
                          <p className="text-[14px] font-[700]" style={{ color: '#1A1512', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                            {search ? 'No matching clients' : 'No clients yet'}
                          </p>
                          <p className="mt-1 text-[13px]" style={{ color: '#A09890' }}>
                            {search ? 'Try a different search or clear filters.' : 'Click "Add Client" to onboard your first client.'}
                          </p>
                        </div>
                        {!search && (
                          <button
                            onClick={() => setShowAdd(true)}
                            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-[700] text-white"
                            style={{ background: 'linear-gradient(135deg, #C84B0F 0%, #F97316 100%)', boxShadow: '0 4px 14px rgba(200,75,15,0.28)', fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
                          >
                            <UserPlus className="h-4 w-4" /> Add First Client
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
                : filtered.map((client, idx) => {
                  const entity = ENTITY_META[client.entityType ?? '']
                  return (
                    <tr
                      key={client.id}
                      className="group cursor-pointer transition-colors duration-100"
                      style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F5F2EE' : 'none' }}
                      onClick={() => navigate(`/clients/${client.id}`)}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAF8' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      {/* Client name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ClientAvatar name={client.name} />
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-[600] truncate" style={{ color: '#1A1512' }}>{client.name}</p>
                            {client.businessName && (
                              <p className="text-[11px] truncate" style={{ color: '#A09890' }}>{client.businessName}</p>
                            )}
                            {client.city && (
                              <p className="flex items-center gap-1 text-[11px]" style={{ color: '#A09890' }}>
                                <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                                {client.city}{client.state ? `, ${client.state}` : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1.5 text-[12.5px]" style={{ color: '#1A1512' }}>
                            <Phone className="h-3 w-3 flex-shrink-0" style={{ color: '#A09890' }} />
                            +91 {client.phone}
                          </p>
                          {client.email && (
                            <p className="flex items-center gap-1.5 text-[11.5px] truncate max-w-[180px]" style={{ color: '#A09890' }}>
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              {client.email}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Entity type */}
                      <td className="px-5 py-4">
                        {entity ? (
                          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-[700]"
                            style={{ background: entity.bg, color: entity.color, fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                            {entity.label}
                          </span>
                        ) : <span className="text-[12px]" style={{ color: '#A09890' }}>—</span>}
                      </td>

                      {/* Tax IDs */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          {client.pan && (
                            <p className="font-mono text-[12.5px] font-[600] tracking-wider" style={{ color: '#1A1512' }}>{client.pan}</p>
                          )}
                          {client.gstin && (
                            <p className="font-mono text-[11px] tracking-wide" style={{ color: '#A09890' }}>{client.gstin.slice(0, 12)}…</p>
                          )}
                          {!client.pan && !client.gstin && <span className="text-[12px]" style={{ color: '#A09890' }}>—</span>}
                        </div>
                      </td>

                      {/* Tags */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(client.tags ?? []).slice(0, 3).map((tag) => (
                            <span key={tag}
                              className="inline-flex items-center rounded-lg px-2 py-0.5 text-[10.5px] font-[600]"
                              style={{ background: '#F5F2EE', color: '#6B6258' }}>
                              {tag}
                            </span>
                          ))}
                          {(client.tags?.length ?? 0) > 3 && (
                            <span className="inline-flex items-center rounded-lg px-2 py-0.5 text-[10.5px] font-[600]"
                              style={{ background: '#F5F2EE', color: '#A09890' }}>
                              +{(client.tags?.length ?? 0) - 3}
                            </span>
                          )}
                          {(!client.tags || client.tags.length === 0) && <span className="text-[12px]" style={{ color: '#A09890' }}>—</span>}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <RowMenu client={client} />
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex flex-shrink-0 items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid #EDE8E1' }}>
            <p className="text-[12.5px]" style={{ color: '#A09890' }}>
              Showing{' '}
              <span className="font-[600]" style={{ color: '#1A1512' }}>
                {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, meta?.total ?? 0)}
              </span>{' '}of{' '}
              <span className="font-[600]" style={{ color: '#1A1512' }}>{meta?.total}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-8 items-center gap-1.5 rounded-xl border px-3 text-[12.5px] font-[600] transition-all duration-150 disabled:opacity-40"
                style={{ borderColor: '#EDE8E1', color: '#1A1512' }}
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = '#F9F7F4' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <button key={i + 1} type="button" onClick={() => setPage(i + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-[12.5px] font-[600] transition-all duration-150"
                  style={{
                    background: page === i + 1 ? '#C84B0F' : 'transparent',
                    color: page === i + 1 ? 'white' : '#1A1512',
                  }}
                  onMouseEnter={(e) => { if (page !== i + 1) e.currentTarget.style.background = '#F5F2EE' }}
                  onMouseLeave={(e) => { if (page !== i + 1) e.currentTarget.style.background = 'transparent' }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-8 items-center gap-1.5 rounded-xl border px-3 text-[12.5px] font-[600] transition-all duration-150 disabled:opacity-40"
                style={{ borderColor: '#EDE8E1', color: '#1A1512' }}
                onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.background = '#F9F7F4' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddClientModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
