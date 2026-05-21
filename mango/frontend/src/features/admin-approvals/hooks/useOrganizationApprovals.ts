import { useState, useEffect, useCallback } from "react";
import { organizationApprovalsService } from "../services/organizationApprovalsService";

export const useOrganizationApprovals = () => {
  const [umkms, setUmkms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | string | null>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUmkm, setPreviewUmkm] = useState<any>(null);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const fetchUmkms = useCallback(async () => {
    setLoading(true);
    try {
      const orgsRes = await organizationApprovalsService.getMyOrganizations();
      const organizations = orgsRes.data.data || orgsRes.data || [];
      const myOrg = organizations.find((org: any) => org.type === "upt") || organizations[0];
      setOrganization(myOrg);

      if (myOrg) {
        const umkmsRes = await organizationApprovalsService.getPendingUmkms();
        setUmkms(umkmsRes.data.data || umkmsRes.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch pending UMKMs", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUmkms();
  }, [fetchUmkms]);

  const handleUpdateUmkmStatus = async (umkmId: string, approve: boolean) => {
    setProcessingId(`umkm-${umkmId}`);
    setStatus(null);
    try {
      if (approve) {
        await organizationApprovalsService.approveUmkm(umkmId);
        setStatus({ type: "success", message: "UMKM berhasil disetujui." });
      } else {
        await organizationApprovalsService.rejectUmkm(umkmId);
        setStatus({ type: "success", message: "UMKM berhasil ditolak." });
      }
      fetchUmkms();
    } catch (err: any) {
      setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal memproses permohonan UMKM." });
    } finally {
      setProcessingId(null);
    }
  };

  const openPreview = (umkm: any) => {
    setPreviewUmkm(umkm);
    setIsPreviewOpen(true);
  };

  return {
    umkms,
    loading,
    processingId,
    organization,
    isPreviewOpen,
    setIsPreviewOpen,
    previewUmkm,
    handleUpdateUmkmStatus,
    openPreview,
    refresh: fetchUmkms,
    status,
    setStatus,
  };
};
