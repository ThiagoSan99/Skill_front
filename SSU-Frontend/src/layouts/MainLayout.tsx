import { useState } from "react";
import { Outlet } from "react-router";
import { SidebarMenu } from "../components/SidebarMenu";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <SidebarMenu open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: "var(--sidebar)", borderBottom: "1px solid var(--sidebar-border)" }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: "var(--sidebar-foreground)" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <p style={{ color: "#ffffff", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1rem" }}>SkillSwap U</p>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#2e6bb5,#1a9e6e)", color: "#fff", fontWeight: 800, fontSize: "0.8rem" }}>
            {user?.avatar ?? "?"}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
