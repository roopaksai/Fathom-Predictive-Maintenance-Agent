import { Activity } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { EmptyState } from "@/components/deck/EmptyState";
import { Panel } from "@/components/deck/Panel";

export function Analyze() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="02 / Analyze"
        title="Machine analysis workspace"
        description="What-if telemetry inputs, the live prediction, failure modes, and recommended maintenance."
      />
      <Panel eyebrow="Scaffold" title="Analysis surface" bodyClassName="p-6">
        <EmptyState
          icon={Activity}
          eyebrow="Phase 5"
          title="Telemetry workspace will render here"
          description="Product-variant and sensor sliders, derived-values readout, failure-probability gauge with decision threshold, failure-mode chips, anomaly panel, and recommendation."
        />
      </Panel>
    </div>
  );
}