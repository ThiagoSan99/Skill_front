import { useEffect, useState, useMemo, useCallback } from "react";
import type { ExploreItem } from "../api/explore.api";
import { exploreApi } from "../api/explore.api";
import type { Category } from "../api/profile.api";
import { sessionsApi } from "../api/sessions.api";
import type { TeacherAvailability, BookedSlot } from "../api/sessions.api";

const LEVELS = ["Todos", "Básico", "Intermedio", "Avanzado"];
const SORT_OPTIONS = [
  { value: "rating", label: "Mejor valorados" },
  { value: "sessions", label: "Más sesiones" },
  { value: "credits", label: "Menos créditos" },
];
const DAY_NAMES: Record<string, string> = {
  MONDAY: "Lunes", TUESDAY: "Martes", WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves", FRIDAY: "Viernes", SATURDAY: "Sábado", SUNDAY: "Domingo",
};

function SkillCard({
  item,
  booked,
  onReserve,
}: {
  item: ExploreItem;
  booked: boolean;
  onReserve: (item: ExploreItem) => void;
}) {
  const tags = item.tags ? item.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#2e6bb5,#1a9e6e)", color: "#fff", fontWeight: 800, fontSize: "0.9rem" }}
          >
            {item.teacherAvatar}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="font-nunito font-bold truncate"
              style={{ color: "var(--foreground)", fontSize: "1.05rem" }}
            >
              {item.skillName}
            </h3>
            <p
              className="font-nunito-sans truncate"
              style={{ color: "var(--muted-foreground)", fontSize: "0.82rem" }}
            >
              {item.teacherFirstName} {item.teacherLastName}
            </p>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-full font-nunito-sans text-xs"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-sm font-nunito-sans flex-wrap">
          {item.difficultyLevel && (
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background:
                  item.difficultyLevel === "Básico"
                    ? "rgba(26,158,110,0.15)"
                    : item.difficultyLevel === "Intermedio"
                      ? "rgba(45,107,181,0.15)"
                      : "rgba(212,24,61,0.12)",
                color:
                  item.difficultyLevel === "Básico"
                    ? "#1a9e6e"
                    : item.difficultyLevel === "Intermedio"
                      ? "#2e6bb5"
                      : "#d4183d",
              }}
            >
              {item.difficultyLevel}
            </span>
          )}

          <span style={{ color: "var(--muted-foreground)" }}>
            ★ {item.rating?.toFixed(1) ?? "0.0"}
          </span>

          <span style={{ color: "var(--muted-foreground)" }}>
            {item.sessionsCompleted ?? 0} sesiones
          </span>
        </div>
      </div>

      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <span className="font-nunito font-bold" style={{ color: "var(--accent)", fontSize: "0.95rem" }}>
          {item.creditsPerSession?.toFixed(1) ?? "—"} créditos/sesión
        </span>
        <button
          onClick={() => onReserve(item)}
          disabled={booked}
          className="px-4 py-1.5 rounded-xl font-nunito-sans font-semibold text-sm transition-all"
          style={{
            background: booked ? "var(--muted)" : "var(--accent)",
            color: booked ? "var(--muted-foreground)" : "#fff",
            cursor: booked ? "not-allowed" : "pointer",
          }}
        >
          {booked ? "Reservado" : "Reservar"}
        </button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl overflow-hidden animate-pulse"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full" style={{ background: "var(--muted)" }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 rounded w-3/4" style={{ background: "var(--muted)" }} />
                <div className="h-3 rounded w-1/2" style={{ background: "var(--muted)" }} />
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="h-5 rounded-full w-14" style={{ background: "var(--muted)" }} />
              <div className="h-5 rounded-full w-16" style={{ background: "var(--muted)" }} />
            </div>
            <div className="flex gap-3">
              <div className="h-5 rounded-full w-16" style={{ background: "var(--muted)" }} />
              <div className="h-5 rounded w-20" style={{ background: "var(--muted)" }} />
            </div>
          </div>
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div className="h-4 rounded w-24" style={{ background: "var(--muted)" }} />
            <div className="h-8 rounded-xl w-20" style={{ background: "var(--muted)" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  Tecnología: "#2e6bb5",
  Ciencias: "#1a9e6e",
  Idiomas: "#d4a017",
  "Arte & Diseño": "#9b59b6",
  Negocios: "#e67e22",
  Humanidades: "#e74c3c",
};

function formatTime(t: string) {
  const [h, m] = t.split(":");
  return `${h}:${m}`;
}

function toLocalDateStr(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function BookingModal({
  item,
  onClose,
  onSuccess,
}: {
  item: ExploreItem;
  onClose: () => void;
  onSuccess: (msg: string, userSkillId: string) => void;
}) {
  const [availability, setAvailability] = useState<Record<string, TeacherAvailability[]>>({});
  const [loadingAvail, setLoadingAvail] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    sessionsApi.getTeacherAvailability(item.teacherUserId)
      .then((list) => {
        const byDay: Record<string, TeacherAvailability[]> = {};
        for (const a of list) {
          if (!byDay[a.dayOfWeek]) byDay[a.dayOfWeek] = [];
          byDay[a.dayOfWeek].push(a);
        }
        setAvailability(byDay);
      })
      .catch(() => {})
      .finally(() => setLoadingAvail(false));
  }, [item.teacherUserId]);

  useEffect(() => {
    if (!date) return;
    sessionsApi.getBookedSlots(item.teacherUserId, date)
      .then(setBookedSlots)
      .catch(() => setBookedSlots([]));
  }, [date, item.teacherUserId]);

  const selectedDayName = date ? new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" }).toUpperCase() : null;
  const todayStr = toLocalDateStr(new Date());

  const availableRanges = selectedDayName ? availability[selectedDayName] ?? [] : [];

  const isTimeBooked = (time: string): boolean => {
    const tMin = parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]);
    return bookedSlots.some((slot) => {
      const sMin = parseInt(slot.startTime.split(":")[0]) * 60 + parseInt(slot.startTime.split(":")[1]);
      const eMin = parseInt(slot.endTime.split(":")[0]) * 60 + parseInt(slot.endTime.split(":")[1]);
      return tMin >= sMin && tMin < eMin;
    });
  };

  const handleBook = async () => {
    if (!date || !startTime) return;
    setError("");
    setBooking(true);
    try {
      const scheduledDate = `${date}T${startTime}:00`;
      await sessionsApi.book({
        userSkillId: item.userSkillId,
        scheduledDate,
        durationHours: duration,
      });
      onSuccess(`Reserva confirmada con ${item.teacherFirstName} por "${item.skillName}"`, item.userSkillId);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      const ERROR_MAP: Record<string, string> = {
        "Teacher is not available at this time": "Error horario no disponible",
        "Teacher already has a session at this time": "El profesor ya tiene una sesión en ese horario",
        "Insufficient credits": "No tienes suficientes créditos",
        "You cannot book your own skill": "No puedes reservar tu propia habilidad",
        "Scheduled date must be in the future": "La fecha debe ser futura",
        "Sessions must be between 08:00 and 19:00": "Las sesiones deben ser entre 08:00 y 19:00",
      };
      setError(ERROR_MAP[msg] ?? "Error al reservar");
    } finally {
      setBooking(false);
    }
  };

  const totalCredits = (item.creditsPerSession ?? 0) * duration;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div
        className="rounded-3xl w-full max-w-lg overflow-hidden"
        style={{ background: "var(--card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#2e6bb5,#1a9e6e)", color: "#fff", fontWeight: 800, fontSize: "0.85rem" }}
            >
              {item.teacherAvatar}
            </div>
            <div>
              <p className="font-nunito font-bold" style={{ color: "var(--foreground)", fontSize: "1rem" }}>
                {item.skillName}
              </p>
              <p className="font-nunito-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
                {item.teacherFirstName} {item.teacherLastName}
              </p>
            </div>
          </div>

          {loadingAvail ? (
            <div className="flex items-center justify-center py-8">
              <p style={{ color: "var(--muted-foreground)" }}>Cargando disponibilidad...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="font-nunito-sans text-xs font-semibold mb-2" style={{ color: "var(--muted-foreground)" }}>
                  Disponibilidad semanal
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(availability).length === 0 ? (
                    <p className="font-nunito-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
                      El profesor no ha configurado horarios.
                    </p>
                  ) : (
                    Object.entries(availability).map(([day, slots]) => (
                      <span
                        key={day}
                        className="px-2.5 py-1 rounded-lg font-nunito-sans text-xs"
                        style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                      >
                        {DAY_NAMES[day] ?? day}: {slots.map((s) => `${formatTime(s.startTime)}-${formatTime(s.endTime)}`).join(", ")}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="font-nunito-sans text-xs font-semibold block mb-1" style={{ color: "var(--muted-foreground)" }}>
                    Fecha
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setStartTime(""); }}
                    className="w-full px-3 py-2 rounded-xl font-nunito-sans text-sm outline-none"
                    style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  />
                </div>
                <div>
                  <label className="font-nunito-sans text-xs font-semibold block mb-1" style={{ color: "var(--muted-foreground)" }}>
                    Hora de inicio
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    disabled={!date || availableRanges.length === 0}
                    className="w-full px-3 py-2 rounded-xl font-nunito-sans text-sm outline-none"
                    style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  >
                    <option value="">Seleccionar</option>
                    {availableRanges.map((range, i) => {
                      const startHour = parseInt(range.startTime.split(":")[0]);
                      const endHour = Math.min(parseInt(range.endTime.split(":")[0]), 19);
                      return Array.from(
                        { length: endHour - startHour },
                        (_, idx) => {
                          const h = startHour + idx;
                          const val = `${String(h).padStart(2, "0")}:00`;
                          if (isTimeBooked(val)) return null;
                          return <option key={`${i}-${val}`} value={val}>{val}</option>;
                        }
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="font-nunito-sans text-xs font-semibold block mb-1" style={{ color: "var(--muted-foreground)" }}>
                  Duración (horas)
                </label>
                <input
                  type="number"
                  min={0.5}
                  max={4}
                  step={0.5}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl font-nunito-sans text-sm outline-none"
                  style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                />
              </div>

              <div
                className="flex justify-between items-center px-4 py-3 rounded-xl mb-4"
                style={{ background: "var(--muted)" }}
              >
                <span className="font-nunito-sans text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Créditos a intercambiar
                </span>
                <span className="font-nunito font-bold" style={{ color: "var(--accent)" }}>
                  {totalCredits.toFixed(1)} créditos
                </span>
              </div>

              {error && (
                <p className="font-nunito-sans text-sm mb-3" style={{ color: "var(--destructive)" }}>
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleBook}
                  disabled={booking || !date || !startTime}
                  className="flex-1 px-5 py-2.5 rounded-xl font-nunito-sans font-semibold text-sm transition-all"
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    opacity: booking || !date || !startTime ? 0.6 : 1,
                    cursor: booking || !date || !startTime ? "not-allowed" : "pointer",
                  }}
                >
                  {booking ? "Reservando..." : "Confirmar reserva"}
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl font-nunito-sans font-semibold text-sm"
                  style={{ background: "var(--muted)", color: "var(--muted-foreground)", border: "none", cursor: "pointer" }}
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("rating");
  const [toast, setToast] = useState<string | null>(null);
  const [bookingItem, setBookingItem] = useState<ExploreItem | null>(null);
  const [bookedIds, setBookedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    Promise.all([exploreApi.getExplore(), exploreApi.getCategories()])
      .then(([skillsData, catsData]) => {
        setItems(skillsData);
        setCategories(catsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory && item.categoryName !== selectedCategory) return false;
      if (level && level !== "Todos" && item.difficultyLevel !== level) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = item.skillName.toLowerCase();
        const teacher = `${item.teacherFirstName} ${item.teacherLastName}`.toLowerCase();
        const tags = (item.tags ?? "").toLowerCase();
        if (!name.includes(q) && !teacher.includes(q) && !tags.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sort === "sessions") return (b.sessionsCompleted ?? 0) - (a.sessionsCompleted ?? 0);
      if (sort === "credits") return (a.creditsPerSession ?? Infinity) - (b.creditsPerSession ?? Infinity);
      return (b.rating ?? 0) - (a.rating ?? 0);
    });
  }, [items, selectedCategory, level, search, sort]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleReserveSuccess = useCallback((msg: string, userSkillId: string) => {
    setBookedIds((prev) => new Set(prev).add(userSkillId));
    showToast(msg);
  }, [showToast]);

  const handleReserve = useCallback((item: ExploreItem) => {
    setBookingItem(item);
  }, []);

  const clearFilters = () => {
    setSelectedCategory(null);
    setLevel("");
    setSearch("");
    setSort("rating");
  };

  const hasActiveFilters = selectedCategory || level || search || sort !== "rating";

  return (
    <div className="px-6 py-8 lg:px-10 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg font-nunito-sans text-sm animate-bounce"
          style={{ background: "var(--accent)", color: "#fff" }}>
          {toast}
        </div>
      )}

      {bookingItem && (
        <BookingModal
          item={bookingItem}
          onClose={() => setBookingItem(null)}
          onSuccess={handleReserveSuccess}
        />
      )}

      <div className="mb-6">
        <h1 className="font-nunito font-extrabold text-2xl" style={{ color: "var(--foreground)" }}>
          Explorar habilidades
        </h1>
        <p className="font-nunito-sans text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          {loading ? "..." : `${items.length} habilidades disponibles en la comunidad`}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar habilidades, profesores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl font-nunito-sans text-sm outline-none transition-all"
            style={{
              background: "var(--input-background)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="px-3 py-2.5 rounded-xl font-nunito-sans text-sm outline-none cursor-pointer"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
        >
          {LEVELS.map((l) => (
            <option key={l} value={l === "Todos" ? "" : l}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2.5 rounded-xl font-nunito-sans text-sm outline-none cursor-pointer"
          style={{
            background: "var(--input-background)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className="px-4 py-1.5 rounded-full font-nunito-sans text-sm font-semibold transition-all"
          style={{
            background: selectedCategory === null ? "var(--primary)" : "var(--muted)",
            color: selectedCategory === null ? "var(--primary-foreground)" : "var(--muted-foreground)",
          }}
        >
          Todas
        </button>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.name;
          const borderColor = CATEGORY_COLORS[cat.name] ?? "var(--primary)";
          return (
            <button
              key={cat.categoryId}
              onClick={() => setSelectedCategory(isActive ? null : cat.name)}
              className="px-4 py-1.5 rounded-full font-nunito-sans text-sm font-semibold transition-all"
              style={{
                background: isActive ? borderColor : "var(--muted)",
                color: isActive ? "#fff" : "var(--muted-foreground)",
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      <p className="font-nunito-sans text-sm mb-4" style={{ color: "var(--muted-foreground)" }}>
        {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
      </p>

      {loading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-nunito font-bold text-lg" style={{ color: "var(--foreground)" }}>
            No se encontraron habilidades
          </p>
          <p className="font-nunito-sans text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {hasActiveFilters ? "Intenta con otros filtros" : "Aún no hay profesores registrados"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-5 py-2 rounded-xl font-nunito-sans font-semibold text-sm"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <SkillCard key={item.userSkillId} item={item} booked={bookedIds.has(item.userSkillId)} onReserve={handleReserve} />
          ))}
        </div>
      )}
    </div>
  );
}
