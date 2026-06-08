import { http } from "./http";

export interface CreditSummary {
  currentBalance: number;
  monthlyGoal: number;
  earnedThisMonth: number;
  spentThisMonth: number;
}

export interface CreditHistoryPoint {
  month: string;
  earned: number;
  spent: number;
}

export interface DashboardStats {
  totalSessions: number;
  skillsTeaching: number;
  skillsLearning: number;
  reputationScore: number;
}

export interface MatchUser {
  userId: string;
  firstName: string;
  lastName: string;
  avatar: string;
  compatibility: number;
  skillName: string;
  skillLevel: string;
  creditsPerSession: number;
}

export interface RecentSession {
  sessionId: string;
  skillName: string;
  partnerFirstName: string;
  partnerLastName: string;
  partnerAvatar: string;
  scheduledDate: string;
  durationHours: number;
  creditsExchanged: number;
  status: string;
  role: "TEACHER" | "LEARNER";
  rating: number | null;
}

export const dashboardApi = {
  getCreditSummary: () =>
    http.get<CreditSummary>("/dashboard/credits"),

  getCreditHistory: () =>
    http.get<CreditHistoryPoint[]>("/dashboard/credit-history"),

  getStats: () =>
    http.get<DashboardStats>("/dashboard/stats"),

  getMatches: () =>
    http.get<MatchUser[]>("/dashboard/matches"),

  getRecentSessions: () =>
    http.get<RecentSession[]>("/dashboard/recent-sessions"),
};
