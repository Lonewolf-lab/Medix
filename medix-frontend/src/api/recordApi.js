import api from './axiosInstance'

/** Build multipart form data for create. `file` is optional. */
function toFormData({ title, description, recordType, recordDate, file }) {
  const fd = new FormData()
  fd.append('title', title)
  if (description) fd.append('description', description)
  fd.append('recordType', recordType)
  if (recordDate) fd.append('recordDate', recordDate)
  if (file) fd.append('file', file)
  return fd
}

export const recordApi = {
  list: () => api.get('/records').then((r) => r.data),
  getById: (id) => api.get(`/records/${id}`).then((r) => r.data),
  byType: (recordType) => api.get(`/records/type/${recordType}`).then((r) => r.data),

  // multipart/form-data: title, description?, recordType, recordDate?, file?
  create: (payload) =>
    api
      .post('/records', toFormData(payload), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  // { title, description?, recordType, recordDate? }
  update: (id, payload) => api.put(`/records/${id}`, payload).then((r) => r.data),

  remove: (id) => api.delete(`/records/${id}`).then((r) => r.data),

  // AI document analysis
  analyze: (id) => api.post(`/records/${id}/analyze`).then((r) => r.data),
  getAnalysis: (id) => api.get(`/records/${id}/analysis`).then((r) => r.data),

  // Per-document chat
  chat: (id, message) => api.post(`/records/${id}/chat`, { message }).then((r) => r.data),
  chatHistory: (id) => api.get(`/records/${id}/chat/history`).then((r) => r.data),
  clearChat: (id) => api.delete(`/records/${id}/chat/history`).then((r) => r.data),
}
