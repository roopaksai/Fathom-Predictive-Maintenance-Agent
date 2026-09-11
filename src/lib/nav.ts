import { Activity, History, LayoutGrid, Layers, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  index: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/overview", index: "01", label: "Overview", icon: LayoutGrid },
  { to: "/analyze", index: "02", label: "Analyze", icon: Activity },
  { to: "/explain", index: "03", label: "Explain", icon: Layers },
  { to: "/maintenance", index: "04", label: "Maintenance", icon: Wrench },
  { to: "/history", index: "05", label: "History", icon: History },
];