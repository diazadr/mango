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
  const [searchTerm, setSearchTerm] = useState("");
  
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

  const handleAssignDepartment = async (requestId: number, deptId?: string) => {
    const finalDeptId = deptId || selectedDept;
    if (!finalDeptId) return;
    setStatus(null);
    try {
      await mentoringService.assignDepartment(requestId, finalDeptId);
      setAssigningDeptId(null);
      if (!deptId) setSelectedDept("");
      setStatus({ type: "success", message: "Department assigned successfully" });
      fetchRequests();
    } catch (error: any) {
      setStatus({ type: "destructive", message: error.response?.data?.message || "Failed to assign department" });
      console.error("Failed to assign department", error);
      throw error;
    }
  };

  const handleAssignAdvisor = async (requestId: number, advisorId?: string) => {
    const finalAdvisorId = advisorId || selectedAdvisor;
    if (!finalAdvisorId) return;
    setStatus(null);
    try {
      await mentoringService.assignAdvisor(requestId, finalAdvisorId);
      setAssigningAdvisorId(null);
      if (!advisorId) setSelectedAdvisor("");
      setStatus({ type: "success", message: "Advisor assigned successfully" });
      fetchRequests();
    } catch (error: any) {
      setStatus({ type: "destructive", message: error.response?.data?.message || "Failed to assign advisor" });
      console.error("Failed to assign advisor", error);
      throw error;
    }
  };

  const filteredRequests = useMemo(() => {
    let result = requests;
    if (isAdmin) {
      result = result.filter(req => 
        activeTab === 'pending' 
          ? (req.status === 'pending')
          : (req.status === 'assigned' || req.status === 'ongoing' || req.status === 'done')
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(req => 
        req.topic?.toLowerCase().includes(term) || 
        req.umkm?.name?.toLowerCase().includes(term) ||
        req.id.toString().includes(term)
      );
    }
    
    return result;
  }, [requests, isAdmin, activeTab, searchTerm]);

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
    searchTerm,
    setSearchTerm,
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
