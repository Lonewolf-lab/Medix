import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Inline spinner. */
export function Spinner({ className }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-navy-500', className)} />
}

/** Full-area centered loader with optional label. */
export function Loader({ label = 'Loading…', className }) {
  return (
    <div className={cn('flex w-full flex-col items-center justify-center gap-3 py-16', className)}>
      <Spinner className="h-7 w-7" />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  )
}

/** Skeleton block for content placeholders. */
export function Skeleton({ className }) {
  return <div className={cn('shimmer rounded-lg', className)} />
}

export default Loader
