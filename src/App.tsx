import { Navigate, Route, Routes } from "react-router-dom";
import { Compass, Lock } from "lucide-react";
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
  return (
    <EmptyState
      icon={Compass}
      eyebrow="404"
      title="Route not found"
      description="The path you followed is off the chart. Choose a destination from the navigation."
    />
  );
}

function ProtectedRoute({ allowedRoles, children }: { allowedRoles?: ("admin" | "supervisor" | "worker")[]; children: React.ReactNode }) {
  const { user, loading } = useRequireAuth(allowedRoles);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-signal-cyan border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
        <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
        <Route path="/machines" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><MachineHealth /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><AlertCenter /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><Insights /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={["admin"]}><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}