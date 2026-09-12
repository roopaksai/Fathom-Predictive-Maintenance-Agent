import { History } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { ReservedSurface } from "@/components/deck/ReservedSurface";

export function HistoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        index="05 / History"
        title="Session history"
        description="Every assessment, persisted locally, with trend charts, filters, and export."
      />
      <ReservedSurface
        icon={History}
        index="05"
        phase="8"
        title="Prediction timeline"
        description="Per-session risk trend chart and table from persisted assessments, risk-threshold filter, CSV export, and clear controls."
      />
    </div>
  );
}