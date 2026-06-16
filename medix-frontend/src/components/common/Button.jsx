import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const VARIANTS = {
  primary:
    'bg-navy-600 text-white shadow-soft hover:bg-navy-700 active:bg-navy-800 focus-visible:ring-navy-300',
  secondary:
    'bg-white text-navy-700 border border-slate-200 shadow-soft hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-navy-200',
  ghost:
    'bg-transparent text-navy-700 hover:bg-navy-50 focus-visible:ring-navy-200',
  danger:
    'bg-status-high text-white shadow-soft hover:brightness-95 active:brightness-90 focus-visible:ring-red-300',
  mint:
    'bg-mint-500 text-white shadow-soft hover:bg-mint-600 active:bg-mint-700 focus-visible:ring-mint-300',
}

const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10 justify-center',
}

/** Reusable button. Pass `loading` to show a spinner and disable interaction. */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition',
        'focus:outline-none focus-visible:ring-4 disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
