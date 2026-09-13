import type { AssessInput, Assessment, Alert } from "@/lib/types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      credentials: "include",
      headers,
    });

    if (!res.ok) {
      let message = `API Error: ${res.status}`;
      try {
        const err = await res.json();
        message = err.detail || message;
      } catch {
        // Ignore parse error
      }
      throw new Error(message);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: any }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request<void>("/api/v1/auth/logout", { method: "POST" });
  }

  async getMe() {
    return this.request<any>("/api/v1/auth/me");
  }

  // Assessments
  async predict(input: AssessInput): Promise<Assessment> {
    return this.request<Assessment>("/api/v1/assessments/predict", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async listAssessments(params?: {
    page?: number;
    page_size?: number;
    machine_id?: string;
    mission_id?: string;
    source?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) searchParams.set(k, String(v));
      });
    }
    return this.request<{ items: Assessment[]; total: number; page: number; page_size: number }>(
      `/api/v1/assessments?${searchParams.toString()}`
    );
  }

  async getAssessment(id: string) {
    return this.request<Assessment>(`/api/v1/assessments/${id}`);
  }

  // Alerts
  async listAlerts(params?: {
    page?: number;
    page_size?: number;
    status?: string;
    severity?: string;
    machine_id?: string;
    mission_id?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) searchParams.set(k, String(v));
      });
    }
    return this.request<{ items: Alert[]; total: number; page: number; page_size: number }>(
      `/api/v1/alerts?${searchParams.toString()}`
    );
  }

  async getAlert(id: string) {
    return this.request<Alert>(`/api/v1/alerts/${id}`);
  }

  async acknowledgeAlert(id: string) {
    return this.request<Alert>(`/api/v1/alerts/${id}/acknowledge`, { method: "PATCH" });
  }

  async resolveAlert(id: string) {
    return this.request<Alert>(`/api/v1/alerts/${id}/resolve`, { method: "PATCH" });
  }

  // Missions
  async listMissions() {
    return this.request<any[]>("/api/v1/missions");
  }

  async getMission(id: string) {
    return this.request<any>(`/api/v1/missions/${id}`);
  }

  async createMission(data: { name: string; description?: string; mission_type: string }) {
    return this.request<any>("/api/v1/missions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMission(id: string, data: Partial<{ name: string; description?: string; is_active: boolean }>) {
    return this.request<any>(`/api/v1/missions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteMission(id: string) {
    return this.request<void>(`/api/v1/missions/${id}`, { method: "DELETE" });
  }

  async assignMissionWorkers(missionId: string, userIds: string[]) {
    return this.request<any>(`/api/v1/missions/${missionId}/assign-workers`, {
      method: "POST",
      body: JSON.stringify({ user_ids: userIds }),
    });
  }

  // Machines
  async listMachines() {
    return this.request<any[]>("/api/v1/machines");
  }

  async getMachine(id: string) {
    return this.request<any>(`/api/v1/machines/${id}`);
  }

  async createMachine(data: {
    machine_id: string;
    name: string;
    model?: string;
    mission_id: string;
    location?: string;
  }) {
    return this.request<any>("/api/v1/machines", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMachine(id: string, data: Partial<{ name: string; model?: string; location?: string; is_active: boolean }>) {
    return this.request<any>(`/api/v1/machines/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteMachine(id: string) {
    return this.request<void>(`/api/v1/machines/${id}`, { method: "DELETE" });
  }

  async assignMachineWorkers(machineId: string, userIds: string[]) {
    return this.request<any>(`/api/v1/machines/${machineId}/assign-workers`, {
      method: "POST",
      body: JSON.stringify({ user_ids: userIds }),
    });
  }

  // Reports
  async generateReport(data: {
    format: "csv" | "xlsx";
    date_from: string;
    date_to: string;
    mission_id?: string;
    machine_id?: string;
    include_alerts?: boolean;
    include_assessments?: boolean;
  }) {
    return this.request<any>("/api/v1/reports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async listReports() {
    return this.request<any[]>("/api/v1/reports");
  }

  async getReport(id: string) {
    return this.request<any>(`/api/v1/reports/${id}`);
  }

  async downloadReport(id: string): Promise<Blob> {
    const res = await fetch(`${this.baseUrl}/api/v1/reports/${id}/download`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to download report");
    return res.blob();
  }

  // Health
  async healthCheck() {
    return this.request<any>("/api/v1/health");
  }

  async detailedHealthCheck() {
    return this.request<any>("/api/v1/health/detailed");
  }

  async version() {
    return this.request<any>("/api/v1/version");
  }
}

export const api = new ApiClient();