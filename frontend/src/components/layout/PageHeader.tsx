import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
  eyebrow?: string
}

export function PageHeader({ title, subtitle, actions, className, eyebrow }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div>
        {eyebrow && (
          <p className="mb-1 text-[10px] font-[600] uppercase tracking-[0.12em] text-brand-600">
            {eyebrow}
          </p>
        )}
        <h1
          className="text-[22px] font-[700] tracking-tight text-[var(--text-primary)]"
          style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-[13px] text-[var(--text-secondary)]">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="mt-3 flex flex-shrink-0 items-center gap-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  )
}
