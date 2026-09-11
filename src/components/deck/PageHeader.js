import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils/cn";
export function PageHeader({ index, title, description, right, className, }) {
    return (_jsxs("div", { className: cn("flex flex-wrap items-end justify-between gap-4", className), children: [_jsxs("div", { className: "min-w-0", children: [index && _jsx("p", { className: "font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3", children: index }), _jsx("h1", { className: "mt-1 text-xl font-semibold tracking-tight text-ink", children: title }), description && _jsx("p", { className: "mt-1 max-w-xl text-sm text-ink-2", children: description })] }), right && _jsx("div", { className: "flex shrink-0 items-center gap-2", children: right })] }));
}
