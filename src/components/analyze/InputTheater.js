import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
function SensorRow({ label, unit, floor, ceil }) {
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-baseline justify-between gap-3", children: [_jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.14em] text-ink-2", children: label }), _jsxs("p", { className: "font-mono text-xs text-ink-3", children: ["\u2014 ", _jsx("span", { className: "text-[9px]", children: unit })] })] }), _jsxs("div", { className: "relative mt-2 h-6 rounded-md border border-hairline bg-overlay/50", children: [_jsx("span", { "aria-hidden": true, className: "absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-white/8" }), _jsx("span", { "aria-hidden": true, className: "absolute left-1/2 top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15" })] }), _jsxs("div", { className: "mt-1 flex justify-between font-mono text-[9px] text-ink-3", children: [_jsx("span", { children: floor }), _jsx("span", { children: ceil })] })] }));
}
export function InputTheater() {
    return (_jsx(Panel, { eyebrow: "What-if \u00B7 telemetry", title: "Machine inputs", right: _jsx(Badge, { tone: "neutral", children: "idle" }), bodyClassName: "p-5", children: _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.14em] text-ink-2", children: "Product variant" }), _jsx("div", { className: "mt-2 flex gap-2", children: [0, 1, 2].map((i) => (_jsx(Skeleton, { className: "h-7 w-16 rounded-full" }, i))) })] }), _jsx("div", { className: "grid grid-cols-2 gap-3", children: [
                        { label: "Machine id", placeholder: "MM-0001" },
                        { label: "State", placeholder: "IDLE" },
                    ].map((f) => (_jsxs("div", { children: [_jsx("p", { className: "font-mono text-[11px] uppercase tracking-[0.14em] text-ink-2", children: f.label }), _jsx("input", { readOnly: true, disabled: true, placeholder: f.placeholder, className: "mt-2 h-9 w-full rounded-md border border-hairline bg-overlay/50 px-3 font-mono text-xs text-ink-3 placeholder:text-ink-3/70" })] }, f.label))) }), _jsx("div", { className: "space-y-4 border-t border-hairline pt-4", children: SENSORS.map((s) => (_jsx(SensorRow, { ...s }, s.label))) }), _jsxs("div", { className: "flex items-center justify-between gap-3 border-t border-hairline pt-4", children: [_jsx(Button, { disabled: true, children: "Run assessment" }), _jsx("p", { className: "font-mono text-[10px] text-ink-3", children: "model idle \u00B7 controls unlock when connected" })] })] }) }));
}
