import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[12.5px] font-[500] text-[var(--text-primary)]"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          >
            {label}
            {props.required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[var(--text-tertiary)]">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-8 w-full rounded-lg border text-[13px] outline-none transition-all duration-150',
              'bg-[var(--surface)] text-[var(--text-primary)]',
              'placeholder:text-[var(--text-tertiary)]',
              leftIcon ? 'pl-9' : 'pl-3',
              rightIcon ? 'pr-9' : 'pr-3',
              error
                ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
                : 'border-[var(--border)] focus:border-brand-400 focus:shadow-[0_0_0_3px_rgba(200,75,15,0.12)] hover:border-[var(--border-strong)]',
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-[var(--text-tertiary)]">{rightIcon}</span>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-1 text-[11.5px] text-red-500">{error}</p>
        )}
        {hint && !error && (
          <p className="text-[11.5px] text-[var(--text-tertiary)]">{hint}</p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const areaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={areaId} className="text-[12.5px] font-[500] text-[var(--text-primary)]"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={cn(
            'min-h-[80px] w-full resize-none rounded-lg border px-3 py-2 text-[13px] outline-none transition-all duration-150',
            'bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-[var(--border)] focus:border-brand-400 focus:shadow-[0_0_0_3px_rgba(200,75,15,0.12)]',
            className,
          )}
          {...props}
        />
        {error && <p className="text-[11.5px] text-red-500">{error}</p>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
