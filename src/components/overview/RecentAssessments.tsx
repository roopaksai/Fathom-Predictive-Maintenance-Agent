import { Badge } from "@/components/deck/Badge";
import { Panel } from "@/components/deck/Panel";
import { Skeleton } from "@/components/deck/Skeleton";

export function RecentAssessments() {
  return (
    <Panel
      eyebrow="Registry"
      title="Recent assessments"
      right={<Badge tone="neutral">empty</Badge>}
      bodyClassName="p-0"
    >
      <div className="grid grid-cols-[64px_1fr_1fr] gap-3 border-b border-hairline px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">
        <span>Time</span>
        <span>Machine</span>
        <span className="text-right">Risk</span>
      </div>
      <ul className="divide-y divide-hairline">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="grid grid-cols-[64px_1fr_1fr] items-center gap-3 px-5 py-3">
            <Skeleton className="h-3 w-9" />
            <Skeleton className="h-3 w-20" />
            <div className="flex justify-end">
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-hairline px-5 py-3">
        <p className="font-mono text-[10px] tracking-wide text-ink-3">
          Newest assessments appear here once the Analyze workspace goes live.
        </p>
      </div>
    </Panel>
  );
}