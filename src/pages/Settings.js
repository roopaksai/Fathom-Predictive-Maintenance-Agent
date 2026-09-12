import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Eraser, RefreshCw, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/deck/PageHeader";
import { Panel } from "@/components/deck/Panel";
import { Button } from "@/components/deck/Button";
import { StatusDot } from "@/components/deck/StatusDot";
import { StatCard } from "@/components/instrument/StatCard";
import { useAppStore } from "@/lib/store";
import { probeConnection } from "@/lib/api/provider";
import { cn } from "@/lib/utils/cn";
const STATUS_TONE = {
    checking: "neutral",
    live: "healthy",
    simulated: "elevated",
    offline: "critical",
};
const STATUS_LABEL = {
    checking: "Checking",
    live: "Live model",
    simulated: "Simulated engine",
    offline: "Offline",
};
export function SettingsPage() {
    const connection = useAppStore((s) => s.connection);
    const apiBase = useAppStore((s) => s.apiBase);
    const setApiBase = useAppStore((s) => s.setApiBase);
    const useSimulated = useAppStore((s) => s.useSimulated);
    const setUseSimulated = useAppStore((s) => s.setUseSimulated);
    const probe = useAppStore((s) => s.probe);
    const assessments = useAppStore((s) => s.assessments);
    const alerts = useAppStore((s) => s.alerts);
    const notifications = useAppStore((s) => s.notifications);
    const clearAssessments = useAppStore((s) => s.clearAssessments);
    const clearAlerts = useAppStore((s) => s.clearAlerts);
    const clearData = useAppStore((s) => s.clearData);
    const latestModelVersion = assessments[0]?.modelVersion;
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsx(PageHeader, { index: "07 / Settings", title: "Settings & profile", description: "Model connection, data controls, and operator profile for this workbench.", right: _jsxs("div", { className: "flex items-center gap-2.5 rounded-full border border-hairline bg-overlay/70 py-1.5 pl-1.5 pr-4", children: [_jsx("span", { className: "flex h-6 w-6 items-center justify-center rounded-full bg-signal-dim font-mono text-[10px] font-semibold text-signal", children: "OP" }), _jsx("span", { className: "font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-2", children: "Operator \u00B7 Fathom" })] }) }), _jsx(Panel, { title: "Model connection", eyebrow: "Backend", children: _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { children: [_jsx("div", { className: "mb-1.5 flex items-baseline justify-between", children: _jsx("label", { htmlFor: "api-base", className: "text-[11px] font-medium text-ink-2", children: "API base URL" }) }), _jsx("input", { id: "api-base", value: apiBase, onChange: (e) => setApiBase(e.target.value), placeholder: "https://\u2026-hf.space", className: "h-9 w-full rounded-lg border border-hairline bg-overlay/70 px-3 font-mono text-[12px] tabular-nums text-ink outline-none transition-colors focus:border-signal/60" }), _jsx("p", { className: "mt-1.5 font-mono text-[10px] text-ink-3", children: "Expects a Gradio 4+ app exposing /gradio_api." })] }), _jsxs("div", { className: "flex items-center gap-3 border-t border-hairline pt-4", children: [_jsx("button", { role: "switch", "aria-checked": useSimulated, "aria-label": "Force simulated engine", onClick: () => setUseSimulated(!useSimulated), className: cn("relative h-5 w-9 shrink-0 rounded-full border transition-colors", useSimulated ? "border-signal/50 bg-signal-dim" : "border-hairline-strong bg-raised"), children: _jsx("span", { className: cn("absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full transition-transform", useSimulated ? "translate-x-[18px] bg-signal" : "translate-x-[3px] bg-ink-3") }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-[13px] font-medium text-ink", children: "Force simulated engine" }), _jsx("p", { className: "text-[11.5px] text-ink-3", children: useSimulated
                                                ? "Simulation forced — results will be labeled Simulated."
                                                : "Prefer the live model; simulate only when the backend is unreachable." })] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3 border-t border-hairline pt-4", children: [_jsx(Button, { variant: "secondary", size: "sm", icon: _jsx(RefreshCw, { className: "h-3.5 w-3.5" }), label: "Re-check connection", onClick: () => void probe(probeConnection) }), _jsxs("div", { className: "flex min-w-0 items-center gap-2.5 pl-1", children: [_jsx(StatusDot, { tone: STATUS_TONE[connection.status], pulse: connection.status === "checking", size: "sm" }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-2", children: STATUS_LABEL[connection.status] }), connection.message && (_jsx("p", { className: "truncate text-[12px] text-ink-3", children: connection.message }))] })] })] })] }) }), _jsx(Panel, { title: "Data", eyebrow: "Local persistence", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("section", { className: "grid grid-cols-3 gap-3", "aria-label": "Stored data counts", children: [_jsx(StatCard, { label: "Assessments", value: String(assessments.length) }), _jsx(StatCard, { label: "Alerts", value: String(alerts.length) }), _jsx(StatCard, { label: "Notifications", value: String(notifications.length) })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { variant: "danger", size: "sm", icon: _jsx(Eraser, { className: "h-3.5 w-3.5" }), label: "Clear assessments", onClick: () => clearAssessments() }), _jsx(Button, { variant: "danger", size: "sm", icon: _jsx(Eraser, { className: "h-3.5 w-3.5" }), label: "Clear alerts", onClick: () => clearAlerts() }), _jsx(Button, { variant: "danger", size: "sm", icon: _jsx(Trash2, { className: "h-3.5 w-3.5" }), label: "Clear all data", onClick: () => clearData() })] }), _jsx("p", { className: "border-t border-hairline pt-3 text-[11.5px] text-ink-3", children: "Data is persisted to this browser (localStorage). Deleting is permanent." })] }) }), _jsx(Panel, { title: "Honesty & calibration", eyebrow: "Decision-support scope", children: _jsx("ul", { className: "space-y-2", children: [
                        "Model runs live on the shared HF Space when reachable.",
                        "Otherwise a deterministic simulated physics engine is used and every result carries a SIMULATED badge.",
                        "Probabilities are decision-support, not certified.",
                        "Validate against factory calibration before acting.",
                        "No machine telemetry is invented — every machine, alert and trend comes from assessments run in this session/browser.",
                    ].map((text) => (_jsxs("li", { className: "flex gap-2.5 text-[12.5px] leading-relaxed text-ink-2", children: [_jsx("span", { className: "mt-[7px] h-1 w-1 shrink-0 rounded-full bg-signal/70" }), text] }, text))) }) }), _jsx(Panel, { title: "About", eyebrow: "Workbench", children: _jsxs("div", { className: "flex items-end justify-between gap-3", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm font-semibold text-ink", children: ["Fathom ", _jsx("span", { className: "font-normal text-ink-2", children: "\u00B7 Predictive Maintenance Agent" })] }), _jsxs("p", { className: "mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3", children: ["Version ", APP_VERSION] })] }), latestModelVersion && (_jsxs("p", { className: "text-right font-mono text-[10px] text-ink-3", children: ["Latest model", _jsxs("span", { className: "ml-1.5 text-signal", children: ["v", latestModelVersion] })] }))] }) })] }));
}
const APP_VERSION = "0.1.0";
