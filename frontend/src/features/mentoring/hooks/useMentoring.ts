import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/src/components/providers/AuthProvider";
import { mentoringService } from "../services/mentoringService";

export const useMentoring = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'delegated'>('pending');
  
  const [assigningDeptId, setAssigningDeptId] = useState<number | null>(null);
  const [assigningAdvisorId, setAssigningAdvisorId] = useState<number | null>(null);
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("");
  
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mentoringService.getRequests();
      setRequests(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch mentoring requests", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const isAdmin = useMemo(() => {
    return user?.roles?.includes("super_admin") || user?.roles?.includes("admin");
  }, [user]);

  useEffect(() => {
    fetchRequests();
    
    if (isAdmin) {
      Promise.all([
        mentoringService.getDepartments(),
        mentoringService.getAdvisors()
      ]).then(([dRes, aRes]) => {
        setDepartments(dRes.data.data || []);
        setAdvisors(aRes.data.data || []);
      }).catch(err => console.error("Failed to fetch admin mentoring context", err));
    }
  }, [fetchRequests, isAdmin]);

  const handleAssignDepartment = async (requestId: number) => {
    if (!selectedDept) return;
    setStatus(null);
    try {
      await mentoringService.assignDepartment(requestId, selectedDept);
      setAssigningDeptId(null);
      setSelectedDept("");
      setStatus({ type: "success", message: "Department assigned successfully" });
      fetchRequests();
    } catch (error: any) {
      setStatus({ type: "destructive", message: error.response?.data?.message || "Failed to assign department" });
      console.error("Failed to assign department", error);
    }
  };

  const handleAssignAdvisor = async (requestId: number) => {
    if (!selectedAdvisor) return;
    setStatus(null);
    try {
      await mentoringService.assignAdvisor(requestId, selectedAdvisor);
      setAssigningAdvisorId(null);
      setSelectedAdvisor("");
      setStatus({ type: "success", message: "Advisor assigned successfully" });
      fetchRequests();
    } catch (error: any) {
      setStatus({ type: "destructive", message: error.response?.data?.message || "Failed to assign advisor" });
      console.error("Failed to assign advisor", error);
    }
  };

  const filteredRequests = useMemo(() => {
    if (isAdmin) {
      return requests.filter(req => 
        activeTab === 'pending' ? req.status === 'pending' : req.status !== 'pending'
      );
    }
    return requests;
  }, [requests, isAdmin, activeTab]);

  return {
    user,
    requests: filteredRequests,
    departments,
    advisors,
    loading: loading || isAuthLoading,
    showForm,
    setShowForm,
    activeTab,
    setActiveTab,
    isAdmin,
    assigningDeptId,
    setAssigningDeptId,
    assigningAdvisorId,
    setAssigningAdvisorId,
    selectedDept,
    setSelectedDept,
    selectedAdvisor,
    setSelectedAdvisor,
    handleAssignDepartment,
    handleAssignAdvisor,
    refresh: fetchRequests,
    status,
    setStatus,
  };
};
