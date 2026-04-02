import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, padding = 'md', hover = false, onClick }: CardProps) {
  const paddings = { none: '', sm: 'p-3', md: 'p-4', lg: 'p-5 md:p-6' }

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border bg-[var(--surface)]',
        'border-[var(--border)] shadow-sm',
        hover && 'cursor-pointer transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-md',
        onClick && 'cursor-pointer',
        paddings[padding],
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3
      className={cn('text-[14px] font-[600] text-[var(--text-primary)]', className)}
      style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
    >
      {children}
    </h3>
  )
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('', className)}>{children}</div>
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3', className)}>
      {children}
    </div>
  )
}

export function CardDivider({ className }: { className?: string }) {
  return <div className={cn('my-4 h-px bg-[var(--border)]', className)} />
}
