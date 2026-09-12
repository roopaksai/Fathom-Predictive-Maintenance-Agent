import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PageHeader } from "@/components/deck/PageHeader";
import { StatusDot } from "@/components/deck/StatusDot";
import { BootStat } from "@/components/overview/BootStat";
import { RiskDistribution } from "@/components/overview/RiskDistribution";
import { AnomalyFeed } from "@/components/overview/AnomalyFeed";
import { ModelStatus } from "@/components/overview/ModelStatus";
import { RecentAssessments } from "@/components/overview/RecentAssessments";
export function Overview() {
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { index: "01 / Overview", title: "Fleet overview", description: "Aggregate machine health, live anomaly signals, and at-risk units \u2014 streamed from the model.", right: _jsxs("div", { className: "flex h-9 items-center gap-2.5 rounded-full border border-hairline bg-overlay/70 px-4", children: [_jsx(StatusDot, { tone: "neutral", pulse: true, size: "sm" }), _jsx("span", { className: "font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-2", children: "Awaiting live model" })] }) }), _jsxs("section", { "aria-label": "Fleet metrics", className: "grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4", children: [_jsx(BootStat, { label: "Machines tracked", unit: "registered fleet", emphasized: true }), _jsx(BootStat, { label: "Fleet health", unit: "mean health status" }), _jsx(BootStat, { label: "Units at risk", unit: "above decision threshold" }), _jsx(BootStat, { label: "Anomalies \u00B7 24h", unit: "percentile outliers" })] }), _jsxs("section", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [_jsx("div", { className: "lg:col-span-2", children: _jsx(RiskDistribution, {}) }), _jsx(ModelStatus, {})] }), _jsxs("section", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [_jsx("div", { className: "lg:col-span-2", children: _jsx(AnomalyFeed, {}) }), _jsx(RecentAssessments, {})] })] }));
}
