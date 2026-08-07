import { create } from "zustand";

const isLocal = 
  window.location.hostname === "localhost" || 
  window.location.hostname === "127.0.0.1";

export const useServerStatusStore = create((set) => ({
  isServerSpinningUp: false,
  isAwake: isLocal, // If local, treat it as always awake
  setServerSpinningUp: (val) => set((state) => {
    // If it's local or already confirmed awake, don't show the overlay
    if (isLocal || (state.isAwake && val)) {
      return { isServerSpinningUp: false };
    }
    return { isServerSpinningUp: val };
  }),
  setAwake: (val) => set({ isAwake: val, isServerSpinningUp: !val && !isLocal }),
}));

