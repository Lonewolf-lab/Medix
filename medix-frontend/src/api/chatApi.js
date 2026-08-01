import api from "./axiosInstance";

export const chatApi = {
  // -> ChatResponse
  sendMessage: (message, pinnedBiomarkers) =>
    api.post("/chat/message", { message, pinnedBiomarkers }).then((r) => r.data),

  // -> ChatResponse[]
  getHistory: () => api.get("/chat/history").then((r) => r.data),

  // -> void (204)
  clearHistory: () => api.delete("/chat/history").then((r) => r.data),
};
