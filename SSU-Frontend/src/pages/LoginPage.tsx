import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

const HERO_URL =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHMlMjBjb2xsYWJvcmF0aW5nJTIwbGVhcm5pbmclMjBza2lsbHN8ZW58MXx8fHwxNzgwNDI2ODgwfDA&ixlib=rb-4.1.0&q=80&w=1080";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof Error && "status" in err && (err as Error & { status?: number }).status === 400 && "fieldErrors" in err && (err as Error & { fieldErrors?: Record<string, string> }).fieldErrors) {
        setFieldErrors((err as Error & { fieldErrors: Record<string, string> }).fieldErrors);
      } else {
        setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      }
    }
  }

  return (
    <div className="min-h-screen w-full flex" style={{ background: "var(--background)" }}>
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-10">
            <div className="h-24 w-auto object-contain mb-2 flex items-center justify-center">
              <span className="text-5xl font-nunito font-extrabold" style={{ color: "var(--primary)" }}>
                SSU
              </span>
            </div>
            <p style={{ color: "var(--muted-foreground)" }} className="text-center text-sm font-nunito-sans">
              Intercambia habilidades. Crece junto a tu comunidad.
            </p>
          </div>

          <h1 className="mb-1 font-nunito font-semibold" style={{ color: "var(--foreground)" }}>
            Bienvenido
          </h1>
          <p className="mb-8 font-nunito-sans" style={{ color: "var(--muted-foreground)", fontSize: "0.95rem" }}>
            Inicia sesión en tu cuenta de SkillSwap U
          </p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-nunito-sans font-semibold" style={{ color: "var(--foreground)" }}>
                Correo electrónico o usuario
              </label>
              <input
                id="email" type="email" autoComplete="email"
                placeholder="tucorreo@universidad.edu"
                value={email} onChange={(e) => { setEmail(e.target.value); setFieldErrors((prev) => ({ ...prev, email: "" })); }} required
                className="w-full px-4 py-2.5 rounded-lg outline-none transition-all font-nunito-sans"
                style={{ background: "var(--input-background)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4374")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              />
              {fieldErrors.email && (
                <p style={{ color: "var(--destructive)", fontSize: "0.85rem" }} className="font-nunito-sans">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="font-nunito-sans font-semibold" style={{ color: "var(--foreground)" }}>
                  Contraseña
                </label>
                
              </div>
              <div className="relative">
                <input
                  id="password" type={showPassword ? "text" : "password"}
                  autoComplete="current-password" placeholder="••••••••"
                  value={password} onChange={(e) => { setPassword(e.target.value); setFieldErrors((prev) => ({ ...prev, password: "" })); }} required
                  className="w-full px-4 py-2.5 pr-12 rounded-lg outline-none transition-all font-nunito-sans"
                  style={{ background: "var(--input-background)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#1d4374")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                  style={{ color: "var(--muted-foreground)" }}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p style={{ color: "var(--destructive)", fontSize: "0.85rem" }} className="font-nunito-sans">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-1 font-nunito-sans font-semibold"
              style={{
                background: loading ? "#2e6bb5" : "#1d4374",
                color: "#ffffff",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#2e6bb5"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#1d4374"; }}
            >
              {loading ? (
                <><svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Ingresando…</>
              ) : "Iniciar sesión"}
            </button>
            {error && (
              <p style={{ color: "var(--destructive)", fontSize: "0.85rem" }} className="text-center font-nunito-sans">
                {error}
              </p>
            )}
          </form>


          <p className="text-center mt-7 font-nunito-sans" style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>
            ¿No tienes cuenta?{" "}
            <button type="button" className="transition-colors font-semibold" style={{ color: "#1d4374" }}
              onClick={() => navigate("/register")}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#2e6bb5")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#1d4374")}
            >
              Crear cuenta gratis
            </button>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: "#0f2540" }}>
        <img src={HERO_URL} alt="Estudiantes colaborando" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.45 }} />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16 h-full w-full">
          <div className="flex flex-wrap gap-3 mb-8">
            {["Créditos por tiempo", "Comunidad académica", "Intercambio de habilidades"].map((tag) => (
              <span key={tag} className="px-4 py-1.5 rounded-full text-sm font-nunito-sans" style={{ background: "rgba(255,255,255,0.15)", color: "#e8f0fb", backdropFilter: "blur(6px)" }}>
                {tag}
              </span>
            ))}
          </div>
          <blockquote>
            <p className="mb-4 font-nunito font-bold" style={{ color: "#ffffff", fontSize: "1.6rem", lineHeight: 1.35, maxWidth: "480px" }}>
              "Aprende enseñando. Crece compartiendo. Conecta sin límites."
            </p>
            <footer style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem" }} className="font-nunito-sans">
              La plataforma universitaria donde cada hora cuenta
            </footer>
          </blockquote>
          <div className="flex gap-10 mt-10">
            {[["1,200+", "Estudiantes activos"], ["340+", "Habilidades disponibles"], ["4.8★", "Valoración media"]].map(([val, label]) => (
              <div key={label}>
                <p className="font-nunito font-extrabold" style={{ color: "#ffffff", fontSize: "1.3rem" }}>{val}</p>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem" }} className="font-nunito-sans">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
