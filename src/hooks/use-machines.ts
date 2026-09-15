import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api/client";

export interface Machine {
  id: string;
  machine_id: string;
  name: string;
  type?: string;
  location?: string;
  sensor_values: Record<string, any>;
  is_active: boolean;
  assessment_count: number;
  latest_health_status?: string;
  latest_risk_level?: string;
  created_at: string;
  updated_at: string;
}

export function useMachines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listMachines();
      setMachines(data.items ?? data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch machines");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { machines, loading, error, refetch: fetch };
}

export function useAssessments(params?: { machine_id?: string; page?: number; page_size?: number }) {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listAssessments(params);
      let items = data.items;

      // The list endpoint returns sparse summaries. Upgrade the newest
      // entries to full details so dashboards render inputs, failure
      // modes, evidence and recommendations. Capped to avoid a burst of
      // requests on large histories.
      if (items.length > 0 && (params?.page ?? 1) === 1) {
        const ids = items.slice(0, 25).flatMap((a: any) => (a?.id ? [a.id] : []));
        const details = await Promise.allSettled(
          ids.map((id: string) => api.getAssessment(id)),
        );
        const byId = new Map<string, any>();
        details.forEach((d) => {
          if (d.status === "fulfilled") byId.set(String(d.value.id), d.value);
        });
        items = items.map((a: any) => (a?.id && byId.has(a.id) ? byId.get(a.id) : a));
      }

      setAssessments(items);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch assessments");
    } finally {
      setLoading(false);
    }
  }, [params?.machine_id, params?.page, params?.page_size]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { assessments, total, loading, error, refetch: fetch };
}

export function useAlerts(params?: { machine_id?: string; severity?: string; page?: number; page_size?: number }) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listAlerts(params);
      setAlerts(data.items);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  }, [params?.machine_id, params?.severity, params?.page, params?.page_size]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { alerts, total, loading, error, refetch: fetch };
}
