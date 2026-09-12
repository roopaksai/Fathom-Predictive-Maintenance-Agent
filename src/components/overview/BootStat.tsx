import { cn } from "@/lib/utils/cn";
import { StatusDot } from "@/components/deck/StatusDot";
import { Skeleton } from "@/components/deck/Skeleton";

export function BootStat({
  label,
  unit,
  emphasized = false,
}: {
  label: string;
  unit?: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border p-4 transition-colors",
        emphasized ? "border-signal/25 bg-surface" : "border-hairline bg-surface",
      )}
    >
      {emphasized && (
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/60 to-transparent" />
      )}
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-3">{label}</p>
        {emphasized ? <StatusDot tone="neutral" pulse size="sm" /> : <span className="h-1.5 w-1.5 rounded-full bg-white/8" />}
      </div>
      <div className="mt-3 flex h-7 items-center">
        <Skeleton className={cn("h-5", emphasized ? "w-20" : "w-14")} />
      </div>
      {unit && <p className="mt-1 font-mono text-[10px] text-ink-3">{unit}</p>}
      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3/80 opacity-70">
        awaiting model
      </p>
    </div>
  );
}