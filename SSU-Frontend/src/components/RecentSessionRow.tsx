import type { RecentSession } from "../api/dashboard.api";

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  COMPLETED: { label: "Completada", bg: "#d1faed", color: "#1a9e6e" },
  PENDING: { label: "Programada", bg: "#fef3c7", color: "#d97706" },
  ACCEPTED: { label: "Programada", bg: "#fef3c7", color: "#d97706" },
  CANCELLED: { label: "Cancelada", bg: "#fee2e2", color: "#e11d48" },
  DISPUTED: { label: "Disputada", bg: "#fee2e2", color: "#e11d48" },
};

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

function formatTime(d: string): string {
  return new Date(d).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });
}

interface RecentSessionRowProps {
  session: RecentSession;
}

export function RecentSessionRow({ session }: RecentSessionRowProps) {
  const ss = STATUS_STYLE[session.status] ?? { label: session.status, bg: "var(--muted)", color: "var(--muted-foreground)" };
  const roleLabel = session.role === "TEACHER" ? "Tutor" : "Aprendiz";

  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5 transition-colors"
      style={{ borderBottom: "1px solid var(--border)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#2e6bb5,#1a9e6e)", color: "#fff", fontWeight: 800, fontSize: "0.72rem" }}
      >
        {session.partnerAvatar}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-nunito font-semibold truncate" style={{ color: "var(--foreground)", fontSize: "0.85rem" }}>
            {session.skillName}
          </p>
          <span className="text-xs px-1.5 py-0.5 rounded font-nunito-sans font-bold flex-shrink-0"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontSize: "0.6rem" }}>
            {roleLabel}
          </span>
        </div>
        <p className="font-nunito-sans truncate" style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>
          con {session.partnerFirstName} {session.partnerLastName} · {formatDate(session.scheduledDate)} {formatTime(session.scheduledDate)}
        </p>
      </div>

      <div className="flex flex-col items-end flex-shrink-0">
        <span className="font-nunito font-bold text-sm" style={{ color: session.creditsExchanged >= 0 ? "#1a9e6e" : "#e11d48" }}>
          {session.creditsExchanged >= 0 ? "+" : ""}{session.creditsExchanged.toFixed(1)}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full font-nunito-sans font-semibold"
          style={{ background: ss.bg, color: ss.color }}>
          {ss.label}
        </span>
      </div>
    </div>
  );
}
