interface LoadingSkeletonProps {
  count?: number;
  height?: string;
  width?: string;
  className?: string;
}

export function LoadingSkeleton({ count = 1, height = "1rem", width = "100%", className = "" }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded-xl ${className}`}
          style={{ height, width, background: "var(--muted)" }}
        />
      ))}
    </>
  );
}

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-5 animate-pulse"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="h-3 rounded w-20 mb-4" style={{ background: "var(--muted)" }} />
          <div className="h-8 rounded w-28 mb-3" style={{ background: "var(--muted)" }} />
          <div className="h-2 rounded-full mb-2" style={{ background: "var(--muted)" }} />
          <div className="h-3 rounded w-24" style={{ background: "var(--muted)" }} />
        </div>
      ))}
    </div>
  );
}
