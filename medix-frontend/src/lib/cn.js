import clsx from 'clsx'

/**
 * Tiny class-name helper. Wraps clsx so component files stay terse.
 * Usage: cn('base', condition && 'active', props.className)
 */
export function cn(...inputs) {
  return clsx(inputs)
}
