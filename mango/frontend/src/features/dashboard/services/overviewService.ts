import { api } from "@/src/lib/http/axios";

export interface OverviewStats {
  umkm: { total: number; active: number; pending: number };
  users: { total: number; new_this_month: number };
  assessment: { total: number; avg_score: number };
  mentoring: { total: number; completed: number };
  reservation: { total: number; completed: number };
  articles: { total: number };
  edge: { total_sites: number; active_sites: number };
}

export interface EdgeConnectionStatus {
  site_id: string;
  name: string;
  location: string;
  is_active: boolean;
  last_seen: string;
  reachable: boolean;
  connections: {
    mqtt_local: { name: string; broker: string; connected: boolean; protocol: string };
    mqtt_cloud: { name: string; broker: string; connected: boolean; enabled: boolean; protocol: string };
    postgresql: { name: string; host: string; connected: boolean; protocol: string };
    influxdb: { name: string; url: string; connected: boolean; protocol: string };
  } | null;
  error: string | null;
}

export const overviewService = {
  /**
   * GET /v1/admin/overview
   * Statistik platform untuk SuperAdmin dashboard.
   */
  async getStats(): Promise<{ data: { data: OverviewStats } }> {
    return api.get("/v1/admin/overview");
  },

  /**
   * GET /v1/admin/edge/status
   * Status koneksi Edge Gateway — untuk Admin Kampus.
   */
  async getEdgeStatus(): Promise<{ data: { data: EdgeConnectionStatus[]; total: number; checked_at: string } }> {
    return api.get("/v1/admin/edge/status");
  },
};
