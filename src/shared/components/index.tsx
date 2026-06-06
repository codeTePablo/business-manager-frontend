import { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { cn } from '@/shared/utils'

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sz = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7' }[size]
  return (
    <svg className={cn('animate-spin text-accent', sz, className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  loading?: boolean
}
const btnVariants: Record<BtnVariant, string> = {
  primary:   'bg-accent text-white hover:bg-accent-hover focus:ring-accent/40',
  secondary: 'bg-surface text-text border border-border hover:bg-surface-raised focus:ring-accent/20',
  ghost:     'text-text-muted hover:bg-surface-inset hover:text-text focus:ring-accent/20',
  danger:    'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 focus:ring-danger/30',
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, className, children, disabled, ...props }, ref) => (
    <button ref={ref} disabled={disabled || loading}
      className={cn('btn-base', btnVariants[variant], className)} {...props}>
      {loading && <Spinner size="sm" className="text-current" />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; hint?: string
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="space-y-1">
        {label && <label htmlFor={inputId} className="label">{label}</label>}
        <input ref={ref} id={inputId}
          className={cn('input-base', error && 'border-danger focus:border-danger focus:ring-danger/20', className)}
          {...props} />
        {error && <p className="text-xs text-danger mt-1">{error}</p>}
        {hint && !error && <p className="text-xs text-text-subtle mt-1">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, ...props }, ref) => (
    <div className="space-y-1">
      {label && <label className="label">{label}</label>}
      <select ref={ref}
        className={cn('input-base', error && 'border-danger', className)} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeColor = 'blue' | 'green' | 'orange' | 'red' | 'gray'
const badgeColors: Record<BadgeColor, string> = {
  blue:   'bg-accent-light text-accent border border-accent-border',
  green:  'bg-success-light text-success border border-success-border',
  orange: 'bg-warning-light text-warning border border-warning-border',
  red:    'bg-danger-light text-danger border border-danger-border',
  gray:   'bg-surface-inset text-text-muted border border-border',
}
export function Badge({ color = 'gray', children, className }: {
  color?: BadgeColor; children: ReactNode; className?: string
}) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono', badgeColors[color], className)}>
      {children}
    </span>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string; accent?: boolean
}) {
  return (
    <div className={cn('card-padded space-y-1', accent && 'border-accent/40 bg-accent-light')}>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className={cn('text-2xl font-bold tracking-tight', accent ? 'text-accent' : 'text-text')}>{value}</p>
      {sub && <p className="text-xs text-text-subtle">{sub}</p>}
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ title, description, action }: {
  title: string; description?: string; action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-10 h-10 rounded-full bg-surface-inset flex items-center justify-center text-text-subtle font-mono text-lg">—</div>
      <p className="text-sm font-medium text-text">{title}</p>
      {description && <p className="text-xs text-text-muted max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

// ── PageHeader ────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: {
  title: string; subtitle?: string; action?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-base md:text-lg font-semibold tracking-tight text-text">{title}</h1>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-modal w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── ErrorMessage ──────────────────────────────────────────────────────────────
export function ErrorMessage({ message }: { message?: string }) {
  return (
    <div className="p-4 rounded-lg bg-danger-light border border-danger-border text-danger text-sm">
      {message ?? 'Ocurrió un error inesperado.'}
    </div>
  )
}
