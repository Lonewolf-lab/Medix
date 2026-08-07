import { create } from "zustand";

export const useServerStatusStore = create((set) => ({
  isServerSpinningUp: false,
  setServerSpinningUp: (val) => set({ isServerSpinningUp: val }),
}));
