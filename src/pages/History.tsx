import { History } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { EmptyState } from "@/components/deck/EmptyState";
import { Panel } from "@/components/deck/Panel";

export function HistoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="05 / History"
        title="Session history"
        description="Every assessment, persisted locally, with trend charts, filters, and export."
      />
      <Panel eyebrow="Scaffold" title="History surface" bodyClassName="p-6">
        <EmptyState
          icon={History}
          eyebrow="Phase 8"
          title="Prediction timeline will render here"
          description="Per-session risk trend chart and table from persisted assessments, risk-threshold filter, CSV export, and clear controls."
        />
      </Panel>
    </div>
  );
}