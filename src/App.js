import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Compass } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/deck/EmptyState";
import { Overview } from "@/pages/Overview";
import { Analyze } from "@/pages/Analyze";
import { MachineHealth } from "@/pages/MachineHealth";
import { AlertCenter } from "@/pages/AlertCenter";
import { HistoryPage } from "@/pages/History";
import { Insights } from "@/pages/Insights";
import { SettingsPage } from "@/pages/Settings";
function NotFound() {
    return (_jsx(EmptyState, { icon: Compass, eyebrow: "404", title: "Route not found", description: "The path you followed is off the chart. Choose a destination from the navigation." }));
}
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(Routes, { children: _jsxs(Route, { element: _jsx(AppShell, {}), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/overview", replace: true }) }), _jsx(Route, { path: "/overview", element: _jsx(Overview, {}) }), _jsx(Route, { path: "/analyze", element: _jsx(Analyze, {}) }), _jsx(Route, { path: "/machines", element: _jsx(MachineHealth, {}) }), _jsx(Route, { path: "/alerts", element: _jsx(AlertCenter, {}) }), _jsx(Route, { path: "/history", element: _jsx(HistoryPage, {}) }), _jsx(Route, { path: "/insights", element: _jsx(Insights, {}) }), _jsx(Route, { path: "/settings", element: _jsx(SettingsPage, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) }) }));
}
