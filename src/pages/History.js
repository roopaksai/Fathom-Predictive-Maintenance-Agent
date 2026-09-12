import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { History } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { ReservedSurface } from "@/components/deck/ReservedSurface";
export function HistoryPage() {
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { index: "05 / History", title: "Session history", description: "Every assessment, persisted locally, with trend charts, filters, and export." }), _jsx(ReservedSurface, { icon: History, index: "05", phase: "8", title: "Prediction timeline", description: "Per-session risk trend chart and table from persisted assessments, risk-threshold filter, CSV export, and clear controls." })] }));
}
