import axiosInstance from "./axiosInstance";

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const schedulerApi = {
  executePrompt: async (prompt, todayDate = null, userTimeZone = null) => {
    const payload = {
      prompt,
      todayDate: todayDate || getLocalDateString(),
      userTimeZone: userTimeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    const response = await axiosInstance.post("/scheduler/agent", payload);
    return response.data;
  },
};

