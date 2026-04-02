import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Phone, Mail, Hash, MapPin, Calendar, Building2,
  Tag, FileText, Edit3, Copy, CheckCircle, Clock, FolderOpen,
  Upload, ExternalLink, AlertCircle, IndianRupee, ChevronRight,
  User, Globe, Briefcase,
} from 'lucide-react'
import { useClient, useClientCases, useUpdateClient } from '@/modules/clients/useClients'
import { Tabs } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn, formatCurrency, getInitials } from '@/lib/utils'
import type { CaseStatus, ServiceType } from '@/types/common.types'

// ── Case status config ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CaseStatus, { label: string; variant: any; icon: React.ElementType }> = {
  DOCUMENTS_PENDING:  { label: 'Docs Pending',     variant: 'warning', icon: AlertCircle  },
  DOCS_RECEIVED:      { label: 'Docs Received',    variant: 'info',    icon: CheckCircle  },
  UNDER_PREPARATION:  { label: 'In Progress',      variant: 'purple',  icon: Clock        },
  FILED:              { label: 'Filed',             variant: 'brand',   icon: CheckCircle  },
  COMPLETE:           { label: 'Complete',          variant: 'success', icon: CheckCircle  },
}

const SERVICE_COLORS: Record<ServiceType, string> = {
  ITR:          'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  GST:          'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  TDS:          'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  ROC:          'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400',
  AUDIT:        'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  ADVANCE_TAX:  'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400',
  OTHER:        'bg-[var(--bg-subtle)] text-[var(--text-secondary)]',
}

// ── Copy helper ────────────────────────────────────────────────────────────

function CopyableValue({ value, mono = false }: { value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <span className="group flex items-center gap-1.5">
      <span className={cn('text-[13px] text-[var(--text-primary)]', mono && 'font-mono font-[500]')}>
        {value}
      </span>
      <button
        type="button"
        onClick={copy}
        className="opacity-0 transition-opacity group-hover:opacity-100 text-[var(--text-tertiary)] hover:text-brand-600"
      >
        {copied
          ? <CheckCircle className="h-3 w-3 text-green-500" />
          : <Copy className="h-3 w-3" />
        }
      </button>
    </span>
  )
}

// ── Info row ───────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
  empty = '—',
}: {
  icon: React.ElementType
  label: string
  value?: string | null
  mono?: boolean
  empty?: string
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-[var(--text-tertiary)]">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-[500] uppercase tracking-wider text-[var(--text-tertiary)]"
          style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
          {label}
        </p>
        {value
          ? <CopyableValue value={value} mono={mono} />
          : <span className="text-[13px] text-[var(--text-tertiary)]">{empty}</span>
        }
      </div>
    </div>
  )
}

// ── Stat tile ──────────────────────────────────────────────────────────────

function StatTile({
  label, value, sub, color = 'default',
}: {
  label: string; value: string | number; sub?: string; color?: 'default' | 'brand' | 'warning' | 'success'
}) {
  const colors = {
    default: 'text-[var(--text-primary)]',
    brand:   'text-brand-600 dark:text-brand-400',
    warning: 'text-amber-600 dark:text-amber-400',
    success: 'text-green-600 dark:text-green-400',
  }
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-[11px] font-[500] uppercase tracking-wider text-[var(--text-tertiary)]"
        style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
        {label}
      </p>
      <p className={cn('text-[22px] font-[800] leading-none', colors[color])}
        style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-[var(--text-tertiary)]">{sub}</p>}
    </div>
  )
}

// ── Overview tab ───────────────────────────────────────────────────────────

function OverviewTab({ client }: { client: any }) {
  const { stats } = client
  const collectionRate = stats.totalFeeQuoted > 0
    ? Math.round((stats.totalFeeReceived / stats.totalFeeQuoted) * 100)
    : 0

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

      {/* Left: Profile details */}
      <div className="lg:col-span-2 flex flex-col gap-5">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Active Cases"    value={stats.activeCases}                    color="brand"   />
          <StatTile label="Completed"       value={stats.completedCases}                 color="success" />
          <StatTile label="Docs Pending"    value={stats.pendingDocs}                    color="warning" />
          <StatTile label="Total Revenue"   value={formatCurrency(stats.totalFeeReceived)} />
        </div>

        {/* Revenue card */}
        {stats.totalFeeQuoted > 0 && (
          <Card padding="md">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12.5px] font-[600] text-[var(--text-primary)]"
                style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                Fee Collection
              </p>
              <span className={cn(
                'text-[11.5px] font-[600] px-2 py-0.5 rounded-full',
                collectionRate >= 80 ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                : collectionRate >= 50 ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
              )}>
                {collectionRate}% collected
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className={cn('h-full rounded-full transition-all duration-700',
                  collectionRate >= 80 ? 'bg-green-500' : collectionRate >= 50 ? 'bg-amber-500' : 'bg-red-500')}
                style={{ width: `${collectionRate}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11.5px] text-[var(--text-tertiary)]">
              <span>Received: <strong className="text-[var(--text-primary)]">{formatCurrency(stats.totalFeeReceived)}</strong></span>
              <span>Quoted: <strong className="text-[var(--text-primary)]">{formatCurrency(stats.totalFeeQuoted)}</strong></span>
            </div>
          </Card>
        )}

        {/* Identity */}
        <Card padding="md">
          <p className="mb-2 text-[11px] font-[600] uppercase tracking-wider text-[var(--text-tertiary)]"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
            Identity & Contact
          </p>
          <InfoRow icon={Phone}  label="Mobile"        value={`+91 ${client.phone}`} />
          <InfoRow icon={Mail}   label="Email"         value={client.email} />
          <InfoRow icon={Hash}   label="PAN"           value={client.pan}   mono />
          <InfoRow icon={Hash}   label="GSTIN"         value={client.gstin} mono />
          <InfoRow icon={Hash}   label="Aadhaar (last 4)" value={client.aadhaarLast4} />
          <InfoRow icon={Calendar} label="Date of Birth" value={client.dob} />
        </Card>

        {/* Business */}
        {(client.businessName || client.entityType) && (
          <Card padding="md">
            <p className="mb-2 text-[11px] font-[600] uppercase tracking-wider text-[var(--text-tertiary)]"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
              Business Details
            </p>
            <InfoRow icon={Building2} label="Business Name"   value={client.businessName} />
            <InfoRow icon={Briefcase} label="Entity Type"     value={client.entityType} />
            <InfoRow icon={Hash}      label="Spouse's PAN"    value={client.spousePan} mono />
          </Card>
        )}
      </div>

      {/* Right: Address + prefs */}
      <div className="flex flex-col gap-5">
        <Card padding="md">
          <p className="mb-2 text-[11px] font-[600] uppercase tracking-wider text-[var(--text-tertiary)]"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
            Address
          </p>
          <InfoRow icon={MapPin}   label="Street"   value={client.address} />
          <InfoRow icon={MapPin}   label="City"     value={client.city} />
          <InfoRow icon={MapPin}   label="State"    value={client.state} />
          <InfoRow icon={MapPin}   label="Pincode"  value={client.pincode} />
        </Card>

        <Card padding="md">
          <p className="mb-2 text-[11px] font-[600] uppercase tracking-wider text-[var(--text-tertiary)]"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
            Preferences
          </p>
          <InfoRow
            icon={Globe}
            label="Preferred Language"
            value={{ en: 'English', gu: 'Gujarati', hi: 'Hindi' }[client.preferredLanguage as string] ?? client.preferredLanguage}
          />
          <InfoRow icon={Calendar} label="Client Since" value={client.clientSince} />

          {(client.tags ?? []).length > 0 && (
            <div className="flex items-start gap-3 py-2.5">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-[var(--text-tertiary)]">
                <Tag className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[11px] font-[500] uppercase tracking-wider text-[var(--text-tertiary)]"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                  Tags
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {client.tags.map((tag: string) => (
                    <span key={tag} className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-[500] text-brand-700 dark:bg-brand-950/40 dark:text-brand-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        {client.notes && (
          <Card padding="md">
            <p className="mb-2 text-[11px] font-[600] uppercase tracking-wider text-[var(--text-tertiary)]"
              style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
              Internal Notes
            </p>
            <p className="text-[12.5px] leading-relaxed text-[var(--text-secondary)]">{client.notes}</p>
          </Card>
        )}
      </div>
    </div>
  )
}

// ── Cases tab ──────────────────────────────────────────────────────────────

function CasesTab({ clientId }: { clientId: string }) {
  const { data: cases, isLoading } = useClientCases(clientId)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-[var(--border)]" />
        ))}
      </div>
    )
  }

  if (!cases?.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-subtle)]">
          <FolderOpen className="h-6 w-6 text-[var(--text-tertiary)]" />
        </div>
        <div>
          <p className="text-[13.5px] font-[600] text-[var(--text-primary)]">No cases yet</p>
          <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">
            Create a case to start tracking this client's work.
          </p>
        </div>
        <Button variant="primary" size="sm"
          onClick={() => navigate(`/cases/new?clientId=${clientId}`)}>
          Create First Case
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {cases.map((c: any) => {
        const status = STATUS_CONFIG[c.status as CaseStatus]
        const StatusIcon = status?.icon ?? Clock
        return (
          <div key={c.id}
            onClick={() => navigate(`/cases/${c.id}`)}
            className="group flex cursor-pointer items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:border-[var(--border-strong)] hover:shadow-sm">

            {/* Service badge */}
            <span className={cn('rounded-lg px-2.5 py-1 text-[11px] font-[700]', SERVICE_COLORS[c.serviceType as ServiceType])}>
              {c.serviceType}
            </span>

            {/* Title + FY */}
            <div className="flex-1 min-w-0">
              <p className="truncate text-[13px] font-[600] text-[var(--text-primary)]">{c.title}</p>
              {c.financialYear && (
                <p className="text-[11px] text-[var(--text-tertiary)]">FY {c.financialYear}</p>
              )}
            </div>

            {/* Status */}
            <Badge variant={status?.variant ?? 'default'} size="sm" dot>
              {status?.label ?? c.status}
            </Badge>

            {/* Deadline */}
            {c.deadline && (
              <span className="hidden text-[11.5px] text-[var(--text-tertiary)] sm:block">
                {new Date(c.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            )}

            <ChevronRight className="h-4 w-4 flex-shrink-0 text-[var(--text-tertiary)] opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        )
      })}
    </div>
  )
}

// ── Documents tab ──────────────────────────────────────────────────────────

function DocumentsTab({ clientId }: { clientId: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-subtle)]">
        <Upload className="h-6 w-6 text-[var(--text-tertiary)]" />
      </div>
      <div>
        <p className="text-[13.5px] font-[600] text-[var(--text-primary)]">Document view coming soon</p>
        <p className="mt-0.5 text-[12px] text-[var(--text-tertiary)]">
          View and manage documents across all of this client's cases.
        </p>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

const DETAIL_TABS = [
  { id: 'overview',   label: 'Overview',   icon: <User className="h-3.5 w-3.5" /> },
  { id: 'cases',      label: 'Cases',      icon: <FolderOpen className="h-3.5 w-3.5" /> },
  { id: 'documents',  label: 'Documents',  icon: <FileText className="h-3.5 w-3.5" /> },
]

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: client, isLoading, error } = useClient(id!)

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        {/* Skeleton header */}
        <div className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 animate-pulse rounded-full bg-[var(--border)]" />
            <div className="flex flex-col gap-2">
              <div className="h-5 w-40 animate-pulse rounded bg-[var(--border)]" />
              <div className="h-3.5 w-24 animate-pulse rounded bg-[var(--border)]" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-6">
          <div className="grid grid-cols-4 gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-[var(--border)]" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-[var(--text-tertiary)]" />
        <div className="text-center">
          <p className="text-[14px] font-[600] text-[var(--text-primary)]">Client not found</p>
          <p className="mt-1 text-[12.5px] text-[var(--text-tertiary)]">
            This client may have been removed or you don't have access.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/clients')}>
          Back to Clients
        </Button>
      </div>
    )
  }

  const initials = getInitials(client.name)
  const hash = client.name.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)
  const hue = (hash * 37) % 360

  const entityLabel: Record<string, string> = {
    individual: 'Individual', huf: 'HUF', partnership: 'Partnership', llp: 'LLP',
    pvt_ltd: 'Pvt. Limited', public_ltd: 'Public Ltd', trust: 'Trust', other: 'Other',
  }

  const tabsWithBadges = DETAIL_TABS.map((t) => ({
    ...t,
    badge: t.id === 'cases' ? client.stats.totalCases || undefined : undefined,
  }))

  return (
    <div className="flex h-full flex-col">

      {/* ── Profile Header ── */}
      <div className="flex-shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-6 py-5">

        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-1.5 text-[11.5px] text-[var(--text-tertiary)]">
          <button type="button" onClick={() => navigate('/clients')}
            className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Clients
          </button>
          <span>/</span>
          <span className="text-[var(--text-primary)]">{client.name}</span>
        </div>

        {/* Profile row */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-[16px] font-[800] text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, hsl(${hue},60%,42%) 0%, hsl(${(hue+40)%360},65%,52%) 100%)` }}
            >
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[20px] font-[800] tracking-tight text-[var(--text-primary)]"
                  style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
                  {client.name}
                </h1>
                {client.entityType && (
                  <Badge variant="outline" size="sm">
                    {entityLabel[client.entityType] ?? client.entityType}
                  </Badge>
                )}
                {client.stats.activeCases > 0 && (
                  <Badge variant="brand" size="sm" dot>
                    {client.stats.activeCases} active case{client.stats.activeCases !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {/* Quick info row */}
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[var(--text-tertiary)]">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  +91 {client.phone}
                </span>
                {client.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    {client.email}
                  </span>
                )}
                {client.pan && (
                  <span className="flex items-center gap-1.5 font-mono">
                    <Hash className="h-3 w-3" />
                    {client.pan}
                  </span>
                )}
                {client.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3" />
                    {client.city}{client.state ? `, ${client.state}` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="secondary" size="sm" leftIcon={<Edit3 className="h-3.5 w-3.5" />}>
              Edit
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FolderOpen className="h-3.5 w-3.5" />}
              onClick={() => navigate(`/cases/new?clientId=${id}`)}
            >
              New Case
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4">
          <Tabs
            tabs={tabsWithBadges}
            active={activeTab}
            onChange={setActiveTab}
            variant="line"
          />
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'overview'  && <OverviewTab  client={client} />}
        {activeTab === 'cases'     && <CasesTab     clientId={id!} />}
        {activeTab === 'documents' && <DocumentsTab clientId={id!} />}
      </div>
    </div>
  )
}
