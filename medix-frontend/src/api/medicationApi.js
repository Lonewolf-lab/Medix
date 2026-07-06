import api from "./axiosInstance";

export const medicationApi = {
  // -> MedicationResponse[]
  getAll: () => api.get("/medications").then((r) => r.data),

  // -> MedicationResponse[]
  getActive: () => api.get("/medications/active").then((r) => r.data),

  // -> MedicationResponse[]
  getToday: () => api.get("/medications/today").then((r) => r.data),

  // -> MedicationResponse[]
  getExpired: () => api.get("/medications/expired").then((r) => r.data),

  // -> MedicationResponse
  getById: (id) => api.get(`/medications/${id}`).then((r) => r.data),

  // -> MedicationResponse
  create: (data) => api.post("/medications", data).then((r) => r.data),

  // -> MedicationResponse
  update: (id, data) => api.put(`/medications/${id}`, data).then((r) => r.data),

  // -> void (204)
  deleteMedication: (id) => api.delete(`/medications/${id}`).then((r) => r.data),

  // -> MedicationResponse
  deactivate: (id) => api.patch(`/medications/${id}/deactivate`).then((r) => r.data),

  // -> MedicationReminderResponse
  addReminder: (id, data) => api.post(`/medications/${id}/reminders`, data).then((r) => r.data),

  // -> void (204)
  deleteReminder: (id, reminderId) =>
    api.delete(`/medications/${id}/reminders/${reminderId}`).then((r) => r.data),

  // file: file object (MultipartFile)
  // -> PrescriptionExtractionResponse
  extractPrescription: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post("/medications/extract-prescription", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  // medications: MedicationRequest[]
  // -> MedicationResponse[]
  confirmPrescription: (medications) =>
    api.post("/medications/confirm-prescription", medications).then((r) => r.data),

  // data: { newEndDate: "YYYY-MM-DD", updatedReminderTimes?: ["HH:mm"] }
  // -> MedicationResponse
  continueMedication: (id, data) =>
    api.patch(`/medications/${id}/continue`, data).then((r) => r.data),

  // -> MedicationResponse
  stopMedication: (id) => api.patch(`/medications/${id}/stop`).then((r) => r.data),
};
