import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-[600] transition-all duration-150',
    'select-none whitespace-nowrap disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-brand-600 text-white border border-brand-700/30',
          'hover:bg-brand-700 hover:shadow-brand',
          'dark:bg-brand-500 dark:hover:bg-brand-600',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]',
        ].join(' '),
        secondary: [
          'bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)]',
          'hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]',
          'shadow-xs',
        ].join(' '),
        ghost: [
          'bg-transparent text-[var(--text-secondary)] border border-transparent',
          'hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
        ].join(' '),
        danger: [
          'bg-red-600 text-white border border-red-700/30',
          'hover:bg-red-700',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]',
        ].join(' '),
        outline: [
          'bg-transparent text-brand-700 border border-brand-300',
          'hover:bg-brand-50 hover:border-brand-400',
          'dark:text-brand-400 dark:border-brand-700 dark:hover:bg-brand-950/40',
        ].join(' '),
        amber: [
          'bg-amber-500 text-white border border-amber-600/30',
          'hover:bg-amber-600',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]',
        ].join(' '),
      },
      size: {
        xs:  'h-6 px-2 text-[11px] rounded-md gap-1',
        sm:  'h-7 px-2.5 text-[12px] rounded-lg',
        md:  'h-8 px-3.5 text-[13px] rounded-lg',
        lg:  'h-9 px-4 text-[13.5px] rounded-lg',
        xl:  'h-10 px-5 text-[14px] rounded-xl',
        icon: 'h-8 w-8 rounded-lg p-0 text-sm',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    )
  },
)
Button.displayName = 'Button'
