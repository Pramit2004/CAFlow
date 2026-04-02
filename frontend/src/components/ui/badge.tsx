import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-[500] leading-none',
  {
    variants: {
      variant: {
        default:  'bg-sand-100 text-sand-700 dark:bg-sand-800/50 dark:text-sand-300',
        brand:    'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400',
        success:  'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400',
        warning:  'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
        danger:   'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
        info:     'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
        purple:   'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
        outline:  'border border-[var(--border)] bg-transparent text-[var(--text-secondary)]',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-[9px]',
        sm: 'px-2 py-0.5 text-[10px]',
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
  default: 'bg-sand-400',
  brand:   'bg-brand-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  purple:  'bg-purple-500',
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

/* Case status specific badge */
const CASE_STATUS_MAP: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
  DOCUMENTS_PENDING: { label: 'Docs Pending',     variant: 'warning' },
  DOCS_RECEIVED:     { label: 'Docs Received',    variant: 'info' },
  UNDER_PREPARATION: { label: 'In Preparation',   variant: 'purple' },
  FILED:             { label: 'Filed',             variant: 'brand' },
  COMPLETE:          { label: 'Complete',          variant: 'success' },
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
