import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-[600] leading-none',
  {
    variants: {
      variant: {
        default:  'bg-warm-100 text-warm-700',
        brand:    'bg-brand-50 text-brand-700',
        success:  'bg-green-50 text-green-700',
        warning:  'bg-amber-50 text-amber-700',
        danger:   'bg-red-50 text-red-700',
        info:     'bg-sky-50 text-sky-700',
        purple:   'bg-violet-50 text-violet-700',
        outline:  'border border-[var(--border)] bg-transparent text-[var(--text-secondary)]',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-[9px]',
        sm: 'px-2 py-0.5 text-[10.5px]',
        md: 'px-2.5 py-1 text-[11px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'sm' },
  },
)

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode
  dot?: boolean
  className?: string
}

const DOT_COLORS: Record<string, string> = {
  default: 'bg-warm-400',
  brand:   'bg-brand-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-sky-500',
  purple:  'bg-violet-500',
  outline: 'bg-[var(--text-tertiary)]',
}

export function Badge({ children, variant = 'default', size, dot, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)}>
      {dot && (
        <span className={cn('h-1.5 w-1.5 flex-shrink-0 rounded-full', DOT_COLORS[variant ?? 'default'])} />
      )}
      {children}
    </span>
  )
}

const CASE_STATUS_MAP: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  DOCUMENTS_PENDING: { label: 'Docs Pending',   variant: 'warning' },
  DOCS_RECEIVED:     { label: 'Docs Received',  variant: 'info' },
  UNDER_PREPARATION: { label: 'In Preparation', variant: 'purple' },
  FILED:             { label: 'Filed',           variant: 'brand' },
  COMPLETE:          { label: 'Complete',        variant: 'success' },
}

export function CaseStatusBadge({ status, size }: { status: string; size?: BadgeProps['size'] }) {
  const config = CASE_STATUS_MAP[status] ?? { label: status, variant: 'default' as const }
  return <Badge variant={config.variant} size={size} dot>{config.label}</Badge>
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, BadgeProps['variant']> = {
    owner: 'brand', manager: 'info', staff: 'default',
  }
  return <Badge variant={map[role] ?? 'default'}>{role}</Badge>
}
