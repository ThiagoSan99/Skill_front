import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { dashboardApi, type CreditSummary, type CreditHistoryPoint, type DashboardStats, type MatchUser, type RecentSession } from "../api/dashboard.api";
import { CreditCard } from "../components/CreditCard";
import { StatCard } from "../components/StatCard";
import { MatchCard } from "../components/MatchCard";
import { RecentSessionRow } from "../components/RecentSessionRow";
import { QuickActions } from "../components/QuickActions";

function CreditAreaChart({ data, loading }: { data: CreditHistoryPoint[]; loading: boolean }) {
  if (loading) {
    return (
      <div
        className="rounded-2xl p-5 animate-pulse"
        style={{ background: "var(--card)", border: "1px solid var(--border)", height: "280px" }}
      >
        <div className="h-4 rounded w-40 mb-4" style={{ background: "var(--muted)" }} />
        <div className="h-full rounded" style={{ background: "var(--muted)" }} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div
        className="rounded-2xl p-5 flex items-center justify-center"
        style={{ background: "var(--card)", border: "1px solid var(--border)", height: "280px" }}
      >
        <p className="font-nunito-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
          No hay datos de créditos disponibles
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <h3 className="font-nunito font-bold mb-4" style={{ color: "var(--foreground)", fontSize: "0.95rem" }}>
        Historial de créditos
      </h3>
      <div style={{ height: "220px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1a9e6e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1a9e6e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
                fontSize: "0.8rem",
              }}
              labelStyle={{ color: "var(--foreground)", fontWeight: 700 }}
            />
            <Area
              type="monotone"
              dataKey="earned"
              stroke="#1a9e6e"
              strokeWidth={2}
              fill="url(#colorEarned)"
              name="Ganados"
            />
            <Area
              type="monotone"
              dataKey="spent"
              stroke="#e11d48"
              strokeWidth={2}
              fill="url(#colorSpent)"
              name="Gastados"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [creditSummary, setCreditSummary] = useState<CreditSummary | null>(null);
  const [creditHistory, setCreditHistory] = useState<CreditHistoryPoint[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [credit, history, statsData, matchesData, sessions] = await Promise.all([
          dashboardApi.getCreditSummary(),
          dashboardApi.getCreditHistory(),
          dashboardApi.getStats(),
          dashboardApi.getMatches(),
          dashboardApi.getRecentSessions(),
        ]);
        setCreditSummary(credit);
        setCreditHistory(history);
        setStats(statsData);
        setMatches(matchesData);
        setRecentSessions(sessions);
      } catch {
        setError("No se pudieron cargar los datos del dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRequestSession = (match: MatchUser) => {
    navigate(`/skills?teacher=${match.userId}`);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--background)" }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--muted)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--destructive)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="font-nunito font-bold text-lg mb-2" style={{ color: "var(--foreground)" }}>
            Error al cargar
          </h2>
          <p className="font-nunito-sans text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 rounded-xl font-nunito-sans font-semibold text-sm"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)", border: "none", cursor: "pointer" }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 lg:px-10 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-nunito font-extrabold text-2xl" style={{ color: "var(--foreground)" }}>
          Dashboard
        </h1>
        <p className="font-nunito-sans text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {loading ? "..." : "Bienvenido a tu panel de control"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <CreditCard
            data={creditSummary ?? { currentBalance: 0, monthlyGoal: 30, earnedThisMonth: 0, spentThisMonth: 0 }}
            loading={loading}
          />
        </div>
        <QuickActions />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Sesiones totales"
          value={loading ? "—" : stats?.totalSessions ?? 0}
          color="#1d4374"
          subtitle={loading ? "" : `+${(stats?.totalSessions ?? 0) > 0 ? Math.round((stats?.totalSessions ?? 0) / 4) : 0} esta semana`}
          loading={false}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
        />
        <StatCard
          label="Enseño"
          value={loading ? "—" : stats?.skillsTeaching ?? 0}
          color="#2e6bb5"
          subtitle="habilidades activas"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          }
        />
        <StatCard
          label="Aprendo"
          value={loading ? "—" : stats?.skillsLearning ?? 0}
          color="#1a9e6e"
          subtitle="habilidades en curso"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1.1 2.2 2 6 2s6-.9 6-2v-5" />
            </svg>
          }
        />
        <StatCard
          label="Reputación"
          value={loading ? "—" : `${(stats?.reputationScore ?? 0).toFixed(1)}★`}
          color="#f59e0b"
          subtitle={loading ? "" : (stats?.reputationScore ?? 0) >= 4.5 ? "Excelente" : (stats?.reputationScore ?? 0) >= 3.5 ? "Muy buena" : "Buena"}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <CreditAreaChart data={creditHistory} loading={loading} />
        </div>

        <div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 className="font-nunito font-bold" style={{ color: "var(--foreground)", fontSize: "0.95rem" }}>
                Matches recomendados
              </h3>
            </div>
            {loading ? (
              <div className="p-5 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full" style={{ background: "var(--muted)" }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 rounded w-24" style={{ background: "var(--muted)" }} />
                      <div className="h-3 rounded w-16" style={{ background: "var(--muted)" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : matches.length === 0 ? (
              <div className="p-5 text-center">
                <p className="font-nunito-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
                  No hay matches disponibles
                </p>
              </div>
            ) : (
              <div className="p-4 flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                {matches.map((match) => (
                  <MatchCard key={match.userId} match={match} onRequestSession={handleRequestSession} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h3 className="font-nunito font-bold" style={{ color: "var(--foreground)", fontSize: "0.95rem" }}>
                Sesiones recientes
              </h3>
              <button
                onClick={() => navigate("/sessions")}
                className="text-xs font-nunito-sans font-semibold"
                style={{ color: "var(--accent)", border: "none", background: "none", cursor: "pointer" }}
              >
                Ver todas
              </button>
            </div>
            {loading ? (
              <div className="p-5 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full" style={{ background: "var(--muted)" }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 rounded w-32" style={{ background: "var(--muted)" }} />
                      <div className="h-3 rounded w-20" style={{ background: "var(--muted)" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentSessions.length === 0 ? (
              <div className="p-5 text-center">
                <p className="font-nunito-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
                  No hay sesiones recientes
                </p>
              </div>
            ) : (
              recentSessions.map((session) => (
                <RecentSessionRow key={session.sessionId} session={session} />
              ))
            )}
          </div>
        </div>

        <div>
          <div
            className="rounded-2xl p-5"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <h3 className="font-nunito font-bold mb-4" style={{ color: "var(--foreground)", fontSize: "0.95rem" }}>
              Resumen del ciclo
            </h3>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse h-12 rounded-xl" style={{ background: "var(--muted)" }} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[
                  { label: "Créditos ganados", value: `${(creditSummary?.earnedThisMonth ?? 0).toFixed(1)} hrs`, color: "#1a9e6e", pct: creditSummary && creditSummary.monthlyGoal > 0 ? Math.min((creditSummary.earnedThisMonth / creditSummary.monthlyGoal) * 100, 100) : 0 },
                  { label: "Créditos gastados", value: `${(creditSummary?.spentThisMonth ?? 0).toFixed(1)} hrs`, color: "#e11d48", pct: creditSummary && creditSummary.monthlyGoal > 0 ? Math.min((creditSummary.spentThisMonth / creditSummary.monthlyGoal) * 100, 100) : 0 },
                  { label: "Saldo actual", value: `${(creditSummary?.currentBalance ?? 0).toFixed(1)} hrs`, color: "#4ade80", pct: creditSummary && creditSummary.monthlyGoal > 0 ? Math.min((creditSummary.currentBalance / creditSummary.monthlyGoal) * 100, 100) : 0 },
                  { label: "Meta del ciclo", value: `${creditSummary?.monthlyGoal ?? 30} hrs`, color: "#2e6bb5", pct: 100 },
                ].map(({ label, value, color, pct }) => (
                  <div key={label} className="rounded-xl px-4 py-3" style={{ background: "var(--muted)" }}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-nunito-sans text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
                      <span className="font-nunito font-bold text-sm" style={{ color }}>{value}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
