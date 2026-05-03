import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { orgService } from "../services/orgService";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { organizationSchema as orgProfileSchema } from "../schema/orgSchema";
import { useAuth } from "@/src/components/providers/AuthProvider";

const profileSchema = orgProfileSchema.omit({ type: true });
export type OrgProfileFormData = z.infer<typeof profileSchema>;

export const useOrganizationInfo = () => {
  const { user: currentUser } = useAuth();
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const form = useForm<OrgProfileFormData>({
    resolver: zodResolver(profileSchema),
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
    },
  });

  const fetchOrganization = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orgService.getMyOrganizations();
      const orgs = Array.isArray(res.data) ? res.data : (res.data.data || []);
      const myOrg = orgs[0];

      if (myOrg) {
        setOrganization(myOrg);
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
          village: myOrg.village || "",
          postal_code: myOrg.postal_code || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch organization info", err);
    } finally {
      setLoading(false);
    }
  }, [form, currentUser]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  const onSubmit = async (data: OrgProfileFormData) => {
    if (!organization) return;
    setSubmitting(true);
    setStatus(null);
    try {
      await orgService.updateOrganization(organization.id, data);
      setStatus({ type: "success", message: "Data organisasi berhasil diperbarui." });
      setIsEditing(false);
      fetchOrganization();
    } catch (err: any) {
      setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal memperbarui data organisasi." });
      console.error("Failed to update organization info", err);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    organization,
    loading,
    submitting,
    isEditing,
    setIsEditing,
    status,
    setStatus,
    form,
    onSubmit: form.handleSubmit(onSubmit),
    refresh: fetchOrganization,
  };
};
