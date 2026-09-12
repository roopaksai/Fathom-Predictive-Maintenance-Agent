import { Badge } from "@/components/deck/Badge";
import { Panel } from "@/components/deck/Panel";
import { StatusDot } from "@/components/deck/StatusDot";

const STEPS = [
  { label: "Proxy probe", detail: "gradio_api reachable", state: "active" as const },
  { label: "Model handshake", detail: "assess endpoint", state: "queued" as const },
  { label: "Event stream", detail: "sse_v3 listen", state: "queued" as const },
];

export function ModelStatus() {
  return (
    <Panel
      eyebrow="Pipeline"
      title="Model connection"
      right={<Badge tone="signal">boot</Badge>}
      bodyClassName="p-5"
    >
      <ol className="space-y-0">
        {STEPS.map((step, i) => {
          const active = step.state === "active";
          return (
            <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
              {i < STEPS.length - 1 && (
                <span aria-hidden className="absolute left-[4.5px] top-3 h-full w-px bg-white/10" />
              )}
              <span className="relative mt-1">
                <StatusDot tone={active ? "neutral" : "neutral"} pulse={active} size="sm" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-mono text-xs ${active ? "text-ink" : "text-ink-3"}`}>{step.label}</p>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3">
                    {active ? "in progress" : "queued"}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[10px] text-ink-3">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 space-y-2 border-t border-hairline pt-4">
        <p className="truncate font-mono text-[10px] text-ink-3">
          endpoint&nbsp; hf.space · gradio_api/call/assess
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="elevated">simulated fallback</Badge>
          <Badge tone="neutral">decision support only</Badge>
        </div>
      </div>
    </Panel>
  );
}