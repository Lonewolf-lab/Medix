import api from "./axiosInstance";

export const recordApi = {
  // -> HealthRecordResponse[]
  getAll: () => api.get("/records").then((r) => r.data),

  // -> HealthRecordResponse
  getById: (id) => api.get(`/records/${id}`).then((r) => r.data),

  // formData: multipart payload containing: title, description?, recordType, recordDate?, file
  // -> HealthRecordResponse
  create: (formData) =>
    api
      .post("/records", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  // -> void (204)
  deleteRecord: (id) => api.delete(`/records/${id}`).then((r) => r.data),

  // -> DocumentAnalysisResponse
  analyze: (id) => api.post(`/records/${id}/analyze`).then((r) => r.data),

  // -> DocumentAnalysisResponse
  getAnalysis: (id) => api.get(`/records/${id}/analysis`).then((r) => r.data),

  // -> DocumentChatResponse
  sendChat: (id, message) =>
    api.post(`/records/${id}/chat`, { message }).then((r) => r.data),

  // -> DocumentChatResponse[]
  getChatHistory: (id) => api.get(`/records/${id}/chat/history`).then((r) => r.data),

  // -> void (204)
  clearChatHistory: (id) => api.delete(`/records/${id}/chat/history`).then((r) => r.data),
};
