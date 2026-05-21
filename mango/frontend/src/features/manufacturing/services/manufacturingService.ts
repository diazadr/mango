import { api } from "@/src/lib/http/axios";

export interface EdgeSite {
    id: number;
    name: string;
    site_id: string;
    api_key_preview: string;
    description: string | null;
    location: string | null;
    is_active: boolean;
    is_online: boolean;
    machine_count: number;
    last_sync_at: string | null;
    minutes_since_sync: number | null;
    institution: { id: number; name: string } | null;
    organization: { id: number; name: string } | null;
    umkm: { id: number; name: string } | null;
    created_at: string | null;
}

export const manufacturingService = {
    // ── Summary ──────────────────────────────────────
    async getSummary() {
        return api.get("/v1/erp-mes/summary");
    },

    // ── Work Orders ───────────────────────────────────
    async getWorkOrders(params?: {
        status?: string;
        machine_id?: string;
        search?: string;
        page?: number;
        per_page?: number;
    }) {
        return api.get("/v1/erp-mes/work-orders", { params });
    },

    async createWorkOrder(data: {
        code: string;
        title: string;
        machine_id?: string | null;
        operator_id?: string | null;
        product_id?: string | null;
        bom_id?: string | null;
        quantity_planned?: number;
        institution_id?: string | null;
        organization_id?: string | null;
        umkm_id?: string | null;
        part_number?: string;
        target_quantity: number;
        priority?: string;
        status?: string;
        shift?: number | null;
        notes?: string;
        planned_start_at?: string | null;
        planned_end_at?: string | null;
    }) {
        return api.post("/v1/erp-mes/work-orders", data);
    },

    async updateWorkOrder(id: number, data: Record<string, any>) {
        return api.put(`/v1/erp-mes/work-orders/${id}`, data);
    },

    // ── WO Operations ────────────────────────────────
    async getWOOperations(workOrderId: number) {
        return api.get(`/v1/erp-mes/work-orders/${workOrderId}/operations`);
    },

    async saveWOOperations(workOrderId: number, operations: Array<{
        operation_name: string;
        machine_id?: number | null;
        operator_id?: number | null;
        planned_duration_min?: number | null;
        notes?: string;
    }>) {
        return api.post(`/v1/erp-mes/work-orders/${workOrderId}/operations`, { operations });
    },

    async updateWOOperation(workOrderId: number, operationId: number, data: Record<string, any>) {
        return api.put(`/v1/erp-mes/work-orders/${workOrderId}/operations/${operationId}`, data);
    },

    // ── Production Records ────────────────────────────
    async getProductionRecords(params?: {
        work_order_id?: string;
        machine_id?: string;
        date?: string;
        page?: number;
        per_page?: number;
    }) {
        return api.get("/v1/erp-mes/production-records", { params });
    },

    async createProductionRecord(data: {
        work_order_id?: number | null;
        machine_id?: number | null;
        institution_id?: number | null;
        organization_id?: number | null;
        umkm_id?: number | null;
        operator_user_id?: number | null;
        shift?: number | null;
        good_quantity: number;
        reject_quantity?: number;
        reject_reason?: string | null;
        cycle_time_actual?: number | null;
        operating_time_min?: number | null;
        downtime_min?: number | null;
        recorded_at?: string | null;
    }) {
        return api.post("/v1/erp-mes/production-records", data);
    },

    async destroyProductionRecord(id: number) {
        return api.delete(`/v1/erp-mes/production-records/${id}`);
    },

    // ── OEE ──────────────────────────────────────────
    async getOEE(params?: { machine_id?: string; period?: 'today' | 'week' | 'month' }) {
        return api.get("/v1/erp-mes/oee", { params });
    },

    async getOEEHistory(params?: { machine_id?: string; days?: number }) {
        return api.get("/v1/erp-mes/oee/history", { params });
    },

    // ── Downtime ─────────────────────────────────────
    async getDowntime(params?: {
        machine_id?: string;
        source?: 'edge' | 'manual';
        from?: string;
        to?: string;
        per_page?: number;
        page?: number;
    }) {
        return api.get("/v1/erp-mes/downtime", { params });
    },

    async getDowntimeSummary(params?: { machine_id?: string; from?: string; to?: string }) {
        return api.get("/v1/erp-mes/downtime/summary", { params });
    },

    async createDowntime(data: {
        machine_id: number;
        work_order_id?: number | null;
        reason_code: string;
        description?: string;
        is_planned?: boolean;
        started_at?: string;
        ended_at?: string;
    }) {
        return api.post("/v1/erp-mes/downtime", data);
    },

    async stopDowntime(id: number) {
        return api.patch(`/v1/erp-mes/downtime/${id}/stop`);
    },

    async deleteDowntime(id: number) {
        return api.delete(`/v1/erp-mes/downtime/${id}`);
    },

    // ── Schedule (Gantt + Calendar) ───────────────────
    async getSchedule(params?: { from?: string; to?: string }) {
        return api.get("/v1/erp-mes/schedule", { params });
    },

    // ── Products & BOM ────────────────────────────────
    async getProducts() {
        return api.get("/v1/erp-mes/products");
    },

    async createProduct(data: Record<string, any>) {
        if (data.images && data.images.length > 0) {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'images') {
                    Array.from(data[key] as FileList | File[]).forEach(file => formData.append('images[]', file));
                } else if (key === 'bom_lines') {
                    data[key].forEach((line: any, index: number) => {
                        Object.keys(line).forEach(k => {
                            formData.append(`bom_lines[${index}][${k}]`, line[k]);
                        });
                    });
                } else if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });
            return api.post("/v1/erp-mes/products", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        return api.post("/v1/erp-mes/products", data);
    },

    async updateProduct(id: number, data: Record<string, any>) {
        if (data.images && data.images.length > 0) {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            Object.keys(data).forEach(key => {
                if (key === 'images') {
                    Array.from(data[key] as FileList | File[]).forEach(file => formData.append('images[]', file));
                } else if (key === 'bom_lines') {
                    // Update doesn't usually send bom_lines directly, but just in case
                    data[key].forEach((line: any, index: number) => {
                        Object.keys(line).forEach(k => {
                            formData.append(`bom_lines[${index}][${k}]`, line[k]);
                        });
                    });
                } else if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });
            return api.post(`/v1/erp-mes/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        return api.put(`/v1/erp-mes/products/${id}`, data);
    },

    async deleteProduct(id: number) {
        return api.delete(`/v1/erp-mes/products/${id}`);
    },

    async updateBOM(productId: number, lines: Array<{
        material_name: string;
        quantity: number;
        unit?: string;
        notes?: string;
    }>) {
        return api.post(`/v1/erp-mes/products/${productId}/bom`, { lines });
    },

    // ── Materials / Inventory ─────────────────────────
    async getMaterials(params?: { low_stock?: boolean }) {
        return api.get("/v1/erp-mes/materials", { params });
    },

    async createMaterial(data: Record<string, any>) {
        if (data.images && data.images.length > 0) {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'images') {
                    Array.from(data[key] as FileList | File[]).forEach(file => formData.append('images[]', file));
                } else if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });
            return api.post("/v1/erp-mes/materials", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        return api.post("/v1/erp-mes/materials", data);
    },

    async updateMaterial(id: number, data: Record<string, any>) {
        if (data.images && data.images.length > 0) {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            Object.keys(data).forEach(key => {
                if (key === 'images') {
                    Array.from(data[key] as FileList | File[]).forEach(file => formData.append('images[]', file));
                } else if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });
            return api.post(`/v1/erp-mes/materials/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        return api.put(`/v1/erp-mes/materials/${id}`, data);
    },

    async deleteMaterial(id: number) {
        return api.delete(`/v1/erp-mes/materials/${id}`);
    },

    async addMaterialMovement(materialId: number, data: {
        type: 'in' | 'out' | 'adjustment' | 'return';
        quantity: number;
        work_order_id?: number;
        reference?: string;
        notes?: string;
    }) {
        return api.post(`/v1/erp-mes/materials/${materialId}/movement`, data);
    },

    async getMaterialMovements(materialId: number) {
        return api.get(`/v1/erp-mes/materials/${materialId}/movements`);
    },

    // ── Alarm Events ──────────────────────────────────────
    async getAlarmEvents(params?: {
        status?: string;
        severity?: string;
        machine_id?: string;
        page?: number;
        per_page?: number;
    }) {
        return api.get("/v1/erp-mes/alarm-events", { params });
    },

    async resolveAlarm(id: number) {
        return api.post(`/v1/erp-mes/alarm-events/${id}/resolve`);
    },

    // ── Edge Logs (raw dari CNC edge) ─────────────────────
    async getEdgeProductionLogs(params?: {
        machine_id?: string;
        date?: string;
        page?: number;
        per_page?: number;
    }) {
        return api.get("/v1/erp-mes/edge-production-logs", { params });
    },

    async getEdgeAlarmLogs(params?: {
        machine_id?: string;
        severity?: string;
        page?: number;
        per_page?: number;
    }) {
        return api.get("/v1/erp-mes/edge-alarm-logs", { params });
    },

    // ── Master Data ───────────────────────────────────────
    async getMachines() {
        return api.get("/v1/machines", { params: { owner: "me", per_page: 200 } });
    },

    // ── Edge Site Management ──────────────────────────────
    async getEdgeSites() {
        return api.get("/v1/edge-sites");
    },

    async createEdgeSite(data: {
        name: string;
        site_id: string;
        description?: string;
        location?: string;
        institution_id?: number | null;
        organization_id?: number | null;
        umkm_id?: number | null;
    }) {
        return api.post("/v1/edge-sites", data);
    },

    async updateEdgeSite(id: number, data: Partial<{
        name: string;
        description: string;
        location: string;
        is_active: boolean;
    }>) {
        return api.put(`/v1/edge-sites/${id}`, data);
    },

    async deleteEdgeSite(id: number) {
        return api.delete(`/v1/edge-sites/${id}`);
    },

    async rotateEdgeSiteKey(id: number) {
        return api.post(`/v1/edge-sites/${id}/rotate-key`);
    },

    /** Parse 422 validation errors from Laravel into a flat string */
    parseErrors(err: any): string {
        const data = err?.response?.data;
        if (data?.errors) {
            return Object.values(data.errors as Record<string, string[]>)
                .flat()
                .join(" | ");
        }
        return data?.message ?? "Terjadi kesalahan. Silakan coba lagi.";
    },
};
