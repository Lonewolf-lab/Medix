import api from "./axiosInstance";

export const calendarApi = {
  getStatus: () => api.get("/calendar/google/status").then((r) => r.data),

  // payload: { accessToken: string, timeZone?: string }
  connect: (payload) => api.post("/calendar/google/connect", payload).then((r) => r.data),

  disconnect: () => api.post("/calendar/google/disconnect").then((r) => r.data),

  syncAll: () => api.post("/calendar/google/sync-all").then((r) => r.data),
};
