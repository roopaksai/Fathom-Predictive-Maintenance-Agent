import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/12 bg-surface/40 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-hairline bg-raised text-ink-3">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        {eyebrow && (
          <span className="absolute -top-1.5 -right-2 rounded bg-signal px-1 py-px font-mono text-[9px] font-semibold uppercase tracking-wider text-[#04282e]">
            {eyebrow}
          </span>
        )}
      </div>
      <div className="max-w-sm">
        <h3 className="text-sm font-medium text-ink">{title}</h3>
        {description && <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{description}</p>}
      </div>
      {action && <div className="mt-1 flex items-center gap-2">{action}</div>}
    </div>
  );
}