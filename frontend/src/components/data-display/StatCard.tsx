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
    default: { card: '', icon: 'bg-warm-100 text-warm-600' },
    brand:   { card: 'border-brand-100', icon: 'bg-brand-50 text-brand-600' },
    warning: { card: 'border-amber-100', icon: 'bg-amber-50 text-amber-600' },
    danger:  { card: 'border-red-100',   icon: 'bg-red-50 text-red-600' },
  }[variant]

  if (loading) {
    return (
      <div className={cn('rounded-xl border bg-white p-4 shadow-sm', className)} style={{ borderColor: '#EDE8E1' }}>
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
        'group rounded-xl border bg-white p-4 shadow-sm transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        variantStyles.card || '',
        className,
      )}
      style={{ borderColor: '#EDE8E1', boxShadow: '0 1px 4px rgba(26,21,18,0.06)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-[500] mb-2 leading-tight" style={{ color: '#A09890' }}>{title}</p>
          <p
            className="text-[26px] font-[800] tracking-tight leading-none mb-1"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', color: '#1A1512' }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-[11.5px] leading-snug" style={{ color: '#A09890' }}>{subtitle}</p>
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
        <div className="mt-3 flex items-center gap-1.5 border-t pt-3" style={{ borderColor: '#F5F2EE' }}>
          <span className={cn(
            'flex items-center gap-0.5 text-[11.5px] font-[600]',
            trendIsUp ? 'text-green-600' : trendIsDown ? 'text-red-500' : 'text-warm-500',
          )}>
            {trendIsUp ? <TrendingUp className="h-3 w-3" /> : trendIsDown ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {trendIsUp ? '+' : ''}{trend.value}%
          </span>
          <span className="text-[11.5px]" style={{ color: '#A09890' }}>{trend.label}</span>
        </div>
      )}
    </div>
  )
}
