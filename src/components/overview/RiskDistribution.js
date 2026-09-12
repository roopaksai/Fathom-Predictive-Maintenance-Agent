import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge } from "@/components/deck/Badge";
import { Panel } from "@/components/deck/Panel";
const TIERS = [
    { label: "Healthy", chip: "healthy", bar: "bg-status-healthy/70" },
    { label: "At attention", chip: "elevated", bar: "bg-status-elevated/70" },
    { label: "Critical", chip: "critical", bar: "bg-status-critical/70" },
];
export function RiskDistribution() {
    return (_jsxs(Panel, { eyebrow: "Distribution", title: "Risk tiers", right: _jsx("div", { className: "flex items-center gap-2", children: _jsx(Badge, { tone: "neutral", children: "awaiting" }) }), bodyClassName: "p-5", children: [_jsx("div", { className: "space-y-4", children: TIERS.map((tier) => (_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "flex w-28 shrink-0 items-center gap-2", children: _jsx(Badge, { tone: tier.chip, children: tier.label }) }), _jsx("div", { className: "relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/5", children: _jsx("div", { className: "absolute inset-y-0 left-0 w-0 border-r border-transparent" }) }), _jsx("span", { className: "w-9 shrink-0 text-right font-mono text-[11px] text-ink-3", children: "\u2014" })] }, tier.label))) }), _jsx("p", { className: "mt-5 border-t border-hairline pt-3 font-mono text-[10px] leading-relaxed text-ink-3", children: "Tier share fills from urgency + failure probability after the first assessment." })] }));
}
