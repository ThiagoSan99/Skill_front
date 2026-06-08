import type { MatchUser } from "../api/dashboard.api";

const COMPAT_COLORS = [
  { threshold: 95, bg: "rgba(26,158,110,0.15)", color: "#1a9e6e" },
  { threshold: 85, bg: "rgba(45,107,181,0.15)", color: "#2e6bb5" },
  { threshold: 0, bg: "rgba(212,24,61,0.12)", color: "#d4183d" },
];

function getCompatStyle(pct: number) {
  return COMPAT_COLORS.find((c) => pct >= c.threshold) ?? COMPAT_COLORS[COMPAT_COLORS.length - 1];
}

interface MatchCardProps {
  match: MatchUser;
  onRequestSession: (match: MatchUser) => void;
}

export function MatchCard({ match, onRequestSession }: MatchCardProps) {
  const compatStyle = getCompatStyle(match.compatibility);
  const shortName = `${match.firstName} ${match.lastName.charAt(0)}.`;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#2e6bb5,#1a9e6e)", color: "#fff", fontWeight: 800, fontSize: "0.85rem" }}
          >
            {match.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-nunito font-bold truncate" style={{ color: "var(--foreground)", fontSize: "0.95rem" }}>
              {shortName}
            </h3>
            <p className="font-nunito-sans truncate text-sm" style={{ color: "var(--muted-foreground)" }}>
              {match.skillName}
            </p>
          </div>
          <div
            className="px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0"
            style={{ background: compatStyle.bg, color: compatStyle.color }}
          >
            {match.compatibility}% compat.
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              {match.skillLevel}
            </span>
            <span className="font-nunito-sans text-xs" style={{ color: "var(--accent)" }}>
              {match.creditsPerSession} créditos/sesión
            </span>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", padding: "0.75rem 1.25rem" }}>
        <button
          onClick={() => onRequestSession(match)}
          className="w-full py-2 rounded-xl font-nunito-sans font-semibold text-sm transition-all"
          style={{ background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Solicitar sesión
        </button>
      </div>
    </div>
  );
}
