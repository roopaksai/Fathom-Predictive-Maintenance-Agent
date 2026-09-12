import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Layers } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { ReservedSurface } from "@/components/deck/ReservedSurface";
export function Explain() {
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { index: "03 / Explain", title: "Explainability", description: "Why the model decided what it decided \u2014 feature attribution, condition evidence, and model metadata." }), _jsx(ReservedSurface, { icon: Layers, index: "03", phase: "6", title: "Feature attribution", description: "A SHAP waterfall from the base value through each contributing feature, a direction-ranked factor table, per-mode condition evidence, and model metadata: version, method, latency, and prediction id." })] }));
}
