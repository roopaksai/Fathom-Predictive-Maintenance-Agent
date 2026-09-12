import { Activity, BellRing, BrainCircuit, Cpu, History, LayoutGrid, Settings } from "lucide-react";
export const NAV_ITEMS = [
    { to: "/overview", index: "01", label: "Dashboard", icon: LayoutGrid },
    { to: "/analyze", index: "02", label: "Analyze Machine", icon: Activity },
    { to: "/machines", index: "03", label: "Machine Health", icon: Cpu },
    { to: "/alerts", index: "04", label: "Alert Center", icon: BellRing },
    { to: "/history", index: "05", label: "Prediction History", icon: History },
    { to: "/insights", index: "06", label: "AI Insights", icon: BrainCircuit },
    { to: "/settings", index: "07", label: "Settings", icon: Settings },
];
export function navTitleFor(pathname) {
    return NAV_ITEMS.find((n) => pathname.startsWith(n.to)) ?? NAV_ITEMS[0];
}
