import { Badge } from "@/components/deck/Badge";
import { Panel } from "@/components/deck/Panel";

const TIERS = [
  { label: "Healthy", chip: "healthy" as const, bar: "bg-status-healthy/70" },
  { label: "At attention", chip: "elevated" as const, bar: "bg-status-elevated/70" },
  { label: "Critical", chip: "critical" as const, bar: "bg-status-critical/70" },
];

export function RiskDistribution() {
  return (
    <Panel
      eyebrow="Distribution"
      title="Risk tiers"
      right={
        <div className="flex items-center gap-2">
          <Badge tone="neutral">awaiting</Badge>
        </div>
      }
      bodyClassName="p-5"
    >
      <div className="space-y-4">
        {TIERS.map((tier) => (
          <div key={tier.label} className="flex items-center gap-4">
            <span className="flex w-28 shrink-0 items-center gap-2">
              <Badge tone={tier.chip}>{tier.label}</Badge>
            </span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
              <div className="absolute inset-y-0 left-0 w-0 border-r border-transparent" />
            </div>
            <span className="w-9 shrink-0 text-right font-mono text-[11px] text-ink-3">—</span>
          </div>
        ))}
      </div>
      <p className="mt-5 border-t border-hairline pt-3 font-mono text-[10px] leading-relaxed text-ink-3">
        Tier share fills from urgency + failure probability after the first assessment.
      </p>
    </Panel>
  );
}