import { useMemo, useState } from "react";
import { Check, Siren, Wrench } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { Panel } from "@/components/deck/Panel";
import { Badge } from "@/components/deck/Badge";
import { Button } from "@/components/deck/Button";
import { StatCard } from "@/components/instrument/StatCard";
import { StatusBadge } from "@/components/instrument/StatusBadge";
import { useAppStore } from "@/lib/store";
import { APP } from "@/lib/config";
import { fmtPercent, fmtTs } from "@/lib/derived";
import { cn } from "@/lib/utils/cn";
import type { AlertStatus, Severity } from "@/lib/types";

const SEVERITY_FILTERS = ["All", "Critical", "High", "Warning"] as const;
const STATUS_FILTERS = ["All", "Open", "Acknowledged", "Resolved"] as const;

type SeverityFilter = (typeof SEVERITY_FILTERS)[number];
type StatusFilter = (typeof STATUS_FILTERS)[number];

const SEVERITY_DOT: Record<Severity, string> = {
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
  const alerts = useAppStore((s) => s.alerts);
  const acknowledgeAlert = useAppStore((s) => s.acknowledgeAlert);
  const resolveAlert = useAppStore((s) => s.resolveAlert);

  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [query, setQuery] = useState("");

  const openCount = useMemo(() => alerts.filter((a) => a.status === "Open").length, [alerts]);
  const acknowledgedCount = useMemo(
    () => alerts.filter((a) => a.status === "Acknowledged").length,
    [alerts],
  );
  const resolvedCount = useMemo(
    () => alerts.filter((a) => a.status === "Resolved").length,
    [alerts],
  );

  const filteredAlerts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return alerts.filter((a) => {
      if (severityFilter !== "All" && a.severity !== severityFilter) return false;
      if (statusFilter !== "All" && a.status !== statusFilter) return false;
      if (q && !(a.machineId.toLowerCase().includes(q) || a.modeName.toLowerCase().includes(q))) {
        return false;
      }
      return true;
    });
  }, [alerts, severityFilter, statusFilter, query]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="04 / Alert Center"
        title="Alert center"
        description="Every filed alert — open, acknowledged, and resolved — with the evidence and recommended action from the originating assessment."
        right={
          <Badge tone={openCount > 0 ? "critical" : "healthy"}>
            {openCount} open
          </Badge>
        }
      />

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

      <Panel title="Filed alerts" eyebrow={`${filteredAlerts.length} of ${alerts.length}`}>
        {alerts.length === 0 ? (
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
                      />
                    )}
                    {(a.status === "Open" || a.status === "Acknowledged") && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Check className="h-3.5 w-3.5" />}
                        label="Resolve"
                        onClick={() => resolveAlert(a.id)}
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