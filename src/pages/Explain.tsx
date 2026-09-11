import { Layers } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { EmptyState } from "@/components/deck/EmptyState";
import { Panel } from "@/components/deck/Panel";

export function Explain() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="03 / Explain"
        title="Explainability"
        description="Why the model decided what it decided — SHAP waterfall, contributing features, and condition evidence."
      />
      <Panel eyebrow="Scaffold" title="Explainability surface" bodyClassName="p-6">
        <EmptyState
          icon={Layers}
          eyebrow="Phase 6"
          title="Feature attribution will render here"
          description="A SHAP waterfall from base_value through each contributing feature, the direction-ranked factor table, per-mode condition-evidence, and model metadata: version, method, latency, prediction ID."
        />
      </Panel>
    </div>
  );
}