export const sortBiomarkersByPriority = (biomarkers = []) => {
  if (!Array.isArray(biomarkers)) return [];

  const isAbnormal = (status) => {
    if (!status) return false;
    const s = String(status).toUpperCase().trim();
    return s === "HIGH" || s === "LOW" || s === "ABNORMAL" || s === "ELEVATED" || s === "CRITICAL";
  };

  return [...biomarkers].sort((a, b) => {
    const abA = isAbnormal(a?.status);
    const abB = isAbnormal(b?.status);

    if (abA !== abB) {
      return abA ? -1 : 1; // Abnormal comes first
    }

    const paramA = (a?.parameter || "").toLowerCase();
    const paramB = (b?.parameter || "").toLowerCase();
    return paramA.localeCompare(paramB); // Alphabetical A-Z
  });
};
