import { http } from "./http";

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  currentCreditBalance: number;
  reputationScore: number;
  bio: string | null;
}

export interface UserSkill {
  userSkillId: string;
  userId: string;
  skillId: string;
  skillName: string;
  categoryId: string;
  categoryName: string;
  proficiencyLevel: string;
  recommendedSessions: number;
  creditsPerSession?: number;
  sessionsCompleted?: number;
}

export interface Review {
  reviewId: string;
  sessionId: string;
  reviewerUserId: string;
  reviewedUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ExchangeSession {
  sessionId: string;
  teacherUserId: string;
  learnerUserId: string;
  skillId: string;
  scheduledDate: string;
  durationHours: number;
  creditsExchanged: number;
  meetingLink: string;
  sessionNotes: string;
  status: string;
}

export interface Category {
  categoryId: string;
  name: string;
}

export const profileApi = {
  getProfile: () => http.get<UserProfile>("/users/me"),

  updateProfile: (data: { firstName?: string; lastName?: string; bio?: string }) =>
    http.put<UserProfile>("/users/me", data),

  getMySkills: () => http.get<UserSkill[]>("/users/me/skills"),

  addSkill: (data: { skillName: string; categoryId: string; proficiencyLevel: string; recommendedSessions: number; creditsPerSession?: number }) =>
    http.post<UserSkill>("/users/me/skills", data),

  deleteSkill: (userSkillId: string) =>
    http.delete(`/users/me/skills/${userSkillId}`),

  getCategories: () => http.get<Category[]>("/categories"),

  getReviewsByReviewed: (userId: string) =>
    http.get<Review[]>(`/reviews?reviewedUserId=${userId}`),

  getSessionsByTeacher: (userId: string) =>
    http.get<ExchangeSession[]>(`/sessions?teacherUserId=${userId}`),

  getSessionsByLearner: (userId: string) =>
    http.get<ExchangeSession[]>(`/sessions?learnerUserId=${userId}`),
};


