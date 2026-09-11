import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Compass } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/deck/EmptyState";
import { Overview } from "@/pages/Overview";
import { Analyze } from "@/pages/Analyze";
import { Explain } from "@/pages/Explain";
import { Maintenance } from "@/pages/Maintenance";
import { HistoryPage } from "@/pages/History";
function NotFound() {
    return (_jsx(EmptyState, { icon: Compass, eyebrow: "404", title: "Route not found", description: "The path you followed is off the chart. Choose a destination from the navigation." }));
}
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(Routes, { children: _jsxs(Route, { element: _jsx(AppShell, {}), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/overview", replace: true }) }), _jsx(Route, { path: "/overview", element: _jsx(Overview, {}) }), _jsx(Route, { path: "/analyze", element: _jsx(Analyze, {}) }), _jsx(Route, { path: "/explain", element: _jsx(Explain, {}) }), _jsx(Route, { path: "/maintenance", element: _jsx(Maintenance, {}) }), _jsx(Route, { path: "/history", element: _jsx(HistoryPage, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) }) }));
}
