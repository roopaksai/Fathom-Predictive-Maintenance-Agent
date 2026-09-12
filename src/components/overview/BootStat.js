import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils/cn";
import { StatusDot } from "@/components/deck/StatusDot";
import { Skeleton } from "@/components/deck/Skeleton";
export function BootStat({ label, unit, emphasized = false, }) {
    return (_jsxs("div", { className: cn("relative overflow-hidden rounded-lg border p-4 transition-colors", emphasized ? "border-signal/25 bg-surface" : "border-hairline bg-surface"), children: [emphasized && (_jsx("div", { "aria-hidden": true, className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/60 to-transparent" })), _jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "font-mono text-[9px] uppercase tracking-[0.2em] text-ink-3", children: label }), emphasized ? _jsx(StatusDot, { tone: "neutral", pulse: true, size: "sm" }) : _jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-white/8" })] }), _jsx("div", { className: "mt-3 flex h-7 items-center", children: _jsx(Skeleton, { className: cn("h-5", emphasized ? "w-20" : "w-14") }) }), unit && _jsx("p", { className: "mt-1 font-mono text-[10px] text-ink-3", children: unit }), _jsx("p", { className: "mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3/80 opacity-70", children: "awaiting model" })] }));
}
