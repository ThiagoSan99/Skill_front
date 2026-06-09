import { useEffect, useState, useMemo, useCallback } from "react";
import type { UserSession } from "../api/sessions.api";
import { sessionsApi } from "../api/sessions.api";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  COMPLETED: { label: "Completada", bg: "#d1faed", color: "#1a9e6e" },
  PENDING: { label: "Programada", bg: "#fef3c7", color: "#d97706" },
  ACCEPTED: { label: "Programada", bg: "#fef3c7", color: "#d97706" },
  CANCELLED: { label: "Cancelada", bg: "#fee2e2", color: "#e11d48" },
  DISPUTED: { label: "Disputada", bg: "#fee2e2", color: "#e11d48" },
};

const TABS = ["Todas", "Completadas", "Programadas"];
const ROLE_TABS = ["Todos", "Como Tutor", "Como Aprendiz"];

function buildJitsiUrl(sessionId: string, skillName: string): string {
  const slug = `skillswap-${sessionId}-${skillName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}`;
  return `https://meet.jit.si/${slug}`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateLong(d: string): string {
  return new Date(d).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
}

function formatTime(d: string): string {
  return new Date(d).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function JoinModal({
  session,
  onClose,
}: {
  session: UserSession;
  onClose: () => void;
}) {
  const jitsiUrl = buildJitsiUrl(session.sessionId, session.skillName);
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(jitsiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [jitsiUrl]);

  const joinNow = useCallback(() => {
    window.open(jitsiUrl, "_blank", "noopener,noreferrer");
    onClose();
  }, [jitsiUrl, onClose]);

  const roleLabel = session.role === "TEACHER" ? "Tutor" : "Aprendiz";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,31,54,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "var(--card)", boxShadow: "0 24px 48px rgba(0,0,0,0.18)" }}
      >
        <div className="px-6 py-5 flex items-start justify-between" style={{ background: "linear-gradient(135deg,#0f2540,#1d4374)" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Sesión programada
            </p>
            <h2 style={{ color: "#ffffff", fontFamily: "'Nunito',sans-serif", fontWeight: 800, marginTop: "2px" }}>
              {session.skillName}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", marginTop: "2px" }}>
              con {session.partnerFirstName} {session.partnerLastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 transition-colors mt-0.5"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">
          <div className="flex flex-wrap gap-3">
            {[
              { icon: "📅", text: formatDateLong(session.scheduledDate) },
              { icon: "🕐", text: `${formatTime(session.scheduledDate)} · ${session.durationHours?.toFixed(1) ?? "1.0"}h` },
              { icon: "👤", text: roleLabel },
            ].map(({ icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                style={{ background: "var(--muted)", color: "var(--foreground)", fontWeight: 600 }}
              >
                {icon} {text}
              </span>
            ))}
          </div>

          <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#1D76BA"/>
                <path d="M10 10h5v12l-5-3V10z" fill="white"/>
                <path d="M17 10h5v9a3 3 0 0 1-5 0V10z" fill="white"/>
              </svg>
              <p style={{ color: "var(--foreground)", fontWeight: 700 }}>Sala Jitsi Meet</p>
            </div>
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.8rem", lineHeight: 1.5 }}>
              La sala es privada y exclusiva para esta sesión. No requiere cuenta — solo haz clic en "Unirse".
            </p>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <p className="flex-1 truncate" style={{ color: "#1d4374", fontSize: "0.78rem", fontWeight: 600 }}>
                {jitsiUrl}
              </p>
              <button
                onClick={copyLink}
                className="flex-shrink-0 px-2 py-1 rounded text-xs transition-all"
                style={{ background: copied ? "#d1faed" : "var(--secondary)", color: copied ? "#1a9e6e" : "#1d4374", fontWeight: 700 }}
              >
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {[
              "Asegúrate de tener micrófono y cámara disponibles",
              "Comparte el enlace con tu compañero si aún no lo tiene",
              "La sesión quedará registrada al completarla",
            ].map((tip) => (
              <div key={tip} className="flex items-start gap-2">
                <span style={{ color: "#1a9e6e", fontSize: "0.85rem", marginTop: "1px" }}>✓</span>
                <p style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl transition-all"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontWeight: 700 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--secondary)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--muted)")}
          >
            Cancelar
          </button>
          <button
            onClick={joinNow}
            className="flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            style={{ background: "#1d4374", color: "#ffffff", fontWeight: 700 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2e6bb5")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1d4374")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            Unirse a la sesión
          </button>
        </div>
      </div>
    </div>
  );
}

function RatingModal({
  session,
  userId,
  onClose,
  onRated,
}: {
  session: UserSession;
  userId: string;
  onClose: () => void;
  onRated: (rating: number) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await sessionsApi.createReview({
        sessionId: session.sessionId,
        reviewerUserId: userId,
        reviewedUserId: session.partnerUserId,
        rating,
        comment,
      });
      onRated(rating);
      onClose();
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo enviar la calificación. Intenta de nuevo.",
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(13,31,54,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "var(--card)", boxShadow: "0 24px 48px rgba(0,0,0,0.18)" }}
      >
        <div className="px-6 py-5" style={{ background: "linear-gradient(135deg,#0f2540,#1d4374)" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Calificar sesión
          </p>
          <h2 style={{ color: "#ffffff", fontFamily: "'Nunito',sans-serif", fontWeight: 800, marginTop: "2px" }}>
            {session.skillName}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.82rem", marginTop: "2px" }}>
            con {session.partnerFirstName} {session.partnerLastName}
          </p>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">
          <div className="flex flex-col items-center gap-2">
            <p className="font-nunito-sans font-bold" style={{ color: "var(--foreground)", fontSize: "0.9rem" }}>
              ¿Qué tal fue la sesión?
            </p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="text-3xl transition-colors"
                  style={{
                    color: star <= (hover || rating) ? "#f59e0b" : "var(--border)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0 2px",
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Comentario opcional..."
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
            maxLength={500}
            className="w-full rounded-xl p-3 font-nunito-sans text-sm resize-none"
            style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)", outline: "none" }}
            rows={3}
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl transition-all font-nunito-sans font-bold"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--secondary)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--muted)")}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="flex-1 py-3 rounded-xl transition-all font-nunito-sans font-bold disabled:opacity-50"
              style={{ background: "#1a9e6e", color: "#fff" }}
              onMouseEnter={(e) => !submitting && (e.currentTarget.style.background = "#22c984")}
              onMouseLeave={(e) => !submitting && (e.currentTarget.style.background = "#1a9e6e")}
            >
              {submitting ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Todas");
  const [roleFilter, setRoleFilter] = useState("Todos");
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
  const [rateSession, setRateSession] = useState<UserSession | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleRated = useCallback((sessionId: string, newRating: number) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.sessionId === sessionId ? { ...s, rating: newRating } : s
      )
    );
  }, []);

  const handleStatusUpdate = useCallback(async (session: UserSession, newStatus: string) => {
    const isComplete = newStatus === "COMPLETED";
    const result = await Swal.fire({
      icon: isComplete ? "question" : "warning",
      title: isComplete ? "Completar sesión" : "Cancelar sesión",
      text: isComplete
        ? "¿Estás seguro de que deseas marcar esta sesión como completada?"
        : "¿Estás seguro? Se reembolsarán los créditos al aprendiz.",
      showCancelButton: true,
      confirmButtonColor: isComplete ? "#1a9e6e" : "#e11d48",
      confirmButtonText: isComplete ? "Sí, completar" : "Sí, cancelar",
      cancelButtonText: "Volver",
      cancelButtonColor: "var(--muted-foreground)",
    });
    if (!result.isConfirmed) return;
    setActionLoading(session.sessionId);
    try {
      await sessionsApi.updateStatus(session.sessionId, newStatus);
      setSessions((prev) =>
        prev.map((s) =>
          s.sessionId === session.sessionId ? { ...s, status: newStatus } : s
        )
      );
      setSelectedSession((prev) =>
        prev?.sessionId === session.sessionId ? null : prev
      );
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la sesión. Intenta de nuevo.",
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setActionLoading(null);
    }
  }, []);

  useEffect(() => {
    sessionsApi.getMySessions()
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      const statusLabel = STATUS_MAP[s.status]?.label;
      if (activeTab === "Completadas" && statusLabel !== "Completada") return false;
      if (activeTab === "Programadas" && statusLabel !== "Programada") return false;
      if (roleFilter === "Tutor" && s.role !== "TEACHER") return false;
      if (roleFilter === "Aprendiz" && s.role !== "LEARNER") return false;
      return true;
    });
  }, [sessions, activeTab, roleFilter]);

  const totalGanados = useMemo(() =>
    sessions.filter((s) => s.creditsExchanged > 0).reduce((acc, s) => acc + s.creditsExchanged, 0),
  [sessions]);

  const totalGastados = useMemo(() =>
    sessions.filter((s) => s.creditsExchanged < 0).reduce((acc, s) => acc + Math.abs(s.creditsExchanged), 0),
  [sessions]);

  const programadasCount = useMemo(() =>
    sessions.filter((s) => STATUS_MAP[s.status]?.label === "Programada").length,
  [sessions]);

  return (
    <div className="px-6 py-8 lg:px-10 max-w-5xl mx-auto">
      {selectedSession && (
        <JoinModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
      {rateSession && user?.userId && (
        <RatingModal
          session={rateSession}
          userId={user.userId}
          onClose={() => setRateSession(null)}
          onRated={(r) => handleRated(rateSession.sessionId, r)}
        />
      )}

      <div className="mb-7">
        <h1 className="font-nunito font-extrabold text-2xl" style={{ color: "var(--foreground)" }}>
          Mis sesiones
        </h1>
        <p className="font-nunito-sans text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {loading ? "..." : `${sessions.length} sesiones registradas`}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total sesiones", value: sessions.length, color: "#1d4374" },
          { label: "Completadas", value: sessions.filter((s) => s.status === "COMPLETED").length, color: "#1a9e6e" },
          { label: "Créditos ganados", value: `+${totalGanados.toFixed(1)} hrs`, color: "#1a9e6e" },
          { label: "Créditos usados", value: `${totalGastados.toFixed(1)} hrs`, color: "#e11d48" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p className="font-nunito-sans text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</p>
            <p className="font-nunito font-extrabold" style={{ color, fontSize: "1.4rem", lineHeight: 1, marginTop: "4px" }}>
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--muted)" }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-1.5 rounded-lg text-sm transition-all font-nunito-sans"
              style={{
                background: activeTab === tab ? "var(--card)" : "transparent",
                color: activeTab === tab ? "var(--foreground)" : "var(--muted-foreground)",
                fontWeight: activeTab === tab ? 700 : 500,
                boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {tab}
              {tab === "Programadas" && programadasCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs" style={{ background: "#fef3c7", color: "#d97706", fontWeight: 800 }}>
                  {programadasCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--muted)" }}>
          {ROLE_TABS.map((tab) => {
            const roleValue = tab === "Todos" ? "Todos" : tab === "Como Tutor" ? "Tutor" : "Aprendiz";
            return (
              <button
                key={tab}
                onClick={() => setRoleFilter(roleValue)}
                className="px-4 py-1.5 rounded-lg text-sm transition-all font-nunito-sans"
                style={{
                  background: roleFilter === roleValue ? "var(--card)" : "transparent",
                  color: roleFilter === roleValue ? "var(--foreground)" : "var(--muted-foreground)",
                  fontWeight: roleFilter === roleValue ? 700 : 500,
                  boxShadow: roleFilter === roleValue ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center font-nunito-sans" style={{ color: "var(--muted-foreground)" }}>
          Cargando sesiones...
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {filtered.length === 0 ? (
            <div className="py-16 text-center font-nunito-sans" style={{ color: "var(--muted-foreground)" }}>
              No hay sesiones en este filtro
            </div>
          ) : (
            <>
              {filtered.map((s, i) => {
                const statusStyle = STATUS_MAP[s.status] ?? { label: s.status, bg: "var(--muted)", color: "var(--muted-foreground)" };
                const roleLabel = s.role === "TEACHER" ? "Tutor" : "Aprendiz";
                const isProgramada = statusStyle.label === "Programada";

                const actions = isProgramada ? (
                  <div className="flex items-center gap-1.5">
                    {s.role === "TEACHER" && (
                      <button
                        onClick={() => handleStatusUpdate(s, "COMPLETED")}
                        disabled={actionLoading === s.sessionId}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm transition-all font-nunito-sans font-bold disabled:opacity-50"
                        style={{ background: "#1a9e6e", color: "#fff" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#22c984")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#1a9e6e")}
                      >
                        Completar
                      </button>
                    )}
                    <button
                      onClick={() => handleStatusUpdate(s, "CANCELLED")}
                      disabled={actionLoading === s.sessionId}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm transition-all font-nunito-sans font-bold disabled:opacity-50"
                      style={{ background: "transparent", color: "#e11d48", border: "1px solid #e11d48" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setSelectedSession(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all font-nunito-sans font-bold"
                      style={{ background: "#1d4374", color: "#fff" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#2e6bb5")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#1d4374")}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                      Unirse
                    </button>
                  </div>
                ) : s.status === "COMPLETED" && s.role === "LEARNER" ? (
                  <div className="flex items-center gap-1.5">
                    {s.rating !== null ? (
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} style={{ color: star <= s.rating! ? "#f59e0b" : "var(--border)", fontSize: "14px" }}>★</span>
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => setRateSession(s)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm transition-all font-nunito-sans font-bold"
                        style={{ background: "transparent", color: "#f59e0b", border: "1px solid #f59e0b" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fef3c7")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        ★ Calificar
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-xs px-2.5 py-1 rounded-full font-nunito-sans font-bold flex-shrink-0"
                    style={{ background: statusStyle.bg, color: statusStyle.color }}>
                    {statusStyle.label}
                  </span>
                );

                return (
                  <div
                    key={s.sessionId}
                    className="transition-colors"
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Mobile: two-row layout */}
                    <div className="flex flex-col gap-3 px-6 py-4 sm:hidden">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg,#2e6bb5,#1a9e6e)", color: "#fff", fontWeight: 800, fontSize: "0.78rem" }}
                        >
                          {s.partnerAvatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-nunito font-bold" style={{ color: "var(--foreground)", fontSize: "0.9rem" }}>
                              {s.skillName}
                            </p>
                            <span className="text-xs px-2 py-0.5 rounded-full font-nunito-sans font-bold"
                              style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
                              {roleLabel}
                            </span>
                          </div>
                          <p className="font-nunito-sans" style={{ color: "var(--muted-foreground)", fontSize: "0.72rem" }}>
                            con {s.partnerFirstName} {s.partnerLastName} · {formatDate(s.scheduledDate)} · {formatTime(s.scheduledDate)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="font-nunito font-extrabold" style={{ color: s.creditsExchanged >= 0 ? "#1a9e6e" : "#e11d48" }}>
                            {s.creditsExchanged >= 0 ? "+" : ""}{s.creditsExchanged.toFixed(1)}
                          </span>
                          <span className="font-nunito-sans" style={{ color: "var(--muted-foreground)", fontSize: "0.65rem" }}>hrs</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        {actions}
                      </div>
                    </div>

                    {/* Desktop: single-row grid with fixed columns */}
                    <div className="hidden sm:grid sm:grid-cols-[40px_1fr_140px_70px_auto] sm:items-center sm:gap-3 px-6 py-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#2e6bb5,#1a9e6e)", color: "#fff", fontWeight: 800, fontSize: "0.78rem" }}
                      >
                        {s.partnerAvatar}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-nunito font-bold" style={{ color: "var(--foreground)", fontSize: "0.9rem" }}>
                            {s.skillName}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-nunito-sans font-bold"
                            style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
                            {roleLabel}
                          </span>
                        </div>
                        <p className="font-nunito-sans" style={{ color: "var(--muted-foreground)", fontSize: "0.78rem" }}>
                          con {s.partnerFirstName} {s.partnerLastName}
                        </p>
                      </div>

                      <div className="flex flex-col items-end">
                        <p className="font-nunito-sans" style={{ color: "var(--foreground)", fontSize: "0.82rem", fontWeight: 600 }}>
                          {formatDate(s.scheduledDate)}
                        </p>
                        <p className="font-nunito-sans" style={{ color: "var(--muted-foreground)", fontSize: "0.72rem" }}>
                          {formatTime(s.scheduledDate)} · {s.durationHours?.toFixed(1) ?? "1.0"}h
                        </p>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="font-nunito font-extrabold" style={{ color: s.creditsExchanged >= 0 ? "#1a9e6e" : "#e11d48" }}>
                          {s.creditsExchanged >= 0 ? "+" : ""}{s.creditsExchanged.toFixed(1)}
                        </span>
                        <span className="font-nunito-sans" style={{ color: "var(--muted-foreground)", fontSize: "0.65rem" }}>hrs</span>
                      </div>

                      <div className="flex items-center gap-1.5 justify-end">
                        {actions}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
