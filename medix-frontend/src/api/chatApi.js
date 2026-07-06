import api from "./axiosInstance";

export const chatApi = {
  // -> ChatResponse
  sendMessage: (message) => api.post("/chat/message", { message }).then((r) => r.data),

  // -> ChatResponse[]
  getHistory: () => api.get("/chat/history").then((r) => r.data),

  // -> void (204)
  clearHistory: () => api.delete("/chat/history").then((r) => r.data),
};
