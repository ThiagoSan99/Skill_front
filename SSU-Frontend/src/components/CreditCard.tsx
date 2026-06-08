import type { CreditSummary } from "../api/dashboard.api";

interface CreditCardProps {
  data: CreditSummary;
  loading?: boolean;
}

export function CreditCard({ data, loading }: CreditCardProps) {
  const progress = data.monthlyGoal > 0
    ? Math.min((data.currentBalance / data.monthlyGoal) * 100, 100)
    : 0;

  if (loading) {
    return (
      <div
        className="rounded-2xl p-6 animate-pulse"
        style={{
          background: "linear-gradient(135deg, #0f2540, #1d4374)",
        }}
      >
        <div className="h-4 rounded w-24 mb-4" style={{ background: "rgba(255,255,255,0.15)" }} />
        <div className="h-10 rounded w-32 mb-4" style={{ background: "rgba(255,255,255,0.15)" }} />
        <div className="h-2 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.12)" }} />
        <div className="h-3 rounded w-20" style={{ background: "rgba(255,255,255,0.12)" }} />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 flex flex-col"
      style={{
        background: "linear-gradient(135deg, #0f2540, #1d4374)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <p style={{ color: "rgba(232,240,251,0.6)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Saldo actual
      </p>
      <div className="flex items-end gap-2 mt-1 mb-4">
        <span style={{ color: "#4ade80", fontSize: "2.4rem", fontWeight: 800, fontFamily: "'Nunito', sans-serif", lineHeight: 1 }}>
          {data.currentBalance.toFixed(1)}
        </span>
        <span style={{ color: "rgba(232,240,251,0.55)", fontSize: "0.85rem", marginBottom: "4px" }}>créditos</span>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: "rgba(232,240,251,0.5)" }}>Progreso mensual</span>
          <span style={{ color: "rgba(232,240,251,0.7)" }}>{progress.toFixed(0)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #1a9e6e, #4ade80)" }}
          />
        </div>
        <p style={{ color: "rgba(232,240,251,0.4)", fontSize: "0.68rem", marginTop: "4px" }}>
          Meta: {data.monthlyGoal} créditos este ciclo
        </p>
      </div>

      <div className="flex gap-4 mt-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div>
          <p style={{ color: "rgba(232,240,251,0.45)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Ganados
          </p>
          <p style={{ color: "#4ade80", fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
            +{data.earnedThisMonth.toFixed(1)}
          </p>
        </div>
        <div>
          <p style={{ color: "rgba(232,240,251,0.45)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Gastados
          </p>
          <p style={{ color: "#f87171", fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
            -{data.spentThisMonth.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}
