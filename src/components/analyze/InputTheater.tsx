import { Badge } from "@/components/deck/Badge";
import { Button } from "@/components/deck/Button";
import { Panel } from "@/components/deck/Panel";
import { Skeleton } from "@/components/deck/Skeleton";

const SENSORS = [
  { label: "Air temperature", unit: "K", floor: "270", ceil: "290" },
  { label: "Process temperature", unit: "K", floor: "305", ceil: "330" },
  { label: "Rotational speed", unit: "rpm", floor: "1100", ceil: "2900" },
  { label: "Torque", unit: "Nm", floor: "6", ceil: "60" },
];

function SensorRow({ label, unit, floor, ceil }: { label: string; unit: string; floor: string; ceil: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-2">{label}</p>
        <p className="font-mono text-xs text-ink-3">
          — <span className="text-[9px]">{unit}</span>
        </p>
      </div>
      <div className="relative mt-2 h-6 rounded-md border border-hairline bg-overlay/50">
        <span aria-hidden className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-white/8" />
        <span aria-hidden className="absolute left-1/2 top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15" />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-ink-3">
        <span>{floor}</span>
        <span>{ceil}</span>
      </div>
    </div>
  );
}

export function InputTheater() {
  return (
    <Panel
      eyebrow="What-if · telemetry"
      title="Machine inputs"
      right={<Badge tone="neutral">idle</Badge>}
      bodyClassName="p-5"
    >
      <div className="space-y-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-2">Product variant</p>
          <div className="mt-2 flex gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-7 w-16 rounded-full" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Machine id", placeholder: "MM-0001" },
            { label: "State", placeholder: "IDLE" },
          ].map((f) => (
            <div key={f.label}>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-2">{f.label}</p>
              <input
                readOnly
                disabled
                placeholder={f.placeholder}
                className="mt-2 h-9 w-full rounded-md border border-hairline bg-overlay/50 px-3 font-mono text-xs text-ink-3 placeholder:text-ink-3/70"
              />
            </div>
          ))}
        </div>

        <div className="space-y-4 border-t border-hairline pt-4">
          {SENSORS.map((s) => (
            <SensorRow key={s.label} {...s} />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-hairline pt-4">
          <Button disabled>Run assessment</Button>
          <p className="font-mono text-[10px] text-ink-3">model idle · controls unlock when connected</p>
        </div>
      </div>
    </Panel>
  );
}