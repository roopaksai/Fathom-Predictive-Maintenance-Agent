import { Badge } from "@/components/deck/Badge";
import { Panel } from "@/components/deck/Panel";
import { Skeleton } from "@/components/deck/Skeleton";

function GaugeRing() {
  return (
    <svg viewBox="0 0 160 160" className="h-40 w-40" aria-hidden>
      <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
      <circle
        cx="80"
        cy="80"
        r="62"
        fill="none"
        stroke="rgba(34,211,238,0.28)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="2 12"
        strokeDashoffset="0"
        transform="rotate(-90 80 80)"
      />
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={80 + Math.cos(a) * 54}
            y1={80 + Math.sin(a) * 54}
            x2={80 + Math.cos(a) * 49}
            y2={80 + Math.sin(a) * 49}
            stroke="rgba(255,255,255,0.14)"
            strokeWidth="1"
          />
        );
      })}
    </svg>
  );
}

export function ResultStage() {
  return (
    <Panel
      eyebrow="Result · live stage"
      title="Prediction"
      right={<Badge tone="signal">calibration</Badge>}
      bodyClassName="p-5"
    >
      <div className="flex flex-col items-center pb-2">
        <div className="relative">
          <GaugeRing />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-medium text-ink-3">—</span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-3">
              failure probability
            </span>
          </div>
        </div>
        <p className="mt-2 font-mono text-[10px] text-ink-3">
          decision threshold <span className="text-ink-2">0.50</span>
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          <Badge tone="elevated">simulated fallback</Badge>
          <Badge tone="neutral">decision support only</Badge>
        </div>
      </div>

      <div className="mt-2 space-y-4 border-t border-hairline pt-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">Failure modes</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3">Recommended action</p>
          <div className="mt-2 space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
        </div>
      </div>
    </Panel>
  );
}