import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export interface User {
  email: string;
  name: string;
  avatar: string;
  userId?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredToken(): string | null {
  return localStorage.getItem("token");
}

function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

function decodeToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      email: payload.sub,
      name: payload.firstName + " " + payload.lastName,
      avatar: (payload.firstName?.charAt(0) ?? "") + (payload.lastName?.charAt(0) ?? ""),
    };
  } catch {
    return null;
  }
}

async function fetchUserId(token: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const profile = await res.json();
      return profile.userId;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUser(decoded);
        fetchUserId(token).then((userId) => {
          if (userId) {
            setUser((prev) => (prev ? { ...prev, userId } : null));
          }
        });
      }
    }
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const error = new Error(body?.message ?? "Login failed") as Error & { status?: number; errorCode?: string; fieldErrors?: Record<string, string> };
        error.status = res.status;
        error.errorCode = body?.error;
        error.fieldErrors = body?.fieldErrors;
        throw error;
      }

      const data = await res.json();
      setStoredToken(data.token);

      const userId = await fetchUserId(data.token);

      setUser({
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        userId,
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  async function register(firstName: string, lastName: string, email: string, password: string) {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const error = new Error(body?.message ?? "Registration failed") as Error & { status?: number; errorCode?: string; fieldErrors?: Record<string, string> };
        error.status = res.status;
        error.errorCode = body?.error;
        error.fieldErrors = body?.fieldErrors;
        throw error;
      }

      const data = await res.json();
      setStoredToken(data.token);

      const userId = await fetchUserId(data.token);

      setUser({
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        userId,
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setStoredToken(null);
    setUser(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
