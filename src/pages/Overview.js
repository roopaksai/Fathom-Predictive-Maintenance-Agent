import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { GaugeCircle } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { EmptyState } from "@/components/deck/EmptyState";
import { Panel } from "@/components/deck/Panel";
export function Overview() {
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { index: "01 / Overview", title: "Fleet overview", description: "Aggregate fleet health, risk distribution, and the live anomaly feed \u2014 built from real assessment data." }), _jsx(Panel, { eyebrow: "Scaffold", title: "Overview surface", bodyClassName: "p-6", children: _jsx(EmptyState, { icon: GaugeCircle, eyebrow: "Phase 4", title: "Fleet summary will render here", description: "Fleet status cards from health_status and urgency, a risk-tier distribution bar, the anomaly-percentile feed, and recent assessments \u2014 all wired to the live model." }) })] }));
}
