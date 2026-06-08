import { NavLink } from "react-router";
import { useAuth } from "../context/AuthContext";

const NAV = [
  {
    to: "/",
    end: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    label: "Dashboard",
  },
  {
    to: "/skills",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    label: "Explorar",
  },
  {
    to: "/sessions",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    label: "Sesiones",
  },
  {
    to: "/profile",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    label: "Perfil",
  },
];

interface SidebarMenuProps {
  open: boolean;
  onClose: () => void;
}

export function SidebarMenu({ open, onClose }: SidebarMenuProps) {
  const { user, logout } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          flex flex-col w-64 flex-shrink-0 transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-3 px-5 py-6" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
          <div className="flex items-center justify-center w-9 h-9 rounded-lg" style={{ background: "var(--primary)" }}>
            <span style={{ color: "#ffffff", fontWeight: 800, fontSize: "0.85rem" }}>SU</span>
          </div>
          <div>
            <p style={{ color: "var(--sidebar-primary)", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1rem", lineHeight: 1.1 }}>
              SkillSwap U
            </p>
            <p style={{ color: "rgba(232,240,251,0.5)", fontSize: "0.7rem" }}>Plataforma académica</p>
          </div>
        </div>

        <div className="mx-4 mt-5 mb-2 rounded-xl p-4" style={{ background: "rgba(26,158,110,0.18)", border: "1px solid rgba(26,158,110,0.35)" }}>
          <p style={{ color: "rgba(232,240,251,0.6)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Mis créditos</p>
          <div className="flex items-end gap-1.5 mt-1">
            <span style={{ color: "#4ade80", fontSize: "2rem", fontWeight: 800, fontFamily: "'Nunito', sans-serif", lineHeight: 1 }}>18.5</span>
            <span style={{ color: "rgba(232,240,251,0.55)", fontSize: "0.8rem", marginBottom: "3px" }}>hrs</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
            <div className="h-full rounded-full" style={{ width: "62%", background: "linear-gradient(90deg, #1a9e6e, #4ade80)" }} />
          </div>
          <p style={{ color: "rgba(232,240,251,0.45)", fontSize: "0.68rem", marginTop: "4px" }}>de 30 hrs este ciclo</p>
        </div>

        <nav className="flex-1 px-3 py-2 flex flex-col gap-1">
          {NAV.map(({ to, end, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${isActive ? "active-nav" : ""}`
              }
              style={({ isActive }) => ({
                background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                color: isActive ? "#ffffff" : "rgba(232,240,251,0.65)",
              })}
              onMouseEnter={(e) => { if (!e.currentTarget.classList.contains("active-nav")) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { if (!e.currentTarget.classList.contains("active-nav")) e.currentTarget.style.background = "transparent"; }}
            >
              {icon}
              <span style={{ fontWeight: 600 }}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#2e6bb5,#1a9e6e)", color: "#fff", fontWeight: 800, fontSize: "0.8rem" }}>
              {user?.avatar ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: "var(--sidebar-primary)", fontSize: "0.82rem", fontWeight: 700 }} className="truncate">
                {user?.name ?? "Usuario"}
              </p>
              <p style={{ color: "rgba(232,240,251,0.45)", fontSize: "0.7rem" }} className="truncate">
                {user?.email ?? ""}
              </p>
            </div>
            <button
              onClick={logout}
              style={{ color: "rgba(232,240,251,0.4)" }}
              title="Cerrar sesión"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
