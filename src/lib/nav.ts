import { Activity, BellRing, BrainCircuit, Cpu, History, LayoutGrid, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type UserRole = "admin" | "supervisor" | "worker";

export interface NavItem {
  to: string;
  index: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/overview", index: "01", label: "Dashboard", icon: LayoutGrid, roles: ["admin", "supervisor", "worker"] },
  { to: "/analyze", index: "02", label: "Analyze Machine", icon: Activity, roles: ["admin", "supervisor", "worker"] },
  { to: "/machines", index: "03", label: "Machine Health", icon: Cpu, roles: ["admin", "supervisor"] },
  { to: "/alerts", index: "04", label: "Alert Center", icon: BellRing, roles: ["admin", "supervisor", "worker"] },
  { to: "/history", index: "05", label: "Prediction History", icon: History, roles: ["admin", "supervisor", "worker"] },
  { to: "/insights", index: "06", label: "AI Insights", icon: BrainCircuit, roles: ["admin", "supervisor"] },
  { to: "/settings", index: "07", label: "Settings", icon: Settings, roles: ["admin"] },
];

export function navTitleFor(pathname: string): NavItem {
  return NAV_ITEMS.find((n) => pathname.startsWith(n.to)) ?? NAV_ITEMS[0];
}

export function filterNavItemsByRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}