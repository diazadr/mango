"use client";

import React from "react";
import { 
  History, Plus, Search, AlertCircle
} from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Button } from "@/src/components/ui/button";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { TabSwitch } from "@/src/components/ui/dashboard/TabSwitch";
import { MentoringCard } from "../components/MentoringCard";
import { MentoringRequestForm } from "../components/MentoringRequestForm";
import { useMentoring } from "../hooks/useMentoring";

export function MentoringView() {
  const {
    user,
    requests,
    departments,
    advisors,
    loading,
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
    refresh,
    status,
    setStatus
  } = useMentoring();

  if (loading) {
    return (
      <DashboardPageShell 
        title={isAdmin ? "Delegasi mentoring" : "Pendampingan UMKM"} 
        subtitle="Menyiapkan sesi pendampingan..." 
      >
        <LoadingState message="Memuat data..." />
      </DashboardPageShell>
    );
  }

  const adminTabs = [
    { value: "pending", label: "Pending" },
    { value: "delegated", label: "Terdelegasi" },
  ];

  return (
    <DashboardPageShell
      title={isAdmin ? "Delegasi mentoring" : "Pendampingan UMKM"}
      subtitle={isAdmin ? "Pusat pengelolaan bantuan dan penugasan advisor." : "Ajukan konsultasi ahli untuk pengembangan bisnis Anda."}
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-6">
        
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/50">
                <History size={18} className="text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {isAdmin ? (activeTab === 'pending' ? "Antrean permohonan" : "Daftar delegasi aktif") : "Riwayat pengajuan"}
              </h2>
            </div>

            {isAdmin && (
              <TabSwitch tabs={adminTabs} activeTab={activeTab} onTabChange={(v) => setActiveTab(v as any)} />
            )}
          </div>

          <div className="space-y-4">
            {requests.length === 0 ? (
              <EmptyState 
                icon={AlertCircle} 
                title={isAdmin ? "Tidak ada permohonan baru" : "Belum ada riwayat bimbingan"} 
              />
            ) : (
              requests.map((request) => (
                <MentoringCard 
                  key={request.id} 
                  request={request}
                  isAdmin={isAdmin ?? false}
                  departments={departments}
                  advisors={advisors}
                  assigningDeptId={assigningDeptId}
                  setAssigningDeptId={setAssigningDeptId}
                  assigningAdvisorId={assigningAdvisorId}
                  setAssigningAdvisorId={setAssigningAdvisorId}
                  selectedDept={selectedDept}
                  setSelectedDept={setSelectedDept}
                  selectedAdvisor={selectedAdvisor}
                  setSelectedAdvisor={setSelectedAdvisor}
                  handleAssignDepartment={handleAssignDepartment}
                  handleAssignAdvisor={handleAssignAdvisor}
                />
              ))
            )}
          </div>
        </div>

        {/* Sidebar / Action Area */}
        <div className="xl:col-span-4 space-y-6">
           {!isAdmin && (
             <div className="bg-primary p-6 rounded-xl text-white shadow-lg relative overflow-hidden group">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
               <div className="relative z-10">
                 <h3 className="text-lg font-semibold mb-2">Butuh bantuan?</h3>
                 <p className="text-white/80 text-sm mb-6 leading-relaxed">
                   Konsultasikan hambatan produksi atau manajemen IKM Anda dengan para ahli.
                 </p>
                 <Button 
                   onClick={() => setShowForm(true)}
                   className="w-full bg-white text-primary hover:bg-muted gap-2 shadow-lg"
                 >
                   Mulai bimbingan <Plus size={18} />
                 </Button>
               </div>
             </div>
           )}

           <SectionCard title="Cari bimbingan">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari topik atau nama..."
                  className="w-full h-10 bg-muted/50 rounded-lg pl-10 pr-4 text-sm border border-transparent focus:border-primary/30 transition-all outline-none"
                />
              </div>
           </SectionCard>
        </div>
      </div>

      <MentoringRequestForm 
        open={showForm} 
        onOpenChange={setShowForm} 
        onSuccess={(msg) => {
          setShowForm(false);
          setStatus({ type: "success", message: msg || "Permintaan mentoring berhasil dikirim" });
          refresh();
        }}
      />
    </DashboardPageShell>
  );
}
