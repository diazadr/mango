import { useState, useEffect, useCallback } from "react";
import { sikimService } from "../services/sikimService";

export const useSikimApprovals = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [institution, setInstitution] = useState<any>(null);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const orgsRes = await sikimService.getMyInstitutions();
      const institutions = orgsRes.data.data || [];
      const myOrg = institutions.find((org: any) => org.type === "upt") || institutions[0];
      setInstitution(myOrg);

      if (myOrg) {
        const res = await sikimService.getPendingMembers(myOrg.id);
        setMembers(res.data.data || res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch pending members", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleUpdateStatus = async (userId: number, approve: boolean) => {
    if (!institution) return;
    setProcessingId(userId);
    setStatus(null);
    try {
      if (approve) {
        await sikimService.approveMember(institution.id, userId);
        setStatus({ type: "success", message: "Member approved successfully." });
      } else {
        await sikimService.rejectMember(institution.id, userId);
        setStatus({ type: "success", message: "Member rejected successfully." });
      }
      fetchMembers();
    } catch (err: any) {
      setStatus({ type: "destructive", message: err.response?.data?.message || "Failed to process request." });
      console.error("Failed to process approval", err);
    } finally {
      setProcessingId(null);
    }
  };

  return {
    members,
    loading,
    processingId,
    organization: institution,
    institution,
    handleUpdateStatus,
    refresh: fetchMembers,
    status,
    setStatus,
  };
};
