import api from './axiosInstance'

export const medicationApi = {
  list: () => api.get('/medications').then((r) => r.data),
  active: () => api.get('/medications/active').then((r) => r.data),
  today: () => api.get('/medications/today').then((r) => r.data),
  expired: () => api.get('/medications/expired').then((r) => r.data),
  getById: (id) => api.get(`/medications/${id}`).then((r) => r.data),

  // { name, dosage?, frequency, startDate?, endDate?, notes?, reminderTimes?: string[] }
  create: (payload) => api.post('/medications', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/medications/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/medications/${id}`).then((r) => r.data),

  deactivate: (id) => api.patch(`/medications/${id}/deactivate`).then((r) => r.data),
  stop: (id) => api.patch(`/medications/${id}/stop`).then((r) => r.data),

  // { newEndDate, updatedReminderTimes?: string[] }
  continueCourse: (id, payload) =>
    api.patch(`/medications/${id}/continue`, payload).then((r) => r.data),

  // reminders
  addReminder: (id, reminderTime) =>
    api.post(`/medications/${id}/reminders`, { reminderTime }).then((r) => r.data),
  removeReminder: (id, reminderId) =>
    api.delete(`/medications/${id}/reminders/${reminderId}`).then((r) => r.data),

  // Prescription AI extraction (multipart, field name "file")
  extractPrescription: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api
      .post('/medications/extract-prescription', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  // Confirm reviewed extraction -> array of created medications
  // payload: [{ name, dosage?, frequency, startDate?, endDate?, notes? }]
  confirmPrescription: (items) =>
    api.post('/medications/confirm-prescription', items).then((r) => r.data),
}
