export const APP = {
  name: "Fathom",
  product: "Predictive Maintenance Agent",
  defaultApiBase: "https://vvsgyuv123-predictive-maintenance-demo.hf.space",
  gradioApiPath: "/gradio_api",
  warmupTimeoutMs: 12000,
  alertThreshold: 0.6,
  criticalThreshold: 0.8,
  defaultMachineId: "MM-0001",
  storageKeys: {
    assessments: "fathom.assessments.v1",
    alerts: "fathom.alerts.v1",
    apiBase: "fathom.apiBase.v1",
    useSimulated: "fathom.useSimulated.v1",
  },
};

export function apiBase(): string {
  try {
    const stored = localStorage.getItem(APP.storageKeys.apiBase);
    if (stored) return stored;
  } catch {
    /* storage unavailable */
  }
  return import.meta.env.VITE_API_BASE ?? APP.defaultApiBase;
}

export function useSimulated(): boolean {
  try {
    return localStorage.getItem(APP.storageKeys.useSimulated) === "1";
  } catch {
    return false;
  }
}