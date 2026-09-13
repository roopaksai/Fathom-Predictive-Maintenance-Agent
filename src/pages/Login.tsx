import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
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

  const from = (location.state as any)?.from || "/overview";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // Error handled by auth context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-hairline mb-4">
            <span className="text-2xl font-geist-mono text-signal-cyan">FM</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Fathom</h1>
          <p className="text-muted-foreground mt-1">Predictive Maintenance Agent</p>
        </div>

        <Panel className="p-6">
          <PageHeader
            eyebrow="Authentication"
            title="Sign in to continue"
            description="Enter your credentials to access the dashboard"
          />

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-raised border border-hairline px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-signal-cyan focus:border-transparent transition-all"
                placeholder="admin@company.com"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-raised border border-hairline px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-signal-cyan focus:border-transparent transition-all pr-12"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading} loadingText="Signing in…">
              Sign in
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg bg-surface border border-hairline text-sm text-muted-foreground">
            <p className="font-medium mb-2">Demo Credentials</p>
            <div className="space-y-1 font-geist-mono text-xs">
              <div><strong>Admin:</strong> admin@fathom.local / admin123</div>
              <div><strong>Supervisor:</strong> supervisor@fathom.local / supervisor123</div>
              <div><strong>Worker:</strong> worker@fathom.local / worker123</div>
            </div>
          </div>
        </Panel>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Decision support only — not a calibrated model. Factory calibration required.
        </p>
      </div>
    </div>
  );
}