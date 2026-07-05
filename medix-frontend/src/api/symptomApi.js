import api from "./axiosInstance";

export const symptomApi = {
  // payload: { symptoms: string[], additionalNotes?: string }
  // returns: { severity: string, possibleCauses: string[], recommendation: string, disclaimer: string, timestamp: string }
  analyze: (payload) => api.post("/symptoms/analyze", payload).then((r) => r.data),

  // returns list of past SymptomLogs
  getHistory: () => api.get("/symptoms/history").then((r) => r.data),
};
