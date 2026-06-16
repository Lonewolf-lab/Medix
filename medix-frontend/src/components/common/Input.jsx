import { forwardRef, useId } from 'react'
import { cn } from '@/lib/cn'

/** Labeled input with optional icon, hint, and error message. */
const Input = forwardRef(function Input(
  { label, hint, error, icon: Icon, className, containerClassName, id, ...props },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-slate-400" />
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-11 w-full rounded-xl border bg-white text-slate-900 placeholder:text-slate-400',
            'transition focus:outline-none focus:ring-4',
            Icon ? 'pl-10 pr-3.5' : 'px-3.5',
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-slate-200 focus:border-navy-400 focus:ring-navy-100',
            className,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-sm text-status-high">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
})

export default Input
