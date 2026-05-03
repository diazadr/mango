import { useState, useEffect, useCallback, useMemo } from "react";
import { umkmAdminService } from "../services/umkmAdminService";

export const useUmkmAdmin = () => {
  const [umkmList, setUmkmList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("name");
  const [institution, setInstitution] = useState<any>(null);
  const [detailUmkmId, setDetailUmkmId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const fetchContext = useCallback(async () => {
    try {
      const orgsRes = await umkmAdminService.getMyInstitutions();
      const institutions = orgsRes.data.data || [];
      const myOrg = institutions.find((org: any) => org.type === "upt") || institutions[0];
      setInstitution(myOrg);
    } catch (err) {}
  }, []);

  const fetchUmkm = useCallback(async () => {
    setLoading(true);
    try {
      const res = await umkmAdminService.getUmkmList();
      setUmkmList(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to sync UMKM data.");
      setStatus({ type: "destructive", message: "Failed to fetch UMKM data." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContext();
    fetchUmkm();
  }, [fetchContext, fetchUmkm]);

  const filteredUmkm = useMemo(() => {
    return umkmList.filter((u: any) => {
      const val = searchTerm.toLowerCase();
      if (searchBy === "name") return (u.name || "").toLowerCase().includes(val);
      if (searchBy === "owner") return (u.owner_name || "").toLowerCase().includes(val);
      return (u.name || "").toLowerCase().includes(val) || (u.owner_name || "").toLowerCase().includes(val);
    });
  }, [umkmList, searchTerm, searchBy]);

  const searchOptions = [
    { value: "name", label: "Nama Bisnis" },
    { value: "owner", label: "Nama Pemilik" }
  ];

  return {
    umkmList,
    filteredUmkm,
    loading,
    searchTerm,
    setSearchTerm,
    searchBy,
    setSearchBy,
    organization: institution,
    institution,
    detailUmkmId,
    setDetailUmkmId,
    searchOptions,
    status,
    setStatus,
    refresh: fetchUmkm
  };
};
