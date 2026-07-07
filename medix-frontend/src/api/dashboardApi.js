import api from "./axiosInstance";

export const dashboardApi = {
  // -> DashboardReportResponse
  uploadReport: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post("/dashboard/upload-report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  // -> DashboardSummaryResponse
  getSummary: () => api.get("/dashboard/health-summary").then((r) => r.data),

  // -> DashboardReportResponse[]
  getReports: () => api.get("/dashboard/reports").then((r) => r.data),

  // -> void
  deleteReport: (id) => api.delete(`/dashboard/reports/${id}`).then((r) => r.data),

  // -> ChatResponse
  biomarkerChat: (biomarkerName, message) =>
    api.post("/dashboard/biomarker-chat", { biomarkerName, message }).then((r) => r.data),
};
