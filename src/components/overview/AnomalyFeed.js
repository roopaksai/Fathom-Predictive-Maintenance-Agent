import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge } from "@/components/deck/Badge";
import { Panel } from "@/components/deck/Panel";
import { StatusDot } from "@/components/deck/StatusDot";
import { Skeleton } from "@/components/deck/Skeleton";
export function AnomalyFeed() {
    return (_jsxs(Panel, { eyebrow: "Live signals", title: "Anomaly feed", right: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(StatusDot, { tone: "neutral", pulse: true, size: "sm" }), _jsx(Badge, { tone: "signal", children: "stream \u00B7 idling" })] }), bodyClassName: "p-0", children: [_jsx("ul", { className: "divide-y divide-hairline", children: [0, 1, 2].map((i) => (_jsxs("li", { className: "flex items-center gap-3 px-5 py-3.5", children: [_jsx(StatusDot, { tone: "neutral", size: "sm" }), _jsxs("div", { className: "min-w-0 flex-1 space-y-1.5", children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsx(Skeleton, { className: "h-3 w-28" }), _jsx(Skeleton, { className: "h-3 w-10" })] }), _jsx(Skeleton, { className: "h-3 w-44" })] })] }, i))) }), _jsx("div", { className: "border-t border-hairline px-5 py-3", children: _jsx("p", { className: "font-mono text-[10px] tracking-wide text-ink-3", children: "Anomaly percentiles surface after the first assessment in the Analyze workspace." }) })] }));
}
