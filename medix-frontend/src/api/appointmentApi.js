import api from "./axiosInstance";

export const appointmentApi = {
  // -> AppointmentResponse[]
  getAll: () => api.get("/appointments").then((r) => r.data),

  // -> AppointmentResponse
  getById: (id) => api.get(`/appointments/${id}`).then((r) => r.data),

  // -> AppointmentResponse
  create: (data) => api.post("/appointments", data).then((r) => r.data),

  // -> AppointmentResponse
  update: (id, data) => api.put(`/appointments/${id}`, data).then((r) => r.data),

  // -> void (204)
  deleteAppointment: (id) => api.delete(`/appointments/${id}`).then((r) => r.data),
};
