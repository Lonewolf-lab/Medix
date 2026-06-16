/**
 * The backend returns AI-generated status / severity strings (e.g. "NORMAL",
 * "HIGH", "BORDERLINE", "MODERATE", "URGENT"). We normalize whatever we get
 * into a small set of visual "tones" and expose Tailwind class bundles so the
 * whole app stays color-consistent (see design tokens in index.css).
 */

const TONES = {
  normal: {
    label: 'Normal',
    text: 'text-status-normal',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-status-normal',
    solid: 'bg-status-normal text-white',
    ring: 'ring-emerald-200',
  },
  borderline: {
    label: 'Borderline',
    text: 'text-status-borderline',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-status-borderline',
    solid: 'bg-status-borderline text-white',
    ring: 'ring-amber-200',
  },
  medium: {
    label: 'Medium',
    text: 'text-status-medium',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    dot: 'bg-status-medium',
    solid: 'bg-status-medium text-white',
    ring: 'ring-orange-200',
  },
  high: {
    label: 'High',
    text: 'text-status-high',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-status-high',
    solid: 'bg-status-high text-white',
    ring: 'ring-red-200',
  },
  neutral: {
    label: 'Unknown',
    text: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    solid: 'bg-slate-500 text-white',
    ring: 'ring-slate-200',
  },
}

/** Map an arbitrary status/severity string to one of our canonical tones. */
export function toTone(raw) {
  if (!raw) return 'neutral'
  const s = String(raw).toLowerCase()

  if (/(urgent|emergency|critical|severe|very high|very low)/.test(s)) return 'high'
  if (/(high|low|abnormal|elevated|deficien|out of range)/.test(s)) return 'high'
  if (/(medium|moderate)/.test(s)) return 'medium'
  if (/(borderline|mild|slight|marginal|watch)/.test(s)) return 'borderline'
  if (/(normal|healthy|good|optimal|within range|in range|ok)/.test(s)) return 'normal'
  return 'neutral'
}

/** Get the Tailwind class bundle for a status/severity string. */
export function statusStyles(raw) {
  return TONES[toTone(raw)]
}

/** Biomarker statuses skew NORMAL/HIGH/LOW/BORDERLINE — same tone engine. */
export const biomarkerStyles = statusStyles

/** Triage severities skew LOW/MEDIUM/HIGH/URGENT — same tone engine. */
export const severityStyles = statusStyles

export { TONES }
