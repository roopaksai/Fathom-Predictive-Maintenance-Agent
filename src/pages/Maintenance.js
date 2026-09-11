import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Wrench } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { EmptyState } from "@/components/deck/EmptyState";
import { Panel } from "@/components/deck/Panel";
export function Maintenance() {
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { index: "04 / Maintenance", title: "Action center", description: "Work orders, task checklists, and export tied to real assessments \u2014 no fabricated data." }), _jsx(Panel, { eyebrow: "Scaffold", title: "Action surface", bodyClassName: "p-6", children: _jsx(EmptyState, { icon: Wrench, eyebrow: "Phase 7", title: "Work-order workflow will render here", description: "Create work orders from the current assessment with real machine, risk, urgency, and recommended action; dispatch modal, CSV export, and print stylesheet." }) })] }));
}
