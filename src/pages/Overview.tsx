import { GaugeCircle } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { EmptyState } from "@/components/deck/EmptyState";
import { Panel } from "@/components/deck/Panel";

export function Overview() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="01 / Overview"
        title="Fleet overview"
        description="Aggregate fleet health, risk distribution, and the live anomaly feed — built from real assessment data."
      />
      <Panel
        eyebrow="Scaffold"
        title="Overview surface"
        bodyClassName="p-6"
      >
        <EmptyState
          icon={GaugeCircle}
          eyebrow="Phase 4"
          title="Fleet summary will render here"
          description="Fleet status cards from health_status and urgency, a risk-tier distribution bar, the anomaly-percentile feed, and recent assessments — all wired to the live model."
        />
      </Panel>
    </div>
  );
}