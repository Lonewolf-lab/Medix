// Mirrors backend FrequencyType enum exactly. Values must match the API.
export const MEDICATION_FREQUENCIES = [
  { value: 'ONCE_DAILY', label: 'Once daily' },
  { value: 'TWICE_DAILY', label: 'Twice daily' },
  { value: 'THREE_TIMES_DAILY', label: 'Three times daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'AS_NEEDED', label: 'As needed' },
]

export const FREQUENCY_LABELS = Object.fromEntries(
  MEDICATION_FREQUENCIES.map((f) => [f.value, f.label]),
)

// Suggested default reminder times per frequency (HH:mm, 24h).
export const FREQUENCY_DEFAULT_TIMES = {
  ONCE_DAILY: ['09:00'],
  TWICE_DAILY: ['09:00', '21:00'],
  THREE_TIMES_DAILY: ['08:00', '14:00', '20:00'],
  WEEKLY: ['09:00'],
  AS_NEEDED: [],
}
