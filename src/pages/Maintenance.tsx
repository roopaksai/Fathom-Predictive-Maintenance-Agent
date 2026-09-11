import { Wrench } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { EmptyState } from "@/components/deck/EmptyState";
import { Panel } from "@/components/deck/Panel";

export function Maintenance() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="04 / Maintenance"
        title="Action center"
        description="Work orders, task checklists, and export tied to real assessments — no fabricated data."
      />
      <Panel eyebrow="Scaffold" title="Action surface" bodyClassName="p-6">
        <EmptyState
          icon={Wrench}
          eyebrow="Phase 7"
          title="Work-order workflow will render here"
          description="Create work orders from the current assessment with real machine, risk, urgency, and recommended action; dispatch modal, CSV export, and print stylesheet."
        />
      </Panel>
    </div>
  );
}