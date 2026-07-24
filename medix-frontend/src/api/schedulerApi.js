import axiosInstance from "./axiosInstance";

export const schedulerApi = {
  executePrompt: async (prompt, todayDate = null, userTimeZone = null) => {
    const payload = {
      prompt,
      todayDate: todayDate || new Date().toISOString().split("T")[0],
      userTimeZone: userTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    const response = await axiosInstance.post("/scheduler/agent", payload);
    return response.data;
  },
};
