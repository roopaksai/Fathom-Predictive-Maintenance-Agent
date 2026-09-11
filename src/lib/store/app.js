import { create } from "zustand";
export const useAppStore = create((set) => ({
    connection: "checking",
    modelVersion: null,
    sidebarOpen: false,
    setConnection: (connection) => set({ connection }),
    setModelVersion: (modelVersion) => set({ modelVersion }),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
