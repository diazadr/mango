import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { campusService } from "../services/campusService";
import { campusSchema, CampusFormData } from "../schema/campusSchema";
import { useAuth } from "@/src/components/providers/AuthProvider";

export const useCampusInfo = (orgType: "kampus" | "upt" = "kampus") => {
  const { user: currentUser } = useAuth();
  const [campus, setCampus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const form = useForm<CampusFormData>({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      name: "",
      pic_name: "",
      pic_phone: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      province: "",
      regency: "",
      district: "",
      village: "",
      postal_code: "",
      latitude: "",
      longitude: "",
    },
  });

  const fetchCampus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await campusService.getMyInstitutions();
      const insts = Array.isArray(res.data) ? res.data : (res.data.data || []);
      const myOrg = insts.find((org: any) => org.type === orgType) || insts[0];

      if (myOrg) {
        setCampus(myOrg);
        form.reset({
          name: myOrg.name || "",
          pic_name: myOrg.pic_name || currentUser?.name || "",
          pic_phone: myOrg.pic_phone || currentUser?.phone || "",
          description: myOrg.description || "",
          email: myOrg.email || "",
          phone: myOrg.phone || "",
          address: myOrg.address || "",
          province: myOrg.province || "",
          regency: myOrg.regency || "",
          district: myOrg.district || "",
          postal_code: myOrg.postal_code || "",
          latitude: myOrg.latitude?.toString() || "",
          longitude: myOrg.longitude?.toString() || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch institution info", err);
    } finally {
      setLoading(false);
    }
  }, [form, orgType, currentUser]);

  useEffect(() => {
    fetchCampus();
  }, [fetchCampus]);

  const onSubmit = async (data: CampusFormData) => {
    if (!campus) return;
    setSubmitting(true);
    setStatus(null);
    try {
      await campusService.updateInstitution(campus.id, data);
      setStatus({ type: "success", message: "Data institusi berhasil diperbarui." });
      setIsEditing(false);
      fetchCampus();
    } catch (err: any) {
      setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal memperbarui data institusi." });
      console.error("Failed to update institution info", err);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    campus,
    loading,
    submitting,
    isEditing,
    setIsEditing,
    status,
    setStatus,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    refresh: fetchCampus,
  };
};
