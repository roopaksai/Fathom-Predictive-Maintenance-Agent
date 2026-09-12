import { Badge } from "@/components/deck/Badge";
import { Panel } from "@/components/deck/Panel";
import { StatusDot } from "@/components/deck/StatusDot";
import { Skeleton } from "@/components/deck/Skeleton";

export function AnomalyFeed() {
  return (
    <Panel
      eyebrow="Live signals"
      title="Anomaly feed"
      right={
        <div className="flex items-center gap-2">
          <StatusDot tone="neutral" pulse size="sm" />
          <Badge tone="signal">stream · idling</Badge>
        </div>
      }
      bodyClassName="p-0"
    >
      <ul className="divide-y divide-hairline">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-3 px-5 py-3.5">
            <StatusDot tone="neutral" size="sm" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-10" />
              </div>
              <Skeleton className="h-3 w-44" />
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-hairline px-5 py-3">
        <p className="font-mono text-[10px] tracking-wide text-ink-3">
          Anomaly percentiles surface after the first assessment in the Analyze workspace.
        </p>
      </div>
    </Panel>
  );
}