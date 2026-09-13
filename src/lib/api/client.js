const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";
class ApiClient {
    baseUrl;
    accessToken = null;
    constructor(baseUrl = API_BASE) {
        this.baseUrl = baseUrl;
    }
    setAccessToken(token) {
        this.accessToken = token;
    }
    async request(endpoint, options = {}) {
        const headers = {
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
            }
            catch {
                // Ignore parse error
            }
            throw new Error(message);
        }
        if (res.status === 204) {
            return undefined;
        }
        return res.json();
    }
    // Auth
    async login(email, password) {
        return this.request("/api/v1/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
    }
    async logout() {
        return this.request("/api/v1/auth/logout", { method: "POST" });
    }
    async getMe() {
        return this.request("/api/v1/auth/me");
    }
    // Assessments
    async predict(input) {
        return this.request("/api/v1/assessments/predict", {
            method: "POST",
            body: JSON.stringify(input),
        });
    }
    async listAssessments(params) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined)
                    searchParams.set(k, String(v));
            });
        }
        return this.request(`/api/v1/assessments?${searchParams.toString()}`);
    }
    async getAssessment(id) {
        return this.request(`/api/v1/assessments/${id}`);
    }
    // Alerts
    async listAlerts(params) {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined)
                    searchParams.set(k, String(v));
            });
        }
        return this.request(`/api/v1/alerts?${searchParams.toString()}`);
    }
    async getAlert(id) {
        return this.request(`/api/v1/alerts/${id}`);
    }
    async acknowledgeAlert(id) {
        return this.request(`/api/v1/alerts/${id}/acknowledge`, { method: "PATCH" });
    }
    async resolveAlert(id) {
        return this.request(`/api/v1/alerts/${id}/resolve`, { method: "PATCH" });
    }
    // Missions
    async listMissions() {
        return this.request("/api/v1/missions");
    }
    async getMission(id) {
        return this.request(`/api/v1/missions/${id}`);
    }
    async createMission(data) {
        return this.request("/api/v1/missions", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    async updateMission(id, data) {
        return this.request(`/api/v1/missions/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }
    async deleteMission(id) {
        return this.request(`/api/v1/missions/${id}`, { method: "DELETE" });
    }
    async assignMissionWorkers(missionId, userIds) {
        return this.request(`/api/v1/missions/${missionId}/assign-workers`, {
            method: "POST",
            body: JSON.stringify({ user_ids: userIds }),
        });
    }
    // Machines
    async listMachines() {
        return this.request("/api/v1/machines");
    }
    async getMachine(id) {
        return this.request(`/api/v1/machines/${id}`);
    }
    async createMachine(data) {
        return this.request("/api/v1/machines", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    async updateMachine(id, data) {
        return this.request(`/api/v1/machines/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }
    async deleteMachine(id) {
        return this.request(`/api/v1/machines/${id}`, { method: "DELETE" });
    }
    async assignMachineWorkers(machineId, userIds) {
        return this.request(`/api/v1/machines/${machineId}/assign-workers`, {
            method: "POST",
            body: JSON.stringify({ user_ids: userIds }),
        });
    }
    // Reports
    async generateReport(data) {
        return this.request("/api/v1/reports", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    async listReports() {
        return this.request("/api/v1/reports");
    }
    async getReport(id) {
        return this.request(`/api/v1/reports/${id}`);
    }
    async downloadReport(id) {
        const res = await fetch(`${this.baseUrl}/api/v1/reports/${id}/download`, {
            credentials: "include",
        });
        if (!res.ok)
            throw new Error("Failed to download report");
        return res.blob();
    }
    // Health
    async healthCheck() {
        return this.request("/api/v1/health");
    }
    async detailedHealthCheck() {
        return this.request("/api/v1/health/detailed");
    }
    async version() {
        return this.request("/api/v1/version");
    }
}
export const api = new ApiClient();
