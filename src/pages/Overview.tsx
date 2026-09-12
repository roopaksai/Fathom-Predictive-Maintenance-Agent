import { PageHeader } from "@/components/deck/PageHeader";
import { StatusDot } from "@/components/deck/StatusDot";
import { BootStat } from "@/components/overview/BootStat";
import { RiskDistribution } from "@/components/overview/RiskDistribution";
import { AnomalyFeed } from "@/components/overview/AnomalyFeed";
import { ModelStatus } from "@/components/overview/ModelStatus";
import { RecentAssessments } from "@/components/overview/RecentAssessments";

export function Overview() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="01 / Overview"
        title="Fleet overview"
        description="Aggregate machine health, live anomaly signals, and at-risk units — streamed from the model."
        right={
          <div className="flex h-9 items-center gap-2.5 rounded-full border border-hairline bg-overlay/70 px-4">
            <StatusDot tone="neutral" pulse size="sm" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-2">
              Awaiting live model
            </span>
          </div>
        }
      />

      <section aria-label="Fleet metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <BootStat label="Machines tracked" unit="registered fleet" emphasized />
        <BootStat label="Fleet health" unit="mean health status" />
        <BootStat label="Units at risk" unit="above decision threshold" />
        <BootStat label="Anomalies · 24h" unit="percentile outliers" />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RiskDistribution />
        </div>
        <ModelStatus />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnomalyFeed />
        </div>
        <RecentAssessments />
      </section>
    </div>
  );
}