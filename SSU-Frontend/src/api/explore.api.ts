import { http } from "./http";
import type { Category } from "./profile.api";

export interface ExploreItem {
  userSkillId: string;
  skillId: string;
  skillName: string;
  categoryId: string;
  categoryName: string;
  tags: string;
  difficultyLevel: string;
  creditsPerSession: number;
  sessionsCompleted: number;
  rating: number;
  teacherUserId: string;
  teacherFirstName: string;
  teacherLastName: string;
  teacherAvatar: string;
}

export interface ExploreFilters {
  categoryId?: string;
  level?: string;
  search?: string;
  sort?: string;
}

export const exploreApi = {
  getExplore: (filters: ExploreFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.level) params.set("level", filters.level);
    if (filters.search) params.set("search", filters.search);
    if (filters.sort) params.set("sort", filters.sort);
    const qs = params.toString();
    return http.get<ExploreItem[]>(`/explore${qs ? `?${qs}` : ""}`);
  },

  getCategories: () => http.get<Category[]>("/categories"),
};
