import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge } from "@/components/deck/Badge";
import { Panel } from "@/components/deck/Panel";
import { StatusDot } from "@/components/deck/StatusDot";
const STEPS = [
    { label: "Proxy probe", detail: "gradio_api reachable", state: "active" },
    { label: "Model handshake", detail: "assess endpoint", state: "queued" },
    { label: "Event stream", detail: "sse_v3 listen", state: "queued" },
];
export function ModelStatus() {
    return (_jsxs(Panel, { eyebrow: "Pipeline", title: "Model connection", right: _jsx(Badge, { tone: "signal", children: "boot" }), bodyClassName: "p-5", children: [_jsx("ol", { className: "space-y-0", children: STEPS.map((step, i) => {
                    const active = step.state === "active";
                    return (_jsxs("li", { className: "relative flex gap-3 pb-5 last:pb-0", children: [i < STEPS.length - 1 && (_jsx("span", { "aria-hidden": true, className: "absolute left-[4.5px] top-3 h-full w-px bg-white/10" })), _jsx("span", { className: "relative mt-1", children: _jsx(StatusDot, { tone: active ? "neutral" : "neutral", pulse: active, size: "sm" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: `font-mono text-xs ${active ? "text-ink" : "text-ink-3"}`, children: step.label }), _jsx("span", { className: "font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3", children: active ? "in progress" : "queued" })] }), _jsx("p", { className: "mt-0.5 font-mono text-[10px] text-ink-3", children: step.detail })] })] }, step.label));
                }) }), _jsxs("div", { className: "mt-5 space-y-2 border-t border-hairline pt-4", children: [_jsx("p", { className: "truncate font-mono text-[10px] text-ink-3", children: "endpoint\u00A0 hf.space \u00B7 gradio_api/call/assess" }), _jsxs("div", { className: "flex flex-wrap items-center gap-1.5", children: [_jsx(Badge, { tone: "elevated", children: "simulated fallback" }), _jsx(Badge, { tone: "neutral", children: "decision support only" })] })] })] }));
}
