import { cn } from '@/lib/cn'

/** Friendly placeholder for empty lists. `icon` is a lucide component. */
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-500">
          <Icon className="h-7 w-7" />
        </div>
      )}
      {title && <h3 className="text-base font-semibold text-navy-900">{title}</h3>}
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
