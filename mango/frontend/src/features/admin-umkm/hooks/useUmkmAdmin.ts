import { useState, useEffect, useCallback, useMemo } from "react";
import { umkmAdminService } from "../services/umkmAdminService";

export const useUmkmAdmin = (perPage: number = 10) => {
  const [umkmList, setUmkmList]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState("");
  const [searchBy, setSearchBy]       = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // ← baru
  const [sortKey, setSortKey]         = useState("name");  // ← baru
  const [sortOrder, setSortOrder]     = useState<"asc" | "desc">("asc"); // ← baru
  const [currentPage, setCurrentPage] = useState(1);       // ← baru
  const [totalPages, setTotalPages]   = useState(1);       // ← baru
  const [totalRecords, setTotalRecords] = useState(0);     // ← baru

  const [institution, setInstitution]     = useState<any>(null);
  const [detailUmkmId, setDetailUmkmId]   = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUmkm, setPreviewUmkm]     = useState<any>(null);
  const [processingId, setProcessingId]   = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  // ── Fetch context ────────────────────────────────────────────────────────
  const fetchContext = useCallback(async () => {
    try {
      const res = await umkmAdminService.getMyOrganizations();
      const orgs = res.data.data || res.data || [];
      const myOrg = orgs.find((o: any) => o.type === "upt") || orgs[0];
      setInstitution(myOrg);
    } catch (err) {
      console.error("Failed to fetch context", err);
    }
  }, []);

  // ── Fetch UMKM ───────────────────────────────────────────────────────────
  const fetchUmkm = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };
      if (searchTerm) {
        params.search = searchTerm;
        if (searchBy !== "all") params.search_by = searchBy;
      }
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await umkmAdminService.getUmkmList(params);
      const data = res.data.data || res.data || [];
      const meta = res.data.meta || {};

      setUmkmList(Array.isArray(data) ? data : []);
      setTotalPages(meta.last_page || 1);
      setTotalRecords(meta.total || (Array.isArray(data) ? data.length : 0));
    } catch (err) {
      console.error("Failed to fetch UMKM data.");
      setStatus({ type: "destructive", message: "Gagal mengambil data UMKM." });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, searchBy, statusFilter, currentPage, perPage]);

  // ── Reset page on filter change ──────────────────────────────────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchBy, statusFilter]);

  useEffect(() => { fetchContext(); }, [fetchContext]);

  useEffect(() => {
    const delay = setTimeout(fetchUmkm, 400);
    return () => clearTimeout(delay);
  }, [fetchUmkm]);

  // ── Sort handler ─────────────────────────────────────────────────────────
  const handleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortOrder("asc");
      return key;
    });
  }, []);

  // ── Client-side sort (filter sudah dilakukan server/fetch) ───────────────
  const filteredUmkm = useMemo(() => {
    return [...umkmList].sort((a, b) => {
      let valA = "";
      let valB = "";
      if (sortKey === "owner") {
        valA = String(a.owner_name || "").toLowerCase();
        valB = String(b.owner_name || "").toLowerCase();
      } else if (sortKey === "status") {
        valA = String(a.status || a.is_active || "");
        valB = String(b.status || b.is_active || "");
      } else {
        valA = String(a[sortKey] || "").toLowerCase();
        valB = String(b[sortKey] || "").toLowerCase();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ?  1 : -1;
      return 0;
    });
  }, [umkmList, sortKey, sortOrder]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleApprove = async (umkmId: number) => {
    setProcessingId(umkmId);
    setStatus(null);
    try {
      await umkmAdminService.approveUmkm(umkmId);
      setStatus({ type: "success", message: "UMKM berhasil disetujui." });
      fetchUmkm();
    } catch (err: any) {
      setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal menyetujui UMKM." });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (umkmId: number, reason = "Tidak memenuhi syarat") => {
    setProcessingId(umkmId);
    setStatus(null);
    try {
      await umkmAdminService.rejectUmkm(umkmId, reason);
      setStatus({ type: "success", message: "UMKM berhasil ditolak." });
      fetchUmkm();
    } catch (err: any) {
      setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal menolak UMKM." });
    } finally {
      setProcessingId(null);
    }
  };

  const openPreview = (umkm: any) => {
    setPreviewUmkm(umkm);
    setIsPreviewOpen(true);
  };

  const searchOptions = [
    { value: "all",   label: "Semua" },
    { value: "name",  label: "Nama Bisnis" },
    { value: "owner", label: "Nama Pemilik" },
  ];

  const statusOptions = [
    { value: "all",      label: "Semua Status" },
    { value: "active",   label: "Aktif" },
    { value: "inactive", label: "Nonaktif" },
    { value: "pending",  label: "Pending" },
    { value: "rejected", label: "Ditolak" },
  ];

  return {
    umkmList,
    filteredUmkm,
    loading,
    searchTerm, setSearchTerm,
    searchBy, setSearchBy,
    statusFilter, setStatusFilter,  // ← baru
    sortKey, sortOrder, handleSort, // ← baru
    currentPage, setCurrentPage,    // ← baru
    totalPages, totalRecords,       // ← baru
    organization: institution,
    institution,
    detailUmkmId, setDetailUmkmId,
    isPreviewOpen, setIsPreviewOpen,
    previewUmkm,
    searchOptions,
    statusOptions,                  // ← baru
    status, setStatus,
    refresh: fetchUmkm,
    processingId,
    handleApprove,
    handleReject,
    openPreview,
  };
};