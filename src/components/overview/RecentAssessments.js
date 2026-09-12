import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge } from "@/components/deck/Badge";
import { Panel } from "@/components/deck/Panel";
import { Skeleton } from "@/components/deck/Skeleton";
export function RecentAssessments() {
    return (_jsxs(Panel, { eyebrow: "Registry", title: "Recent assessments", right: _jsx(Badge, { tone: "neutral", children: "empty" }), bodyClassName: "p-0", children: [_jsxs("div", { className: "grid grid-cols-[64px_1fr_1fr] gap-3 border-b border-hairline px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3", children: [_jsx("span", { children: "Time" }), _jsx("span", { children: "Machine" }), _jsx("span", { className: "text-right", children: "Risk" })] }), _jsx("ul", { className: "divide-y divide-hairline", children: [0, 1, 2, 3].map((i) => (_jsxs("li", { className: "grid grid-cols-[64px_1fr_1fr] items-center gap-3 px-5 py-3", children: [_jsx(Skeleton, { className: "h-3 w-9" }), _jsx(Skeleton, { className: "h-3 w-20" }), _jsx("div", { className: "flex justify-end", children: _jsx(Skeleton, { className: "h-4 w-14 rounded-full" }) })] }, i))) }), _jsx("div", { className: "border-t border-hairline px-5 py-3", children: _jsx("p", { className: "font-mono text-[10px] tracking-wide text-ink-3", children: "Newest assessments appear here once the Analyze workspace goes live." }) })] }));
}
