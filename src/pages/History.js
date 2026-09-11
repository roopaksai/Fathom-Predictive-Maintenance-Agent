import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { History } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { EmptyState } from "@/components/deck/EmptyState";
import { Panel } from "@/components/deck/Panel";
export function HistoryPage() {
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { index: "05 / History", title: "Session history", description: "Every assessment, persisted locally, with trend charts, filters, and export." }), _jsx(Panel, { eyebrow: "Scaffold", title: "History surface", bodyClassName: "p-6", children: _jsx(EmptyState, { icon: History, eyebrow: "Phase 8", title: "Prediction timeline will render here", description: "Per-session risk trend chart and table from persisted assessments, risk-threshold filter, CSV export, and clear controls." }) })] }));
}
