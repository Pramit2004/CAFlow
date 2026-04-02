import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] p-12 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-subtle)]">
          <Icon className="h-6 w-6 text-[var(--text-tertiary)]" />
        </div>
      )}
      <h3
        className="text-[14px] font-[600] text-[var(--text-primary)]"
        style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
      >
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-[12.5px] leading-relaxed text-[var(--text-tertiary)]">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
