import { http } from "./http";

export interface BookSessionRequest {
  userSkillId: string;
  scheduledDate: string;
  durationHours: number;
}

export interface ExchangeSession {
  sessionId: string;
  teacherUserId: string;
  learnerUserId: string;
  skillId: string;
  scheduledDate: string;
  durationHours: number;
  creditsExchanged: number;
  meetingLink: string | null;
  sessionNotes: string | null;
  status: string;
}

export interface TeacherAvailability {
  availabilityId: string;
  teacherUserId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface BookedSlot {
  startTime: string;
  endTime: string;
}

export interface UserSession {
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
  meetingLink: string | null;
}

export const sessionsApi = {
  book: (data: BookSessionRequest) =>
    http.post<ExchangeSession>("/sessions/book", data),

  getTeacherAvailability: (teacherUserId: string) =>
    http.get<TeacherAvailability[]>(`/sessions/teacher-availability?teacherUserId=${teacherUserId}`),

  getBookedSlots: (teacherUserId: string, date: string) =>
    http.get<BookedSlot[]>(`/sessions/booked-slots?teacherUserId=${teacherUserId}&date=${date}`),

  getMySessions: () =>
    http.get<UserSession[]>("/sessions/me"),

  getMyAvailability: () =>
    http.get<TeacherAvailability[]>("/users/me/availability"),

  addAvailability: (data: { dayOfWeek: string; startTime: string; endTime: string }) =>
    http.post<TeacherAvailability>("/users/me/availability", data),

  deleteAvailability: (id: string) =>
    http.delete(`/users/me/availability/${id}`),
};
