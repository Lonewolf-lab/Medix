import { cn } from '@/lib/cn'
import { statusStyles } from '@/utils/statusColor'

/**
 * Pill badge. Either pass a `tone` style bundle directly, or pass a `status`
 * string (AI severity/biomarker status) and we'll resolve the color for you.
 */
export default function Badge({ status, children, dot = false, className }) {
  const s = statusStyles(status)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        s.bg,
        s.text,
        s.border,
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />}
      {children ?? status}
    </span>
  )
}

/** Neutral/branded badge not tied to a health status. */
export function Tag({ children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-navy-100 bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-700',
        className,
      )}
    >
      {children}
    </span>
  )
}
