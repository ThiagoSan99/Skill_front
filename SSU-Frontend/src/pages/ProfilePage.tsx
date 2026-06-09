import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  profileApi,
  type UserProfile,
  type UserSkill,
  type Review,
  type Category,
} from "../api/profile.api";
import { sessionsApi, type TeacherAvailability, type UserSession } from "../api/sessions.api";

const LEVEL_COLOR: Record<string, string> = {
  Básico: "#1a9e6e",
  Intermedio: "#d97706",
  Avanzado: "#e11d48",
};
const LEVEL_BG: Record<string, string> = {
  Básico: "#d1faed",
  Intermedio: "#fef3c7",
  Avanzado: "#fee2e2",
};

const AVATAR_COLORS = ["#7c3aed", "#e11d48", "#d97706", "#1d4374", "#1a9e6e", "#0891b2"];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function avatarInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [learnerSessionCount, setLearnerSessionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [editBio, setEditBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  const [activeTab, setActiveTab] = useState<"enseña" | "aprende" | "reseñas" | "disponibilidad">("enseña");

  const [showAddSkill, setShowAddSkill] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newSkill, setNewSkill] = useState({
    skillName: "",
    categoryId: "",
    proficiencyLevel: "Básico",
    recommendedSessions: 1,
    creditsPerSession: 1.0,
  });
  const [addingSkill, setAddingSkill] = useState(false);

  const [learnerSessions, setLearnerSessions] = useState<UserSession[]>([]);
  const [availability, setAvailability] = useState<TeacherAvailability[]>([]);
  const [showAddAvailability, setShowAddAvailability] = useState(false);
  const [newAvailability, setNewAvailability] = useState({
    dayOfWeek: "MONDAY",
    startTime: "09:00",
    endTime: "12:00",
  });
  const [addingAvailability, setAddingAvailability] = useState(false);

  async function loadData() {
    if (!user?.userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [profileData, skillsData, reviewsData, teacherSessions, learnerCountSessions, availData, allSessions] =
        await Promise.all([
          profileApi.getProfile(),
          profileApi.getMySkills(),
          profileApi.getReviewsByReviewed(user.userId),
          profileApi.getSessionsByTeacher(user.userId),
          profileApi.getSessionsByLearner(user.userId),
          sessionsApi.getMyAvailability(),
          sessionsApi.getMySessions(),
        ]);
      setProfile(profileData);
      setSkills(skillsData);
      setReviews(reviewsData);
      setSessionCount(teacherSessions.length);
      setLearnerSessionCount(learnerCountSessions.length);
      setLearnerSessions(allSessions.filter((s) => s.role === "LEARNER" && s.status === "COMPLETED"));
      setAvailability(availData);
      setBioText(profileData.bio ?? "");
    } catch {
      /* handled by http error */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user?.userId]);

  async function handleSaveBio() {
    setSavingBio(true);
    try {
      const updated = await profileApi.updateProfile({ bio: bioText });
      setProfile(updated);
      setEditBio(false);
    } catch {
      /* handled by http error */
    } finally {
      setSavingBio(false);
    }
  }

  async function handleOpenAddSkill() {
    setShowAddSkill(true);
    try {
      const cats = await profileApi.getCategories();
      setCategories(cats);
      if (cats.length > 0 && !newSkill.categoryId) {
        setNewSkill((prev) => ({ ...prev, categoryId: cats[0].categoryId }));
      }
    } catch {
      /* ignore */
    }
  }

  async function handleAddSkill() {
    setAddingSkill(true);
    try {
      await profileApi.addSkill(newSkill);
      setShowAddSkill(false);
      setNewSkill({
        skillName: "",
        categoryId: categories[0]?.categoryId ?? "",
        proficiencyLevel: "Básico",
        recommendedSessions: 1,
        creditsPerSession: 1.0,
      });
      const skillsData = await profileApi.getMySkills();
      setSkills(skillsData);
    } catch {
      /* handled by http error */
    } finally {
      setAddingSkill(false);
    }
  }

  async function handleDeleteSkill(userSkillId: string) {
    try {
      await profileApi.deleteSkill(userSkillId);
      setSkills((prev) => prev.filter((s) => s.userSkillId !== userSkillId));
    } catch {
      /* handle error */
    }
  }

  async function handleAddAvailability() {
    setAddingAvailability(true);
    try {
      const created = await sessionsApi.addAvailability(newAvailability);
      setAvailability((prev) => [...prev, created]);
      setShowAddAvailability(false);
      setNewAvailability({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "12:00" });
    } catch {
      /* handled by http error */
    } finally {
      setAddingAvailability(false);
    }
  }

  async function handleDeleteAvailability(availabilityId: string) {
    try {
      await sessionsApi.deleteAvailability(availabilityId);
      setAvailability((prev) => prev.filter((a) => a.availabilityId !== availabilityId));
    } catch {
      /* handle error */
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p style={{ color: "var(--muted-foreground)" }}>Cargando perfil...</p>
      </div>
    );
  }

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user?.name ?? "Usuario";
  const initials = user?.avatar ?? avatarInitials(displayName);
  const rating = profile?.reputationScore ?? 0;

  const DAY_NAMES: Record<string, string> = {
    MONDAY: "Lunes", TUESDAY: "Martes", WEDNESDAY: "Miércoles",
    THURSDAY: "Jueves", FRIDAY: "Viernes", SATURDAY: "Sábado", SUNDAY: "Domingo",
  };

  const tabs = [
    { key: "enseña" as const, label: "Lo que enseño" },
    { key: "aprende" as const, label: "Lo que aprendo" },
    { key: "reseñas" as const, label: "Reseñas" },
    { key: "disponibilidad" as const, label: "Disponibilidad" },
  ];

  return (
    <div className="px-6 py-8 lg:px-10 max-w-4xl mx-auto">
      {/* Profile Card */}
      <div
        className="rounded-2xl p-7 mb-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#1d4374,#1a9e6e)",
              color: "#fff",
              fontFamily: "'Nunito',sans-serif",
              fontWeight: 800,
              fontSize: "1.6rem",
            }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 mb-1">
              <h1
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  color: "var(--foreground)",
                  fontWeight: 800,
                }}
              >
                {displayName}
              </h1>
              <div className="flex items-center gap-2">
                <span style={{ color: "#f59e0b", fontSize: "1rem" }}>★</span>
                <span style={{ color: "var(--foreground)", fontWeight: 700 }}>
                  {rating.toFixed(1)}
                </span>
                <span style={{ color: "var(--muted-foreground)", fontSize: "0.82rem" }}>
                  ({reviews.length} reseñas)
                </span>
              </div>
            </div>

            {editBio ? (
              <div className="mt-2">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl outline-none resize-none"
                  style={{
                    background: "var(--input-background)",
                    border: "1.5px solid #1d4374",
                    color: "var(--foreground)",
                    fontSize: "0.88rem",
                  }}
                />
              </div>
            ) : (
              <p
                style={{
                  color: "var(--foreground)",
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                  marginTop: "6px",
                }}
              >
                {profile?.bio ?? "Sin descripción aún."}
              </p>
            )}
          </div>

          {editBio ? (
            <button
              onClick={handleSaveBio}
              disabled={savingBio}
              className="px-4 py-2 rounded-xl transition-all flex-shrink-0 self-start"
              style={{
                background: "#1d4374",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.85rem",
              }}
            >
              {savingBio ? "Guardando..." : "Guardar"}
            </button>
          ) : (
            <button
              onClick={() => setEditBio(true)}
              className="px-4 py-2 rounded-xl transition-all flex-shrink-0 self-start"
              style={{
                background: "var(--muted)",
                color: "var(--muted-foreground)",
                fontWeight: 700,
                fontSize: "0.85rem",
              }}
            >
              Editar perfil
            </button>
          )}
        </div>

        {/* Stats bar */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {[
            { label: "Créditos actuales", value: `${profile?.currentCreditBalance?.toFixed(1) ?? "0"} hrs`, color: "#1a9e6e" },
            { label: "Sesiones totales", value: String(sessionCount), color: "#1d4374" },
            { label: "Habilidades enseñadas", value: String(skills.length), color: "#7c3aed" },
            { label: "Habilidades aprendidas", value: String(learnerSessionCount), color: "#d97706" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p
                style={{
                  color,
                  fontFamily: "'Nunito',sans-serif",
                  fontWeight: 800,
                  fontSize: "1.3rem",
                }}
              >
                {value}
              </p>
              <p style={{ color: "var(--muted-foreground)", fontSize: "0.72rem" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl mb-5 w-fit"
        style={{ background: "var(--muted)" }}
      >
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="px-5 py-1.5 rounded-lg text-sm transition-all capitalize"
            style={{
              background: activeTab === key ? "var(--card)" : "transparent",
              color:
                activeTab === key
                  ? "var(--foreground)"
                  : "var(--muted-foreground)",
              fontWeight: activeTab === key ? 700 : 500,
              boxShadow:
                activeTab === key
                  ? "0 1px 3px rgba(0,0,0,0.08)"
                  : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab: Lo que enseño */}
      {activeTab === "enseña" && (
        <div className="flex flex-col gap-3">
          {skills.length === 0 && !showAddSkill && (
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", padding: "1rem 0" }}>
              Aún no agregas habilidades para enseñar.
            </p>
          )}

          {skills.map((sk) => (
            <div
              key={sk.userSkillId}
              className="rounded-2xl px-5 py-4"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p style={{ color: "var(--foreground)", fontWeight: 700 }}>
                      {sk.skillName}
                    </p>
                    <button
                      onClick={() => handleDeleteSkill(sk.userSkillId)}
                      style={{ color: "var(--muted-foreground)", fontSize: "0.7rem", background: "var(--muted)", border: "none", cursor: "pointer", width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: LEVEL_BG[sk.proficiencyLevel] ?? "#e4eaf4",
                        color: LEVEL_COLOR[sk.proficiencyLevel] ?? "var(--muted-foreground)",
                      }}
                    >
                      {sk.proficiencyLevel}
                    </span>
                    <span style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>
                      {sk.sessionsCompleted ?? 0}/{sk.recommendedSessions} sesiones
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {showAddSkill ? (
            <div
              className="rounded-2xl p-5 mt-2"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontFamily: "'Nunito',sans-serif",
                  fontWeight: 800,
                  color: "var(--foreground)",
                  marginBottom: "1rem",
                }}
              >
                Nueva habilidad
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--muted-foreground)",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Categoría
                  </label>
                  <select
                    value={newSkill.categoryId}
                    onChange={(e) =>
                      setNewSkill((prev) => ({ ...prev, categoryId: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={{
                      background: "var(--muted)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontSize: "0.88rem",
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--muted-foreground)",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Nombre
                  </label>
                  <input
                    value={newSkill.skillName}
                    onChange={(e) =>
                      setNewSkill((prev) => ({ ...prev, skillName: e.target.value }))
                    }
                    placeholder="Ej: Cálculo diferencial"
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={{
                      background: "var(--muted)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontSize: "0.88rem",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--muted-foreground)",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Nivel
                  </label>
                  <select
                    value={newSkill.proficiencyLevel}
                    onChange={(e) =>
                      setNewSkill((prev) => ({
                        ...prev,
                        proficiencyLevel: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={{
                      background: "var(--muted)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontSize: "0.88rem",
                    }}
                  >
                    <option value="Básico">Básico</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--muted-foreground)",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Sesiones recomendadas
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newSkill.recommendedSessions}
                    onChange={(e) =>
                      setNewSkill((prev) => ({
                        ...prev,
                        recommendedSessions: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={{
                      background: "var(--muted)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontSize: "0.88rem",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--muted-foreground)",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Créditos por sesión
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={newSkill.creditsPerSession}
                    onChange={(e) =>
                      setNewSkill((prev) => ({
                        ...prev,
                        creditsPerSession: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={{
                      background: "var(--muted)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontSize: "0.88rem",
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddSkill}
                  disabled={addingSkill || !newSkill.skillName || !newSkill.categoryId}
                  className="px-5 py-2 rounded-xl text-sm transition-all"
                  style={{
                    background: "#1d4374",
                    color: "#fff",
                    fontWeight: 700,
                    opacity:
                      addingSkill || !newSkill.skillName || !newSkill.categoryId
                        ? 0.6
                        : 1,
                    border: "none",
                    cursor:
                      addingSkill || !newSkill.skillName || !newSkill.categoryId
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {addingSkill ? "Agregando..." : "Guardar"}
                </button>
                <button
                  onClick={() => {
                    setShowAddSkill(false);
                    setNewSkill({
                      skillName: "",
                      categoryId: categories[0]?.categoryId ?? "",
                      proficiencyLevel: "Básico",
                      recommendedSessions: 1,
                      creditsPerSession: 1.0,
                    });
                  }}
                  className="px-5 py-2 rounded-xl text-sm transition-all"
                  style={{
                    background: "var(--muted)",
                    color: "var(--muted-foreground)",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleOpenAddSkill}
              className="mt-2 px-5 py-2.5 rounded-xl text-sm transition-all self-start"
              style={{
                background: "#1d4374",
                color: "#fff",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              + Agregar habilidad
            </button>
          )}
        </div>
      )}

      {/* Tab: Lo que aprendo */}
      {activeTab === "aprende" && (
        <div className="flex flex-col gap-3">
          {learnerSessions.length === 0 ? (
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", padding: "1rem 0" }}>
              Aún no has tomado clases como aprendiz.
            </p>
          ) : (
            learnerSessions.map((s) => {
              const statusColors: Record<string, { label: string; bg: string; color: string }> = {
                COMPLETED: { label: "Completada", bg: "#d1faed", color: "#1a9e6e" },
                PENDING: { label: "Programada", bg: "#fef3c7", color: "#d97706" },
                ACCEPTED: { label: "Programada", bg: "#fef3c7", color: "#d97706" },
                CANCELLED: { label: "Cancelada", bg: "#fee2e2", color: "#e11d48" },
                DISPUTED: { label: "Disputada", bg: "#fee2e2", color: "#e11d48" },
              };
              const sc = statusColors[s.status] ?? { label: s.status, bg: "var(--muted)", color: "var(--muted-foreground)" };
              const d = new Date(s.scheduledDate);
              const timeStr = d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });
              return (
                <div
                  key={s.sessionId}
                  className="rounded-2xl px-5 py-4"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p style={{ color: "var(--foreground)", fontWeight: 700 }}>
                          {s.skillName}
                        </p>
                        {s.status === "COMPLETED" && s.rating !== null && (
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} style={{ color: star <= s.rating! ? "#f59e0b" : "var(--border)", fontSize: "12px" }}>★</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p style={{ color: "var(--muted-foreground)", fontSize: "0.78rem", marginTop: "1px" }}>
                        con {s.partnerFirstName} {s.partnerLastName} · {formatDate(s.scheduledDate)} · {timeStr}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                      <span className="font-nunito font-extrabold" style={{ color: "#e11d48", fontSize: "0.85rem" }}>
                        -{Math.abs(s.creditsExchanged).toFixed(1)} hrs
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Reseñas */}
      {activeTab === "reseñas" && (
        <div className="flex flex-col gap-4">
          {reviews.length === 0 && (
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", padding: "1rem 0" }}>
              Aún no tienes reseñas.
            </p>
          )}

          {reviews.map((r) => (
            <div
              key={r.reviewId}
              className="rounded-2xl p-5"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: avatarColor(r.reviewerUserId),
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    fontFamily: "'Nunito',sans-serif",
                  }}
                >
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p
                      style={{
                        color: "var(--foreground)",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      Usuario
                    </p>
                    <span style={{ color: "var(--muted-foreground)", fontSize: "0.72rem" }}>
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    style={{
                      color: s <= r.rating ? "#f59e0b" : "var(--border)",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p
                style={{
                  color: "var(--foreground)",
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                }}
              >
                {r.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Disponibilidad */}
      {activeTab === "disponibilidad" && (
        <div className="flex flex-col gap-3">
          {availability.length === 0 && !showAddAvailability && (
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem", padding: "1rem 0" }}>
              Aún no configuras tu disponibilidad.
            </p>
          )}

          {availability.map((a) => (
            <div
              key={a.availabilityId}
              className="rounded-2xl px-5 py-3 flex items-center gap-4"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="px-3 py-1 rounded-lg font-nunito-sans text-sm font-semibold"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
              >
                {DAY_NAMES[a.dayOfWeek] ?? a.dayOfWeek} {a.startTime.slice(0, 5)} - {a.endTime.slice(0, 5)}
              </span>
              <button
                onClick={() => handleDeleteAvailability(a.availabilityId)}
                className="ml-auto flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)", fontSize: "0.8rem", fontWeight: 700, border: "none", cursor: "pointer" }}
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))}

          {showAddAvailability ? (
            <div
              className="rounded-2xl p-5 mt-2"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontFamily: "'Nunito',sans-serif",
                  fontWeight: 800,
                  color: "var(--foreground)",
                  marginBottom: "1rem",
                }}
              >
                Nuevo horario
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--muted-foreground)",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Día
                  </label>
                  <select
                    value={newAvailability.dayOfWeek}
                    onChange={(e) =>
                      setNewAvailability((prev) => ({ ...prev, dayOfWeek: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={{
                      background: "var(--muted)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontSize: "0.88rem",
                    }}
                  >
                    {Object.entries(DAY_NAMES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--muted-foreground)",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Desde
                  </label>
                  <input
                    type="time"
                    value={newAvailability.startTime}
                    onChange={(e) =>
                      setNewAvailability((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={{
                      background: "var(--muted)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontSize: "0.88rem",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--muted-foreground)",
                      fontWeight: 600,
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    Hasta
                  </label>
                  <input
                    type="time"
                    value={newAvailability.endTime}
                    onChange={(e) =>
                      setNewAvailability((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={{
                      background: "var(--muted)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontSize: "0.88rem",
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddAvailability}
                  disabled={addingAvailability}
                  className="px-5 py-2 rounded-xl text-sm transition-all"
                  style={{
                    background: "#1d4374",
                    color: "#fff",
                    fontWeight: 700,
                    opacity: addingAvailability ? 0.6 : 1,
                    border: "none",
                    cursor: addingAvailability ? "not-allowed" : "pointer",
                  }}
                >
                  {addingAvailability ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={() => {
                    setShowAddAvailability(false);
                    setNewAvailability({ dayOfWeek: "MONDAY", startTime: "09:00", endTime: "12:00" });
                  }}
                  className="px-5 py-2 rounded-xl text-sm transition-all"
                  style={{
                    background: "var(--muted)",
                    color: "var(--muted-foreground)",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddAvailability(true)}
              className="mt-2 px-5 py-2.5 rounded-xl text-sm transition-all self-start"
              style={{
                background: "#1d4374",
                color: "#fff",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              + Agregar horario
            </button>
          )}
        </div>
      )}
    </div>
  );
}
