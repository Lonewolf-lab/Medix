import api from './axiosInstance'

export const dashboardApi = {
  // multipart, field name "file" -> { id, fileName, fileUrl, isLatest, uploadedAt, totalBiomarkers, abnormalCount }
  uploadReport: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return api
      .post('/dashboard/upload-report', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  // -> { reportId, fileName, uploadedAt, biomarkers[], totalBiomarkers, abnormalCount, normalCount, overallAssessment, disclaimer }
  healthSummary: () => api.get('/dashboard/health-summary').then((r) => r.data),

  reports: () => api.get('/dashboard/reports').then((r) => r.data),
  removeReport: (id) => api.delete(`/dashboard/reports/${id}`).then((r) => r.data),

  // { message, biomarkerName?, biomarkerValue?, biomarkerStatus? } -> ChatResponse
  biomarkerChat: (payload) =>
    api.post('/dashboard/biomarker-chat', payload).then((r) => r.data),
}
