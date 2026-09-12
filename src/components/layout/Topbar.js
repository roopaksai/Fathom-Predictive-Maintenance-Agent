import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils/cn";
import { StatusDot } from "@/components/deck/StatusDot";
import { NAV_ITEMS } from "@/lib/nav";
function useUtcClock() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    return now;
}
const CONNECTION_META = {
    live: { label: "Live", tone: "live", pulse: true },
    checking: { label: "Connecting", tone: "neutral", pulse: true },
    simulated: { label: "Simulated", tone: "elevated", pulse: false },
    offline: { label: "Offline", tone: "critical", pulse: false },
};
export function Topbar() {
    const { pathname } = useLocation();
    const connection = useAppStore((s) => s.connection);
    const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
    const now = useUtcClock();
    const current = useMemo(() => NAV_ITEMS.find((n) => pathname.startsWith(n.to)) ?? NAV_ITEMS[0], [pathname]);
    const meta = CONNECTION_META[connection.status];
    const clock = now.toISOString().slice(11, 19);
    return (_jsx("header", { className: "sticky top-0 z-20 border-b border-hairline bg-canvas/80 backdrop-blur-md", children: _jsxs("div", { className: "mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10", children: [_jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [_jsx("button", { onClick: () => setSidebarOpen(true), "aria-label": "Open navigation", className: "rounded-lg p-2 text-ink-3 transition-colors hover:bg-white/5 hover:text-ink lg:hidden", children: _jsx(Menu, { className: "h-4.5 w-4.5" }) }), _jsxs("div", { className: "min-w-0", children: [_jsxs("p", { className: "flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-3", children: [_jsx("span", { className: "hidden sm:inline", children: "Workbench" }), _jsx("span", { className: "hidden text-hairline-strong sm:inline", children: "/" }), _jsx("span", { className: "text-ink-2", children: current.label })] }), _jsx("p", { className: "mt-0.5 hidden truncate text-xs text-ink-2 sm:block", children: current.to.replace("/", "").toUpperCase() })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: cn("hidden font-mono text-xs tabular-nums text-ink-3 md:inline"), children: [clock, " UTC"] }), _jsxs("div", { role: "status", className: "flex h-8 items-center gap-2 rounded-full border border-hairline bg-overlay/70 px-3", children: [_jsx(StatusDot, { tone: meta.tone, pulse: meta.pulse, size: "sm" }), _jsx("span", { className: "font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-2", children: meta.label })] })] })] }) }));
}
