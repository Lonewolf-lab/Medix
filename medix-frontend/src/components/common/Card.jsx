import { cn } from '@/lib/cn'

/** Base surface card. `hover` adds a subtle lift on hover for clickable cards. */
export default function Card({ className, hover = false, as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white shadow-soft',
        hover && 'transition hover:shadow-lift hover:-translate-y-0.5',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex items-start justify-between gap-3 p-5 pb-0', className)} {...props} />
}

export function CardBody({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-base font-semibold text-navy-900', className)} {...props} />
}
