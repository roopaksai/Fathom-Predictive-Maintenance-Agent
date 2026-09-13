import { useMemo, useState, useEffect } from "react";
import { Check, Siren, Wrench, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { Panel } from "@/components/deck/Panel";
import { Badge } from "@/components/deck/Badge";
import { Button } from "@/components/deck/Button";
import { StatCard } from "@/components/instrument/StatCard";
import { StatusBadge } from "@/components/instrument/StatusBadge";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/context/AuthContext";
import { APP } from "@/lib/config";
import { fmtPercent, fmtTs } from "@/lib/derived";
import { cn } from "@/lib/utils/cn";
import { useAlerts } from "@/hooks/use-machines";
import type { AlertStatus, Severity } from "@/lib/types";

const SEVERITY_FILTERS = ["All", "Critical", "High", "Warning"] as const;
const STATUS_FILTERS = ["All", "Open", "Acknowledged", "Resolved"] as const;

type SeverityFilter = (typeof SEVERITY_FILTERS)[number];
type StatusFilter = (typeof STATUS_FILTERS)[number];

const SEVERITY_DOT: Record<string, string> = {
  Critical: "text-status-critical",
  High: "text-status-high",
  Warning: "text-status-elevated",
};

function SegmentedFilter<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "h-9 min-w-0 truncate rounded-lg border px-1 font-mono text-[10px] font-semibold uppercase tracking-wide transition-colors",
            value === opt
              ? "border-signal/50 bg-signal-dim text-signal"
              : "border-hairline bg-overlay/60 text-ink-3 hover:text-ink",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function AlertCenter() {
  const { user, hasRole } = useAuth();
  const { alerts: backendAlerts, loading, error, refetch } = useAlerts();
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [query, setQuery] = useState("");
  const [acknowledging, setAcknowledging] = useState<Set<string>>(new Set());
  const [resolving, setResolving] = useState<Set<string>>(new Set());

  // Merge local and backend alerts
  const localAlerts = useAppStore((s) => s.alerts);
  const allAlerts = useMemo(() => {
    const merged = [...backendAlerts, ...localAlerts];
    // Deduplicate by assessmentId
    const seen = new Set<string>();
    return merged.filter((a) => {
      if (seen.has(a.assessmentId)) return false;
      seen.add(a.assessmentId);
      return true;
    });
  }, [backendAlerts, localAlerts]);

  const openCount = useMemo(() => allAlerts.filter((a) => a.status === "Open").length, [allAlerts]);
  const acknowledgedCount = useMemo(
    () => allAlerts.filter((a) => a.status === "Acknowledged").length,
    [allAlerts],
  );
  const resolvedCount = useMemo(
    () => allAlerts.filter((a) => a.status === "Resolved").length,
    [allAlerts],
  );

  const filteredAlerts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allAlerts.filter((a) => {
      if (severityFilter !== "All" && a.severity !== severityFilter) return false;
      if (statusFilter !== "All" && a.status !== statusFilter) return false;
      if (q && !(a.machineId.toLowerCase().includes(q) || a.modeName.toLowerCase().includes(q))) {
        return false;
      }
      return true;
    });
  }, [allAlerts, severityFilter, statusFilter, query]);

  const acknowledgeAlert = async (id: string) => {
    setAcknowledging((prev) => new Set(prev).add(id));
    try {
      // Try backend first
      const { api } = await import("@/lib/api/client");
      await api.acknowledgeAlert(id);
    } catch {
      // Fallback to local store
      useAppStore.getState().acknowledgeAlert(id);
    } finally {
      setAcknowledging((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      refetch();
    }
  };

  const resolveAlert = async (id: string) => {
    setResolving((prev) => new Set(prev).add(id));
    try {
      const { api } = await import("@/lib/api/client");
      await api.resolveAlert(id);
    } catch {
      useAppStore.getState().resolveAlert(id);
    } finally {
      setResolving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      refetch();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="04 / Alert Center"
        title="Alert center"
        description="Every filed alert — open, acknowledged, and resolved — with the evidence and recommended action from the originating assessment."
        right={
          <div className="flex items-center gap-2">
            <Badge tone={openCount > 0 ? "critical" : "healthy"}>
              {openCount} open
            </Badge>
            <Button variant="ghost" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={refetch} loading={loading}>
              Refresh
            </Button>
          </div>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
          Failed to load alerts: {error}
        </div>
      )}

      <section aria-label="Alert summary" className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">
        <StatCard label="Open" value={String(openCount)} unit="awaiting action" tone={openCount > 0 ? "critical" : "neutral"} />
        <StatCard label="Acknowledged" value={String(acknowledgedCount)} unit="in review" tone="elevated" />
        <StatCard label="Resolved" value={String(resolvedCount)} unit="closed" tone="healthy" />
      </section>

      <Panel bodyClassName="p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:items-end">
          <div>
            <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">Severity</p>
            <SegmentedFilter options={SEVERITY_FILTERS} value={severityFilter} onChange={setSeverityFilter} />
          </div>
          <div>
            <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">Status</p>
            <SegmentedFilter options={STATUS_FILTERS} value={statusFilter} onChange={setStatusFilter} />
          </div>
          <label className="block">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">Search</span>
              <span className="font-mono text-[10px] text-ink-3">machine · mode</span>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="MM-0001 · bearing degradation"
              className="h-9 w-full rounded-lg border border-hairline bg-overlay/70 px-3 font-mono text-sm tabular-nums text-ink outline-none transition-colors focus:border-signal/60"
            />
          </label>
        </div>
      </Panel>

      <Panel title="Filed alerts" eyebrow={`${filteredAlerts.length} of ${allAlerts.length}`}>
        {allAlerts.length === 0 && !loading ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-2.5 text-center">
            <Siren className="h-6 w-6 text-ink-3" strokeWidth={1.4} />
            <div>
              <p className="text-sm font-medium text-ink">No alerts filed yet</p>
              <p className="mt-1 text-[12.5px] text-ink-2">
                Assessments above {fmtPercent(APP.alertThreshold)} auto-file an alert here.
              </p>
            </div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex min-h-28 items-center justify-center text-center">
            <p className="text-[13px] text-ink-2">No alerts match the current filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAlerts.map((a) => (
              <div key={a.id} className="rounded-lg border border-hairline bg-surface/40 px-3.5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span
                        aria-hidden
                        className={cn("h-2 w-2 shrink-0 rounded-full bg-current", SEVERITY_DOT[a.severity])}
                      />
                      <span className="font-mono text-xs text-ink">{a.machineId}</span>
                      <span className="font-mono text-[10px] tabular-nums text-ink-3">
                        {fmtTs(a.ts, { full: true, seconds: true })}
                      </span>
                      <span className="font-mono text-sm font-semibold tabular-nums text-ink">
                        {fmtPercent(a.failureProbability)}
                      </span>
                      <StatusBadge value={a.riskLevel} />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-3">
                        {a.modeCode} · {a.modeName}
                      </span>
                    </div>
                    {a.evidence.length > 0 && (
                      <p className="line-clamp-2 max-w-2xl text-[12px] leading-relaxed text-ink-2">
                        {a.evidence.slice(0, 2).join(" · ")}
                      </p>
                    )}
                    <p className="flex items-start gap-1.5 text-[11.5px] leading-relaxed text-ink-3">
                      <Wrench className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.6} />
                      <span className="min-w-0">{a.recommendation}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {a.status === "Open" && (
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Check className="h-3.5 w-3.5" />}
                        label="Acknowledge"
                        onClick={() => acknowledgeAlert(a.id)}
                        loading={acknowledging.has(a.id)}
                      />
                    )}
                    {(a.status === "Open" || a.status === "Acknowledged") && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Check className="h-3.5 w-3.5" />}
                        label="Resolve"
                        onClick={() => resolveAlert(a.id)}
                        loading={resolving.has(a.id)}
                      />
                    )}
                    {a.status === "Resolved" && <Badge tone="healthy">Resolved</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}