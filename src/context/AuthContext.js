import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
const AuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";
async function fetchWithAuth(input, init = {}) {
    const res = await fetch(input, {
        ...init,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...init.headers,
        },
    });
    return res;
}
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const refresh = async () => {
        try {
            const res = await fetchWithAuth(`${API_BASE}/api/v1/auth/me`);
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setError(null);
            }
            else {
                setUser(null);
            }
        }
        catch {
            setUser(null);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        refresh();
    }, []);
    const login = async (email, password) => {
        setError(null);
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_BASE}/api/v1/auth/login`, {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: "Login failed" }));
                throw new Error(err.detail || "Invalid credentials");
            }
            await refresh();
            navigate("/overview", { replace: true });
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "Login failed");
            setLoading(false);
            throw e;
        }
    };
    const logout = async () => {
        try {
            await fetchWithAuth(`${API_BASE}/api/v1/auth/logout`, { method: "POST" });
        }
        finally {
            setUser(null);
            navigate("/login", { replace: true });
        }
    };
    const hasRole = (roles) => {
        if (!user)
            return false;
        return roles.includes(user.role);
    };
    return (_jsx(AuthContext.Provider, { value: { user, loading, error, login, logout, refresh, hasRole }, children: children }));
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
export function useRequireAuth(allowedRoles) {
    const { user, loading, hasRole } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate("/login", { replace: true, state: { from: location.pathname } });
            }
            else if (allowedRoles && !hasRole(allowedRoles)) {
                navigate("/unauthorized", { replace: true });
            }
        }
    }, [user, loading, allowedRoles, navigate, location.pathname, hasRole]);
    return { user, loading };
}
