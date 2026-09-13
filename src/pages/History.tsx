import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, History, RotateCw, RotateCcw, RefreshCw, Download } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { Panel } from "@/components/deck/Panel";
import { Badge } from "@/components/deck/Badge";
import { Button } from "@/components/deck/Button";
import { EmptyState } from "@/components/deck/EmptyState";
import { Sparkline } from "@/components/instrument/Sparkline";
import { StatusBadge } from "@/components/instrument/StatusBadge";
import { useAppStore } from "@/lib/store";
import { fmtPercent, fmtTs } from "@/lib/derived";
import { machineSummaries, trendSeries } from "@/lib/stats";
import { useAssessments } from "@/hooks/use-machines";
import { cn } from "@/lib/utils/cn";

const RISK_OPTIONS = ["Low", "Medium", "High", "Critical"] as const;
const MODE_OPTIONS = ["TWF", "HDF", "PWF", "OSF", "RNF"] as const;

const inputCls =
  "h-9 w-full rounded-lg border border-hairline bg-overlay/70 px-3 font-mono text-sm tabular-nums text-ink outline-none transition-colors focus:border-signal/60";

function probColor(p: number): string {
  if (p >= 0.8) return "var(--color-status-critical)";
  if (p >= 0.6) return "var(--color-status-high)";
  if (p >= 0.35) return "var(--color-status-elevated)";
  return "var(--color-status-healthy)";
}

export function HistoryPage() {
  const localAssessments = useAppStore((s) => s.assessments);
  const { assessments: backendAssessments, loading, error, refetch } = useAssessments({ page_size: 100 });
  const [query, setQuery] = useState("");
  const [machine, setMachine] = useState("all");
  const [risk, setRisk] = useState("all");
  const [mode, setMode] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Merge local and backend assessments
  const allAssessments = useMemo(() => {
    const merged = [...backendAssessments, ...localAssessments];
    const seen = new Set<string>();
    return merged.filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    });
  }, [backendAssessments, localAssessments]);

  const machines = useMemo(() => machineSummaries(allAssessments).map((m) => m.machineId), [allAssessments]);
  const trend = useMemo(() => trendSeries(allAssessments), [allAssessments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allAssessments.filter((a) => {
      if (q) {
        const hay = `${a.inputs.machineId} ${a.mode.name} ${a.mode.code}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (machine !== "all" && a.inputs.machineId !== machine) return false;
      if (risk !== "all" && a.riskLevel !== risk) return false;
      if (mode === "NOMINAL") {
        if (a.mode.code !== "NONE") return false;
      } else if (mode !== "all" && a.mode.code !== mode) return false;
      const day = a.ts.slice(0, 10);
      if (dateFrom && day < dateFrom) return false;
      if (dateTo && day > dateTo) return false;
      return true;
    });
  }, [allAssessments, query, machine, risk, mode, dateFrom, dateTo]);

  const resetFilters = () => {
    setQuery("");
    setMachine("all");
    setRisk("all");
    setMode("all");
    setDateFrom("");
    setDateTo("");
  };

  if (!allAssessments.length && !loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          index="05 / Prediction History"
          title="Prediction history"
          description="Every persisted assessment across the fleet — refilterable by machine, risk level, failure mode, and time window."
        />
        <EmptyState
          icon={History}
          eyebrow="No history yet"
          title="No predictions recorded"
          description="Run your first machine assessment and it will land here with its failure probability, risk level, likely failure mode, and model source."
          action={
            <Link to="/analyze">
              <Button variant="primary" icon={<ArrowRight className="h-3.5 w-3.5" />} label="Run an assessment" />
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="05 / Prediction History"
        title="Prediction history"
        description="Every persisted assessment across the fleet — refilterable by machine, risk level, failure mode, and time window."
        right={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={refetch} loading={loading}>
              Refresh
            </Button>
          </div>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
          Failed to load assessments: {error}
        </div>
      )}

      <Panel title="Filters" eyebrow="Refine the log">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-8">
          <label className="block sm:col-span-2">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-ink-2">Search</span>
              <span className="font-mono text-[10px] text-ink-3">machine · mode</span>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="MM-0001, TWF, Heat dissipation…"
              className={inputCls}
            />
          </label>

          <label className="block">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-ink-2">Machine</span>
            </div>
            <select value={machine} onChange={(e) => setMachine(e.target.value)} className={inputCls}>
              <option value="all">All machines</option>
              {machines.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-ink-2">Risk</span>
              <span className="font-mono text-[10px] text-ink-3">Low · Critical</span>
            </div>
            <select value={risk} onChange={(e) => setRisk(e.target.value)} className={inputCls}>
              <option value="all">All risks</option>
              {RISK_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-ink-2">Failure mode</span>
              <span className="font-mono text-[10px] text-ink-3">NOMINAL · TWF · OSF</span>
            </div>
            <select value={mode} onChange={(e) => setMode(e.target.value)} className={inputCls}>
              <option value="all">All modes</option>
              <option value="NOMINAL">NOMINAL / No Failure</option>
              {MODE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-ink-2">From</span>
            </div>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} />
          </label>

          <label className="block">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-ink-2">To</span>
            </div>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputCls} />
          </label>

          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-full"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              label="Clear"
              onClick={resetFilters}
            />
          </div>
        </div>
      </Panel>

      <Panel title="Risk trend" eyebrow="All assessments · p(failure)">
        {trend.length >= 2 ? (
          <div className="flex h-full min-h-36 flex-col justify-end">
            <Sparkline values={trend.map((t) => t.probability)} stroke="var(--color-signal)" className="w-full" />
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[10px] text-ink-3">
              <span>
                {fmtTs(trend[0].ts, { full: true })} → {fmtTs(trend[trend.length - 1].ts, { full: true })}
              </span>
              <span>
                {allAssessments.length} assessments ·{" "}
                {fmtPercent(Math.min(...trend.map((t) => t.probability)))}–{fmtPercent(Math.max(...trend.map((t) => t.probability)))}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-ink-2">Run a second assessment to plot the failure-probability trend.</p>
        )}
      </Panel>

      <Panel
        title="Assessments"
        eyebrow="Newest first"
        right={
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3">
            {filtered.length} of {allAssessments.length} assessments
          </span>
        }
      >
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10 bg-surface">
                <tr>
                  {["Machine", "Time", "Probability", "Risk", "Mode", "Status"].map((h) => (
                    <th
                      key={h}
                      className="border-b border-hairline px-3 py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-ink-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="group">
                    <td className="border-b border-hairline/60 px-3 py-2.5">
                      <Link
                        to={`/machines?machine=${encodeURIComponent(a.inputs.machineId)}`}
                        className="font-mono text-xs text-ink transition-colors hover:text-signal"
                      >
                        {a.inputs.machineId}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap border-b border-hairline/60 px-3 py-2.5 font-mono text-[11px] tabular-nums text-ink-2">
                      {fmtTs(a.ts, { full: true, seconds: true })}
                    </td>
                    <td className="border-b border-hairline/60 px-3 py-2.5">
                      <span className="font-mono text-sm font-semibold tabular-nums" style={{ color: probColor(a.failureProbability) }}>
                        {fmtPercent(a.failureProbability)}
                      </span>
                    </td>
                    <td className="border-b border-hairline/60 px-3 py-2.5">
                      <StatusBadge value={a.riskLevel} />
                    </td>
                    <td className="border-b border-hairline/60 px-3 py-2.5">
                      <div className="flex flex-col items-start gap-0.5">
                        <Badge tone={a.mode.code === "NONE" ? "healthy" : "neutral"}>
                          {a.mode.code === "NONE" ? "NOMINAL" : a.mode.code}
                        </Badge>
                        <span className="text-[10px] text-ink-3">{a.mode.name}</span>
                      </div>
                    </td>
                    <td className="border-b border-hairline/60 px-3 py-2.5">
                      <Badge tone={a.source === "live" ? "signal" : "elevated"}>
                        {a.source === "live" ? "Live" : "Simulated"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex min-h-32 flex-col items-center justify-center gap-3 text-center">
            <p className="text-[13px] text-ink-2">No assessments match the current filters.</p>
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw className="h-3.5 w-3.5" />}
              label="Clear filters"
              onClick={resetFilters}
            />
          </div>
        )}
      </Panel>
    </div>
  );
}