// Mirrors backend RecordType enum exactly. Values must match the API.
export const RECORD_TYPES = [
  { value: 'LAB_REPORT', label: 'Lab Report' },
  { value: 'PRESCRIPTION', label: 'Prescription' },
  { value: 'VACCINATION', label: 'Vaccination' },
  { value: 'OTHER', label: 'Other' },
]

export const RECORD_TYPE_LABELS = Object.fromEntries(
  RECORD_TYPES.map((t) => [t.value, t.label]),
)
