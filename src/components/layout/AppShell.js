import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
export function AppShell() {
    return (_jsxs("div", { className: "min-h-[100dvh] bg-canvas", children: [_jsx(Sidebar, {}), _jsx(Sidebar, { mobile: true }), _jsxs("div", { className: "lg:pl-56", children: [_jsx(Topbar, {}), _jsx("main", { className: "mx-auto w-full max-w-[1320px] px-4 py-8 sm:px-6 lg:px-10", children: _jsx(Outlet, {}) })] })] }));
}
