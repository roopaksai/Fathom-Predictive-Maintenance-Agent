import { Wrench } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { ReservedSurface } from "@/components/deck/ReservedSurface";

export function Maintenance() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="04 / Maintenance"
        title="Action center"
        description="Work orders, task checklists, and export tied to real assessments — no fabricated data."
      />
      <ReservedSurface
        icon={Wrench}
        index="04"
        phase="7"
        title="Work-order workflow"
        description="Create work orders from the current assessment with real machine, risk, urgency, and recommended action; dispatch modal, CSV export, and print stylesheet."
      />
    </div>
  );
}