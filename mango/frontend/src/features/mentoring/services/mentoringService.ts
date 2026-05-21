import { api } from "@/src/lib/http/axios";

export const mentoringService = {
  async getRequests() {
    return api.get("/v1/mentoring/requests");
  },

  async getDepartments() {
    return api.get("/v1/mentoring/departments");
  },

  async getAdvisors() {
    return api.get("/v1/admin/users?role=advisor");
  },

  async getAssessmentCategories() {
    return api.get("/v1/mentoring/assessment-categories");
  },

  async assignDepartment(requestId: number, departmentId: string) {
    return api.post(`/v1/mentoring/requests/${requestId}/assign-department`, {
      department_id: departmentId,
    });
  },

  async assignAdvisor(requestId: number, advisorUserId: string) {
    return api.post(`/v1/mentoring/requests/${requestId}/assign`, {
      mentor_user_id: advisorUserId,
    });
  },

  async addNote(sessionId: number, data: {
    content: string;
    improved_categories?: number[];
    session_output?: string;
    has_measurable_impact?: boolean;
  }) {
    return api.post(`/v1/mentoring/sessions/${sessionId}/notes`, data);
  },

  async getImpactSummary(requestId: number) {
    return api.get(`/v1/mentoring/requests/${requestId}/impact-summary`);
  },

  async getSessions(params?: { status?: string; upcoming?: boolean }) {
    return api.get("/v1/mentoring/sessions", { params });
  },

  async getAdvisorSessions(params?: { upcoming?: boolean }) {
    return api.get("/v1/mentoring/sessions/my", { params });
  },

  async scheduleSession(requestId: number, data: { scheduled_at: string; meeting_link?: string; location?: string; notes?: string }) {
    return api.post(`/v1/mentoring/requests/${requestId}/schedule`, data);
  },

  async getLatestAssessment() {
    return api.get("/v1/assessments", { params: { per_page: 1, status: 'submitted' } });
  }
};
