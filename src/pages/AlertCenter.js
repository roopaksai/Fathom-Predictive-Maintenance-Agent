import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { Check, Siren, Wrench } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { Panel } from "@/components/deck/Panel";
import { Badge } from "@/components/deck/Badge";
import { Button } from "@/components/deck/Button";
import { StatCard } from "@/components/instrument/StatCard";
import { StatusBadge } from "@/components/instrument/StatusBadge";
import { useAppStore } from "@/lib/store";
import { APP } from "@/lib/config";
import { fmtPercent, fmtTs } from "@/lib/derived";
import { cn } from "@/lib/utils/cn";
const SEVERITY_FILTERS = ["All", "Critical", "High", "Warning"];
const STATUS_FILTERS = ["All", "Open", "Acknowledged", "Resolved"];
const SEVERITY_DOT = {
    Critical: "text-status-critical",
    High: "text-status-high",
    Warning: "text-status-elevated",
};
function SegmentedFilter({ options, value, onChange, }) {
    return (_jsx("div", { className: "grid grid-cols-4 gap-1.5", children: options.map((opt) => (_jsx("button", { onClick: () => onChange(opt), className: cn("h-9 min-w-0 truncate rounded-lg border px-1 font-mono text-[10px] font-semibold uppercase tracking-wide transition-colors", value === opt
                ? "border-signal/50 bg-signal-dim text-signal"
                : "border-hairline bg-overlay/60 text-ink-3 hover:text-ink"), children: opt }, opt))) }));
}
export function AlertCenter() {
    const alerts = useAppStore((s) => s.alerts);
    const acknowledgeAlert = useAppStore((s) => s.acknowledgeAlert);
    const resolveAlert = useAppStore((s) => s.resolveAlert);
    const [severityFilter, setSeverityFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [query, setQuery] = useState("");
    const openCount = useMemo(() => alerts.filter((a) => a.status === "Open").length, [alerts]);
    const acknowledgedCount = useMemo(() => alerts.filter((a) => a.status === "Acknowledged").length, [alerts]);
    const resolvedCount = useMemo(() => alerts.filter((a) => a.status === "Resolved").length, [alerts]);
    const filteredAlerts = useMemo(() => {
        const q = query.trim().toLowerCase();
        return alerts.filter((a) => {
            if (severityFilter !== "All" && a.severity !== severityFilter)
                return false;
            if (statusFilter !== "All" && a.status !== statusFilter)
                return false;
            if (q && !(a.machineId.toLowerCase().includes(q) || a.modeName.toLowerCase().includes(q))) {
                return false;
            }
            return true;
        });
    }, [alerts, severityFilter, statusFilter, query]);
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { index: "04 / Alert Center", title: "Alert center", description: "Every filed alert \u2014 open, acknowledged, and resolved \u2014 with the evidence and recommended action from the originating assessment.", right: _jsxs(Badge, { tone: openCount > 0 ? "critical" : "healthy", children: [openCount, " open"] }) }), _jsxs("section", { "aria-label": "Alert summary", className: "grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4", children: [_jsx(StatCard, { label: "Open", value: String(openCount), unit: "awaiting action", tone: openCount > 0 ? "critical" : "neutral" }), _jsx(StatCard, { label: "Acknowledged", value: String(acknowledgedCount), unit: "in review", tone: "elevated" }), _jsx(StatCard, { label: "Resolved", value: String(resolvedCount), unit: "closed", tone: "healthy" })] }), _jsx(Panel, { bodyClassName: "p-4 space-y-3", children: _jsxs("div", { className: "grid grid-cols-1 gap-3 lg:grid-cols-3 lg:items-end", children: [_jsxs("div", { children: [_jsx("p", { className: "mb-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3", children: "Severity" }), _jsx(SegmentedFilter, { options: SEVERITY_FILTERS, value: severityFilter, onChange: setSeverityFilter })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3", children: "Status" }), _jsx(SegmentedFilter, { options: STATUS_FILTERS, value: statusFilter, onChange: setStatusFilter })] }), _jsxs("label", { className: "block", children: [_jsxs("div", { className: "mb-1.5 flex items-baseline justify-between", children: [_jsx("span", { className: "font-mono text-[9px] uppercase tracking-[0.16em] text-ink-3", children: "Search" }), _jsx("span", { className: "font-mono text-[10px] text-ink-3", children: "machine \u00B7 mode" })] }), _jsx("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "MM-0001 \u00B7 bearing degradation", className: "h-9 w-full rounded-lg border border-hairline bg-overlay/70 px-3 font-mono text-sm tabular-nums text-ink outline-none transition-colors focus:border-signal/60" })] })] }) }), _jsx(Panel, { title: "Filed alerts", eyebrow: `${filteredAlerts.length} of ${alerts.length}`, children: alerts.length === 0 ? (_jsxs("div", { className: "flex min-h-40 flex-col items-center justify-center gap-2.5 text-center", children: [_jsx(Siren, { className: "h-6 w-6 text-ink-3", strokeWidth: 1.4 }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-ink", children: "No alerts filed yet" }), _jsxs("p", { className: "mt-1 text-[12.5px] text-ink-2", children: ["Assessments above ", fmtPercent(APP.alertThreshold), " auto-file an alert here."] })] })] })) : filteredAlerts.length === 0 ? (_jsx("div", { className: "flex min-h-28 items-center justify-center text-center", children: _jsx("p", { className: "text-[13px] text-ink-2", children: "No alerts match the current filters." }) })) : (_jsx("div", { className: "space-y-2", children: filteredAlerts.map((a) => (_jsx("div", { className: "rounded-lg border border-hairline bg-surface/40 px-3.5 py-3", children: _jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0 flex-1 space-y-1.5", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-x-2.5 gap-y-1", children: [_jsx("span", { "aria-hidden": true, className: cn("h-2 w-2 shrink-0 rounded-full bg-current", SEVERITY_DOT[a.severity]) }), _jsx("span", { className: "font-mono text-xs text-ink", children: a.machineId }), _jsx("span", { className: "font-mono text-[10px] tabular-nums text-ink-3", children: fmtTs(a.ts, { full: true, seconds: true }) }), _jsx("span", { className: "font-mono text-sm font-semibold tabular-nums text-ink", children: fmtPercent(a.failureProbability) }), _jsx(StatusBadge, { value: a.riskLevel }), _jsxs("span", { className: "font-mono text-[10px] uppercase tracking-wider text-ink-3", children: [a.modeCode, " \u00B7 ", a.modeName] })] }), a.evidence.length > 0 && (_jsx("p", { className: "line-clamp-2 max-w-2xl text-[12px] leading-relaxed text-ink-2", children: a.evidence.slice(0, 2).join(" · ") })), _jsxs("p", { className: "flex items-start gap-1.5 text-[11.5px] leading-relaxed text-ink-3", children: [_jsx(Wrench, { className: "mt-0.5 h-3.5 w-3.5 shrink-0", strokeWidth: 1.6 }), _jsx("span", { className: "min-w-0", children: a.recommendation })] })] }), _jsxs("div", { className: "flex shrink-0 items-center gap-2", children: [a.status === "Open" && (_jsx(Button, { variant: "danger", size: "sm", icon: _jsx(Check, { className: "h-3.5 w-3.5" }), label: "Acknowledge", onClick: () => acknowledgeAlert(a.id) })), (a.status === "Open" || a.status === "Acknowledged") && (_jsx(Button, { variant: "secondary", size: "sm", icon: _jsx(Check, { className: "h-3.5 w-3.5" }), label: "Resolve", onClick: () => resolveAlert(a.id) })), a.status === "Resolved" && _jsx(Badge, { tone: "healthy", children: "Resolved" })] })] }) }, a.id))) })) })] }));
}
