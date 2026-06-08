interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
}

export function StatCard({ label, value, color = "var(--foreground)", icon, subtitle, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl p-5 animate-pulse" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="h-3 rounded w-20 mb-3" style={{ background: "var(--muted)" }} />
        <div className="h-8 rounded w-16 mb-2" style={{ background: "var(--muted)" }} />
        <div className="h-3 rounded w-24" style={{ background: "var(--muted)" }} />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5 flex flex-col"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-nunito-sans text-xs" style={{ color: "var(--muted-foreground)" }}>
          {label}
        </p>
        {icon && <span style={{ color: "var(--muted-foreground)" }}>{icon}</span>}
      </div>
      <p
        className="font-nunito font-extrabold"
        style={{ color, fontSize: "1.5rem", lineHeight: 1.1 }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="font-nunito-sans text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
