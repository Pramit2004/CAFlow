import { cn } from '@/lib/utils'
import { CASE_STATUS_COLORS, CASE_STATUS_LABELS } from '@/lib/constants'

interface StatusBadgeProps {
  status: string
  className?: string
  size?: 'sm' | 'md'
}

export function CaseStatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const colorClass = CASE_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800'
  const label = CASE_STATUS_LABELS[status] ?? status

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  )
}

interface GenericBadgeProps {
  label: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
}

export function Badge({ label, variant = 'default', className }: GenericBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {label}
    </span>
  )
}
