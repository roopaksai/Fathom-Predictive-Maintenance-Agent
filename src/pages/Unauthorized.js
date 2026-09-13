import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/deck/EmptyState";
import { Button } from "@/components/deck/Button";
export function UnauthorizedPage() {
    return (_jsx(EmptyState, { icon: Lock, eyebrow: "403", title: "Access Denied", description: "You don't have permission to access this resource. Your role doesn't include the required privileges.", actions: _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "outline", asChild: true, children: _jsxs(Link, { to: "/overview", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Dashboard"] }) }), _jsx(Button, { asChild: true, children: _jsx(Link, { to: "/login", children: "Sign in as different user" }) })] }) }));
}
