import { cn } from "@/lib/utils/cn";

export function PageHeader({
  index,
  title,
  description,
  right,
  className,
}: {
  index?: string;
  title: string;
  description?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {index && <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">{index}</p>}
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-xl text-sm text-ink-2">{description}</p>}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>
  );
}