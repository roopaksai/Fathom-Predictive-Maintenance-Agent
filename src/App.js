import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from "react-router-dom";
import { Compass } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/deck/EmptyState";
import { LoginPage } from "@/pages/Login";
import { UnauthorizedPage } from "@/pages/Unauthorized";
import { Overview } from "@/pages/Overview";
import { Analyze } from "@/pages/Analyze";
import { MachineHealth } from "@/pages/MachineHealth";
import { AlertCenter } from "@/pages/AlertCenter";
import { HistoryPage } from "@/pages/History";
import { Insights } from "@/pages/Insights";
import { SettingsPage } from "@/pages/Settings";
import { useRequireAuth } from "@/context/AuthContext";
function NotFound() {
    return (_jsx(EmptyState, { icon: Compass, eyebrow: "404", title: "Route not found", description: "The path you followed is off the chart. Choose a destination from the navigation." }));
}
function ProtectedRoute({ allowedRoles, children }) {
    const { user, loading } = useRequireAuth(allowedRoles);
    if (loading) {
        return (_jsx("div", { className: "flex h-[60vh] items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-2 border-signal-cyan border-t-transparent" }) }));
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: window.location.pathname } });
    }
    return _jsx(_Fragment, { children: children });
}
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/unauthorized", element: _jsx(UnauthorizedPage, {}) }), _jsxs(Route, { element: _jsx(AppShell, {}), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/overview", replace: true }) }), _jsx(Route, { path: "/overview", element: _jsx(ProtectedRoute, { children: _jsx(Overview, {}) }) }), _jsx(Route, { path: "/analyze", element: _jsx(ProtectedRoute, { children: _jsx(Analyze, {}) }) }), _jsx(Route, { path: "/machines", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor"], children: _jsx(MachineHealth, {}) }) }), _jsx(Route, { path: "/alerts", element: _jsx(ProtectedRoute, { children: _jsx(AlertCenter, {}) }) }), _jsx(Route, { path: "/history", element: _jsx(ProtectedRoute, { children: _jsx(HistoryPage, {}) }) }), _jsx(Route, { path: "/insights", element: _jsx(ProtectedRoute, { allowedRoles: ["admin", "supervisor"], children: _jsx(Insights, {}) }) }), _jsx(Route, { path: "/settings", element: _jsx(ProtectedRoute, { allowedRoles: ["admin"], children: _jsx(SettingsPage, {}) }) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] })] }));
}
