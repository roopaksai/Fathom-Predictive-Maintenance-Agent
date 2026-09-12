import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CircleGauge, History, ScanSearch, Siren, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { StatusDot } from "@/components/deck/StatusDot";
import { Panel } from "@/components/deck/Panel";
import { EmptyState } from "@/components/deck/EmptyState";
import { Button } from "@/components/deck/Button";
import { StatCard } from "@/components/instrument/StatCard";
import { RiskGauge } from "@/components/instrument/RiskGauge";
import { DistributionBar } from "@/components/instrument/DistributionBar";
import { Sparkline } from "@/components/instrument/Sparkline";
import { StatusBadge } from "@/components/instrument/StatusBadge";
import { useAppStore } from "@/lib/store";
import { APP } from "@/lib/config";
import { fmtPercent, fmtTs } from "@/lib/derived";
import { machineSummaries, countByHealth, meanProbability, atRisk, trendSeries } from "@/lib/stats";
import type { Assessment, RiskLevel } from "@/lib/types";

const RISK_META: Record<RiskLevel, { color: string }> = {
  Low: { color: "var(--color-status-healthy)" },
  Medium: { color: "var(--color-status-elevated)" },
  High: { color: "var(--color-status-high)" },
  Critical: { color: "var(--color-status-critical)" },
};

export function Overview() {
  const assessments = useAppStore((s) => s.assessments);
  const alerts = useAppStore((s) => s.alerts);
  const connection = useAppStore((s) => s.connection);

  const stats = useMemo(() => {
    const summaries = machineSummaries(assessments);
    const fleetLatest = summaries.map((m) => m.latest);
    const health = countByHealth(fleetLatest);
    const riskCounts = { Low: 0, Medium: 0, High: 0, Critical: 0 } as Record<RiskLevel, number>;
    for (const a of fleetLatest) riskCounts[a.riskLevel]++;
    const meanProb = meanProbability(fleetLatest);
    const unitsAtRisk = atRisk(fleetLatest, APP.alertThreshold).length;
    const openAlerts = alerts.filter((a) => a.status === "Open").length;
    const trend = trendSeries(assessments).slice(-48);
    return { summaries, health, riskCounts, meanProb, unitsAtRisk, openAlerts, trend };
  }, [assessments, alerts]);

  const tone = connection.status === "live" ? "healthy" : connection.status === "simulated" ? "elevated" : connection.status === "offline" ? "critical" : "neutral";
  const connLabel = connection.status === "live" ? "Live model" : connection.status === "simulated" ? "Simulated engine" : connection.status === "offline" ? "Offline" : "Connecting";

  const attention = stats.summaries
    .map((m) => m.latest)
    .filter((a) => a.riskLevel === "High" || a.riskLevel === "Critical")
    .sort((a, b) => b.failureProbability - a.failureProbability);

  const riskSegments = (Object.keys(RISK_META) as RiskLevel[]).map((k) => ({
    key: k,
    label: k,
    count: stats.riskCounts[k],
    color: RISK_META[k].color,
  }));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="01 / Dashboard"
        title="Fleet overview"
        description="Aggregate machine health, failure risk, and open attention — computed from persisted assessments."
        right={
          <div className="flex h-9 items-center gap-2.5 rounded-full border border-hairline bg-overlay/70 px-4">
            <StatusDot tone={tone} pulse={connection.status === "checking" || connection.status === "live"} size="sm" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-2">{connLabel}</span>
          </div>
        }
      />

      {!assessments.length ? (
        <EmptyState
          icon={ScanSearch}
          eyebrow="No assessments yet"
          title="The fleet is quiet — for now"
          description="Run your first machine assessment to seed the health summary, risk distribution, and alert feed. The live model powers each run; if it is unreachable the app falls back to the simulated engine and labels results honestly."
          action={
            <Link to="/analyze">
              <Button variant="primary" icon={<ArrowRight className="h-3.5 w-3.5" />} label="Run an assessment" />
            </Link>
          }
        />
      ) : (
        <>
          <section aria-label="Fleet metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <StatCard label="Machines tracked" value={String(stats.summaries.length)} unit="fleet" />
            <StatCard
              label="Fleet health"
              value={`${(stats.meanProb * 100).toFixed(1)}%`}
              unit="mean failure risk"
              tone={
                stats.meanProb >= 0.6 ? "critical" : stats.meanProb >= 0.35 ? "elevated" : "healthy"
              }
            />
            <StatCard label="Units at risk" value={String(stats.unitsAtRisk)} unit="≥ 60% threshold" tone={stats.unitsAtRisk > 0 ? "high" : "neutral"} />
            <StatCard label="Open alerts" value={String(stats.openAlerts)} unit="awaiting action" tone={stats.openAlerts > 0 ? "critical" : "neutral"} />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Panel title="Fleet risk gauge" eyebrow="Aggregate signal">
              <div className="flex items-center justify-center py-2">
                <RiskGauge probability={stats.meanProb} size={210} label="Mean failure risk" />
              </div>
            </Panel>
            <Panel title="Failure risk distribution" eyebrow="Latest per machine" className="lg:col-span-2">
              <div className="flex h-full flex-col justify-center gap-4 py-1">
                <DistributionBar segments={riskSegments} />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(
                    [
                      ["Normal", stats.health.Normal, "var(--color-status-healthy)"],
                      ["Warning", stats.health.Warning, "var(--color-status-elevated)"],
                      ["High risk", stats.health["High Risk"], "var(--color-status-high)"],
                      ["Critical", stats.health.Critical, "var(--color-status-critical)"],
                    ] as const
                  ).map(([label, count, color]) => (
                    <div key={label} className="rounded-lg border border-hairline bg-surface/50 px-3 py-2.5">
                      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">{label}</p>
                      <p className="mt-1 font-mono text-xl font-semibold tabular-nums" style={{ color }}>
                        {count}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Panel
              title="Risk trend"
              eyebrow="All assessments · p(failure)"
              right={
                stats.trend.length >= 2 ? (
                  <span className="font-mono text-[10px] text-ink-3">
                    {fmtTs(stats.trend[0].ts)} → {fmtTs(stats.trend[stats.trend.length - 1].ts)}
                  </span>
                ) : undefined
              }
              className="lg:col-span-2"
            >
              <div className="flex h-full min-h-36 flex-col justify-end">
                {stats.trend.length >= 2 ? (
                  <>
                    <Sparkline
                      values={stats.trend.map((t) => t.probability)}
                      stroke="var(--color-signal)"
                      className="w-full"
                    />
                    <div className="mt-2 flex justify-between font-mono text-[10px] text-ink-3">
                      <span>{assessments.length} assessments</span>
                      <span>0–100%</span>
                    </div>
                  </>
                ) : (
                  <p className="text-[13px] text-ink-2">Run a second assessment to plot a trend.</p>
                )}
              </div>
            </Panel>
            <Panel title="Needs attention" eyebrow="High & critical risk">
              {attention.length ? (
                <ul className="space-y-2.5">
                  {attention.slice(0, 5).map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-surface/50 px-3 py-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-status-high" strokeWidth={1.8} />
                          <Link to={`/machines?machine=${a.inputs.machineId}`} className="truncate font-mono text-xs text-ink hover:text-signal">
                            {a.inputs.machineId}
                          </Link>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-ink-3">{a.mode.name}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-mono text-sm font-semibold tabular-nums" style={{ color: "var(--color-status-high)" }}>
                          {fmtPercent(a.failureProbability)}
                        </span>
                        <StatusBadge value={a.riskLevel} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex min-h-24 flex-col items-center justify-center gap-2 text-center">
                  <CircleGauge className="h-6 w-6 text-status-healthy" strokeWidth={1.4} />
                  <p className="text-[13px] text-ink-2">No machines currently in the attention band.</p>
                </div>
              )}
            </Panel>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Panel
              title="Recent alerts"
              eyebrow="Open newest first"
              className="lg:col-span-2"
              right={
                <Link to="/alerts" className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3 hover:text-signal">
                  All alerts <ArrowRight className="h-3 w-3" />
                </Link>
              }
            >
              {alerts.length ? (
                <div className="space-y-1.5">
                  {alerts.slice(0, 4).map((a) => (
                    <div key={a.id} className="flex items-center gap-3 rounded-lg border border-hairline bg-surface/40 px-3 py-2.5">
                      <Siren className={`h-4 w-4 shrink-0 ${a.severity === "Critical" ? "text-status-critical" : a.severity === "High" ? "text-status-high" : "text-status-elevated"}`} strokeWidth={1.8} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-ink">{a.machineId}</span>
                          <StatusBadge value={a.modeName.split(" ").slice(0, 2).join(" ")} />
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-ink-3">{a.modeName} · {fmtTs(a.ts)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-mono text-xs font-semibold tabular-nums text-ink">{fmtPercent(a.failureProbability)}</span>
                        <StatusBadge value={a.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-24 flex-col items-center justify-center gap-2 text-center">
                  <Siren className="h-6 w-6 text-ink-3" strokeWidth={1.4} />
                  <p className="text-[13px] text-ink-2">
                    No alerts yet. Assessments above {fmtPercent(APP.alertThreshold)} auto-file an alert.
                  </p>
                </div>
              )}
            </Panel>

            <Panel
              title="Recent predictions"
              eyebrow="Latest assessments"
              right={
                <Link to="/history" className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3 hover:text-signal">
                  History <ArrowRight className="h-3 w-3" />
                </Link>
              }
            >
              {assessments.length ? (
                <ul className="space-y-1.5">
                  {assessments.slice(0, 4).map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-surface/40 px-3 py-2.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-ink">{a.inputs.machineId}</span>
                          <StatusBadge value={a.mode.code === "NONE" ? "Nominal" : a.mode.code} />
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-3">
                          <History className="h-3 w-3" strokeWidth={1.6} /> {fmtTs(a.ts, { seconds: true })}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-mono text-xs font-semibold tabular-nums text-ink">{fmtPercent(a.failureProbability)}</span>
                        <StatusBadge value={a.riskLevel} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Panel>
          </section>
        </>
      )}
    </div>
  );
}