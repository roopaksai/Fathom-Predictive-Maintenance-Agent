import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Cpu, Search, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { Panel } from "@/components/deck/Panel";
import { EmptyState } from "@/components/deck/EmptyState";
import { Button } from "@/components/deck/Button";
import { Badge } from "@/components/deck/Badge";
import { StatusDot } from "@/components/deck/StatusDot";
import { StatusBadge, toneForStatus } from "@/components/instrument/StatusBadge";
import { RiskGauge } from "@/components/instrument/RiskGauge";
import { Sparkline } from "@/components/instrument/Sparkline";
import { FeatureBars } from "@/components/instrument/FeatureBars";
import { useAppStore } from "@/lib/store";
import { derive, fmtNum, fmtPercent, fmtInt, fmtTs } from "@/lib/derived";
import { machineSummaries } from "@/lib/stats";
import { useMachines, useAssessments } from "@/hooks/use-machines";
import { cn } from "@/lib/utils/cn";

type MachineSummary = ReturnType<typeof machineSummaries>[number];

export function MachineHealth() {
  const connection = useAppStore((s) => s.connection);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");

  const { machines, loading: machinesLoading, error: machinesError, refetch: refetchMachines } = useMachines();
  const { assessments, loading: assessmentsLoading, error: assessmentsError, refetch: refetchAssessments } = useAssessments();

  const summaries = useMemo(() => machineSummaries(assessments), [assessments]);

  const active = useMemo<MachineSummary | undefined>(() => {
    const requested = searchParams.get("machine");
    return summaries.find((m) => m.machineId === requested) ?? summaries[0];
  }, [summaries, searchParams]);

  const filtered = useMemo(
    () => summaries.filter((m) => m.machineId.toLowerCase().includes(query.trim().toLowerCase())),
    [summaries, query],
  );

  const tone = connection.status === "live" ? "healthy" : connection.status === "simulated" ? "elevated" : connection.status === "offline" ? "critical" : "neutral";
  const connLabel = connection.status === "live" ? "Live" : connection.status === "simulated" ? "Simulated" : connection.status === "offline" ? "Offline" : "Connecting";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="03 / Machine Health"
        title="Machine health"
        description="Per-machine health status, latest failure risk, and signal history for every assessed unit."
        right={
          <div className="flex items-center gap-2">
            <div className="flex h-9 items-center gap-2.5 rounded-full border border-hairline bg-overlay/70 px-4">
              <StatusDot tone={tone} pulse={connection.status === "checking" || connection.status === "live"} size="sm" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-2">{connLabel}</span>
            </div>
            <Button variant="ghost" size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => { refetchMachines(); refetchAssessments(); }}>
              Refresh
            </Button>
          </div>
        }
      />

      {machinesError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
          Failed to load machines: {machinesError}
        </div>
      )}

      {assessmentsError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
          Failed to load assessments: {assessmentsError}
        </div>
      )}

      {!summaries.length && !machinesLoading && !assessmentsLoading ? (
        <EmptyState
          icon={Cpu}
          eyebrow="No machines yet"
          title="No assessed units to chart"
          description="Run your first assessment and this page lists every machine with its health status, latest failure risk, and per-run signal history."
          action={
            <Link to="/analyze">
              <Button variant="primary" icon={<ArrowRight className="h-3.5 w-3.5" />} label="Run an assessment" />
            </Link>
          }
        />
      ) : (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Fleet" eyebrow="Select machine">
            {machinesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-signal-cyan border-t-transparent" />
              </div>
            ) : (
              <>
                <div className="relative mb-3">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" strokeWidth={1.8} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Filter machines…"
                    className="h-9 w-full rounded-lg border border-hairline bg-overlay/70 pl-8 pr-3 font-mono text-sm tabular-nums text-ink outline-none transition-colors focus:border-signal/60"
                  />
                </div>
                <ul className="max-h-[420px] space-y-1.5 overflow-y-auto pr-0.5">
                  {filtered.map((m) => {
                    const isActive = active?.machineId === m.machineId;
                    return (
                      <li key={m.machineId}>
                        <button
                          type="button"
                          onClick={() => setSearchParams({ machine: m.machineId })}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
                            isActive ? "border-signal/30 bg-signal-dim/40" : "border-hairline bg-surface/40 hover:bg-white/5",
                          )}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-mono text-xs text-ink">{m.machineId}</span>
                              <StatusBadge value={m.latest.healthStatus} />
                            </div>
                            <p className="mt-0.5 font-mono text-[10px] tabular-nums text-ink-3">
                              {m.count} assessment{m.count === 1 ? "" : "s"}
                            </p>
                          </div>
                          <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-ink">
                            {fmtPercent(m.latest.failureProbability)}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  {!filtered.length && (
                    <li className="rounded-lg border border-hairline bg-surface/40 px-3 py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                      No matches
                    </li>
                  )}
                </ul>
              </>
            )}
          </Panel>

          {active && <MachineDetail summary={active} />}
        </section>
      )}
    </div>
  );
}

function MachineDetail({ summary }: { summary: MachineSummary }) {
  const latest = summary.latest;
  const alertTone = toneForStatus(latest.riskLevel);
  const derived = derive(latest.inputs);

  const statRows: { label: string; node: React.ReactNode }[] = [
    { label: "Health status", node: <StatusBadge value={latest.healthStatus} /> },
    { label: "Risk level", node: <StatusBadge value={latest.riskLevel} /> },
    { label: "Priority", node: <StatusBadge value={latest.priority} /> },
    { label: "Decision threshold", node: <span className="font-mono text-xs tabular-nums text-ink">{fmtPercent(latest.threshold)}</span> },
    ...(latest.anomalyPercentile !== undefined && Number.isFinite(latest.anomalyPercentile)
      ? [{ label: "Anomaly percentile", node: <span className="font-mono text-xs tabular-nums text-ink">{fmtNum(latest.anomalyPercentile)}%</span> }]
      : []),
  ];

  const runnerUps = latest.modes.filter((m) => m.code !== "NONE" && m.code !== latest.mode.code);

  return (
    <div className="flex flex-col gap-4 lg:col-span-2">
      <Panel
        title={summary.machineId}
        eyebrow="Latest assessment"
        right={
          <div className="flex min-w-0 items-center gap-2">
            <Badge tone={latest.source === "live" ? "signal" : "elevated"}>
              {latest.source === "live" ? "Live" : "Simulated"}
            </Badge>
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-ink-3">{fmtTs(latest.ts, { full: true })}</span>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-1 py-2 sm:flex-row sm:justify-around">
          <RiskGauge probability={Number.isFinite(latest.failureProbability) ? latest.failureProbability : 0} size={190} />
          <div className="w-full max-w-60 space-y-3">
            {statRows.map((row, i) => (
              <div
                key={row.label}
                className={cn(
                  "flex items-center justify-between gap-2",
                  i < statRows.length - 1 && "border-b border-hairline pb-2",
                )}
              >
                <span className="text-[11px] text-ink-2">{row.label}</span>
                {row.node}
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Failure mode" eyebrow="Predicted class">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-surface/50 px-3.5 py-3">
            <span className="truncate text-sm font-medium text-ink">{latest.mode.name}</span>
            <Badge tone={latest.mode.code === "NONE" ? "healthy" : alertTone} className="shrink-0">
              {latest.mode.code === "NONE" ? "Nominal" : latest.mode.code}
            </Badge>
          </div>
          {latest.mode.confidence !== undefined && (
            <p className="text-[11px] text-ink-3">Confidence {fmtPercent(latest.mode.confidence)}</p>
          )}
          {runnerUps.length > 0 && (
            <div className="space-y-1.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">Runner-up modes</p>
              {runnerUps.slice(0, 3).map((m) => (
                <div key={m.code} className="flex items-center justify-between text-[12px]">
                  <span className="truncate text-ink-2">{m.name}</span>
                  <span className="shrink-0 font-mono tabular-nums text-ink-3">
                    {m.probability !== undefined ? fmtPercent(m.probability) : m.confidence !== undefined ? fmtPercent(m.confidence) : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      <Panel title="Derived parameters" eyebrow="Computed">
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { sym: "ΔT", name: "Process − Air", value: fmtNum(derived.tempDifference, 1), unit: "K" },
              { sym: "P", name: "Mech power", value: fmtInt(derived.mechanicalPower), unit: "W" },
              { sym: "TS", name: "Overstrain", value: fmtInt(derived.overstrain), unit: "W·min" },
            ] as const
          ).map((c) => (
            <div key={c.sym} className="rounded-lg border border-hairline bg-surface/50 px-2.5 py-2.5">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">{c.sym} · {c.name}</p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-ink">
                {c.value} <span className="text-[10px] font-normal text-ink-3">{c.unit}</span>
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Risk trend" eyebrow={`${summary.machineId} · p(failure)`}>
        {summary.count >= 2 ? (
          <div className="flex h-full min-h-36 flex-col justify-end">
            <Sparkline
              values={summary.trend.map((a) => a.failureProbability).filter((v) => Number.isFinite(v))}
              stroke="var(--color-signal)"
              className="w-full"
            />
            <div className="mt-2 flex justify-between font-mono text-[10px] tabular-nums text-ink-3">
              <span>{summary.count} assessments</span>
              <span>0–100%</span>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-ink-2">Run a second assessment on this machine to plot a trend.</p>
        )}
      </Panel>

      <Panel title="Contributing features" eyebrow="Signal attribution">
        {latest.contributing.length ? (
          <FeatureBars features={latest.contributing} />
        ) : (
          <p className="text-[13px] text-ink-2">No signal attribution returned for this run.</p>
        )}
      </Panel>
    </div>
  );
}