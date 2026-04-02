import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: { value: number; label: string }
  variant?: 'default' | 'brand' | 'warning' | 'danger'
  loading?: boolean
  className?: string
}

export function StatCard({
  title, value, subtitle, icon: Icon,
  iconColor, iconBg, trend, variant = 'default',
  loading = false, className,
}: StatCardProps) {
  const variantStyles = {
    default: { card: '', icon: 'bg-sand-100 text-sand-600 dark:bg-sand-800/50 dark:text-sand-400' },
    brand:   { card: 'border-brand-100 dark:border-brand-900/40', icon: 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400' },
    warning: { card: 'border-amber-100 dark:border-amber-900/40', icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
    danger:  { card: 'border-red-100 dark:border-red-900/40',    icon: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' },
  }[variant]

  if (loading) {
    return (
      <div className={cn('rounded-xl border bg-[var(--surface)] p-4 shadow-sm border-[var(--border)]', className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="shimmer h-3 w-24 rounded-md" />
            <div className="shimmer h-7 w-16 rounded-md" />
            <div className="shimmer h-3 w-32 rounded-md" />
          </div>
          <div className="shimmer h-9 w-9 rounded-lg" />
        </div>
      </div>
    )
  }

  const trendIsUp = trend && trend.value > 0
  const trendIsDown = trend && trend.value < 0

  return (
    <div
      className={cn(
        'group rounded-xl border bg-[var(--surface)] p-4 shadow-sm transition-all duration-200',
        'hover:shadow-md hover:border-[var(--border-strong)]',
        variantStyles.card || 'border-[var(--border)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-[500] text-[var(--text-secondary)] mb-2 leading-tight">{title}</p>
          <p
            className="text-[26px] font-[700] tracking-tight text-[var(--text-primary)] leading-none mb-1 animate-count-up"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-[11.5px] text-[var(--text-tertiary)] leading-snug">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110',
            iconBg ?? variantStyles.icon.split(' ').slice(0, 2).join(' '),
            iconColor ?? variantStyles.icon.split(' ').slice(2).join(' '),
          )}>
            <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--border)] pt-3">
          <span className={cn(
            'flex items-center gap-0.5 text-[11.5px] font-[600]',
            trendIsUp ? 'text-green-600 dark:text-green-400' : trendIsDown ? 'text-red-500 dark:text-red-400' : 'text-[var(--text-tertiary)]',
          )}>
            {trendIsUp ? <TrendingUp className="h-3 w-3" /> : trendIsDown ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {trendIsUp ? '+' : ''}{trend.value}%
          </span>
          <span className="text-[11.5px] text-[var(--text-tertiary)]">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
