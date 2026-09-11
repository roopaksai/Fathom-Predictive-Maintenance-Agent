import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell() {
  return (
    <div className="min-h-[100dvh] bg-canvas">
      <Sidebar />
      <Sidebar mobile />
      <div className="lg:pl-56">
        <Topbar />
        <main className="mx-auto w-full max-w-[1320px] px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}