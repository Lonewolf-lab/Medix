import { cn } from '@/lib/cn'

/** Medix wordmark with a heartbeat-pulse glyph. */
export default function Logo({ className, showText = true, textClassName }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-navy-600 shadow-soft">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-mint-300" fill="none">
          <path
            d="M2 12h4l2-6 4 12 2.5-7 1.5 1h6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showText && (
        <span className={cn('font-display text-xl font-bold tracking-tight text-navy-900', textClassName)}>
          Medix
        </span>
      )}
    </span>
  )
}
