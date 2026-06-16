import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns'

/** Safely coerce a backend value (ISO string / Date) into a Date, or null. */
function toDate(value) {
  if (!value) return null
  const d = typeof value === 'string' ? parseISO(value) : value
  return isValid(d) ? d : null
}

/** "Jun 17, 2026" — for record/medication dates. */
export function formatDate(value, fallback = '—') {
  const d = toDate(value)
  return d ? format(d, 'MMM d, yyyy') : fallback
}

/** "Jun 17, 2026 · 2:30 PM" — for timestamps. */
export function formatDateTime(value, fallback = '—') {
  const d = toDate(value)
  return d ? format(d, "MMM d, yyyy '·' h:mm a") : fallback
}

/** "3 hours ago" — for chat / recent activity. */
export function formatRelative(value, fallback = '') {
  const d = toDate(value)
  return d ? formatDistanceToNow(d, { addSuffix: true }) : fallback
}

/** "2:30 PM" from a HH:mm string (medication reminder times). */
export function formatTime(hhmm, fallback = '—') {
  if (!hhmm || typeof hhmm !== 'string') return fallback
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return fallback
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

/** Whole-year age from a date of birth. */
export function ageFromDob(dob) {
  const d = toDate(dob)
  if (!d) return null
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1
  return age >= 0 ? age : null
}
