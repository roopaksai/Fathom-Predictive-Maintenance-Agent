import { create } from "zustand";

export type ConnectionStatus = "checking" | "live" | "simulated" | "offline";

interface AppState {
  connection: ConnectionStatus;
  modelVersion: string | null;
  sidebarOpen: boolean;
  setConnection: (status: ConnectionStatus) => void;
  setModelVersion: (version: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  connection: "checking",
  modelVersion: null,
  sidebarOpen: false,
  setConnection: (connection) => set({ connection }),
  setModelVersion: (modelVersion) => set({ modelVersion }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));