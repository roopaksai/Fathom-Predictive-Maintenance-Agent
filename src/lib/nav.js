import { Activity, History, LayoutGrid, Layers, Wrench } from "lucide-react";
export const NAV_ITEMS = [
    { to: "/overview", index: "01", label: "Overview", icon: LayoutGrid },
    { to: "/analyze", index: "02", label: "Analyze", icon: Activity },
    { to: "/explain", index: "03", label: "Explain", icon: Layers },
    { to: "/maintenance", index: "04", label: "Maintenance", icon: Wrench },
    { to: "/history", index: "05", label: "History", icon: History },
];
