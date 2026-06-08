import { useNavigate } from "react-router";

const ACTIONS = [
  {
    label: "Explorar habilidades",
    path: "/skills",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    color: "#2e6bb5",
  },
  {
    label: "Mis sesiones",
    path: "/sessions",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    color: "#1a9e6e",
  },
  {
    label: "Editar perfil",
    path: "/profile",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    color: "#7c3aed",
  },
  {
    label: "Agregar disponibilidad",
    path: "/profile?tab=disponibilidad",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    color: "#d97706",
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <h3 className="font-nunito font-bold mb-4" style={{ color: "var(--foreground)", fontSize: "0.95rem" }}>
        Acciones rápidas
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
            style={{ background: "var(--muted)", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--input-background)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--muted)")}
          >
            <span style={{ color: action.color }}>{action.icon}</span>
            <span className="font-nunito-sans text-sm font-semibold text-left" style={{ color: "var(--foreground)" }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
