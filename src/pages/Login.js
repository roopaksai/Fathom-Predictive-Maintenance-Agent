import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/deck/Button";
import { Panel } from "@/components/deck/Panel";
import { PageHeader } from "@/components/deck/PageHeader";
export function LoginPage() {
    const { login, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const from = location.state?.from || "/overview";
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            navigate(from, { replace: true });
        }
        catch {
            // Error handled by auth context
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "flex min-h-[100dvh] items-center justify-center bg-canvas px-4", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-hairline mb-4", children: _jsx("span", { className: "text-2xl font-geist-mono text-signal-cyan", children: "FM" }) }), _jsx("h1", { className: "text-3xl font-semibold tracking-tight", children: "Fathom" }), _jsx("p", { className: "text-muted-foreground mt-1", children: "Predictive Maintenance Agent" })] }), _jsxs(Panel, { className: "p-6", children: [_jsx(PageHeader, { index: "Authentication", title: "Sign in to continue", description: "Enter your credentials to access the dashboard" }), _jsxs("form", { onSubmit: handleSubmit, className: "mt-6 space-y-4", children: [error && (_jsxs("div", { className: "flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm", children: [_jsx(AlertCircle, { className: "h-4 w-4 flex-shrink-0" }), _jsx("span", { children: error })] })), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium mb-1.5", children: "Email" }), _jsx("input", { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full rounded-lg bg-raised border border-hairline px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-signal-cyan focus:border-transparent transition-all", placeholder: "admin@company.com", required: true, autoComplete: "email", disabled: loading })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium mb-1.5", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx("input", { id: "password", type: showPassword ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full rounded-lg bg-raised border border-hairline px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-signal-cyan focus:border-transparent transition-all pr-12", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, autoComplete: "current-password", disabled: loading }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors", "aria-label": showPassword ? "Hide password" : "Show password", children: showPassword ? _jsx(EyeOff, { className: "h-5 w-5" }) : _jsx(Eye, { className: "h-5 w-5" }) })] })] }), _jsx(Button, { type: "submit", className: "w-full", size: "md", loading: loading, loadingText: "Signing in\u2026", children: "Sign in" })] }), _jsxs("div", { className: "mt-6 p-4 rounded-lg bg-surface border border-hairline text-sm text-muted-foreground", children: [_jsx("p", { className: "font-medium mb-2", children: "Demo Credentials" }), _jsxs("div", { className: "space-y-1 font-geist-mono text-xs", children: [_jsxs("div", { children: [_jsx("strong", { children: "Admin:" }), " admin@fathom.local / admin123"] }), _jsxs("div", { children: [_jsx("strong", { children: "Supervisor:" }), " supervisor@fathom.local / supervisor123"] }), _jsxs("div", { children: [_jsx("strong", { children: "Worker:" }), " worker@fathom.local / worker123"] })] })] })] }), _jsx("p", { className: "text-center text-sm text-muted-foreground mt-6", children: "Decision support only \u2014 not a calibrated model. Factory calibration required." })] }) }));
}
