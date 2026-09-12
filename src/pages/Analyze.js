import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PageHeader } from "@/components/deck/PageHeader";
import { InputTheater } from "@/components/analyze/InputTheater";
import { ResultStage } from "@/components/analyze/ResultStage";
export function Analyze() {
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { index: "02 / Analyze", title: "Machine analysis workspace", description: "Shape the telemetry scenario, run the assessment, and read the verdict back from the model." }), _jsxs("div", { className: "grid grid-cols-1 items-start gap-4 lg:grid-cols-12", children: [_jsx("div", { className: "lg:col-span-7", children: _jsx(InputTheater, {}) }), _jsx("div", { className: "lg:col-span-5", children: _jsx(ResultStage, {}) })] })] }));
}
