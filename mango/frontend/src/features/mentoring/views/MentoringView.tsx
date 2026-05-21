"use client";

import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";
import {
  HandshakeIcon,
  Plus,
  Clock,
  CheckCircle2,
  Building2,
  UserCircle,
  Eye,
  ChevronRight,
} from "lucide-react";

import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { TabSwitch } from "@/src/components/ui/dashboard/TabSwitch";
import { useRouter } from "@/src/i18n/navigation";

import {
  AdminDataCard,
  AdminToolbar,
  AdminSearchFilter,
  AdminSelectFilter,
  AdminPagination,
  AdminIconButton,
} from "@/src/components/ui/dashboard/AdminDataView";

import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHeader,
  AdminTableHeadCell,
  AdminTableRow,
  SortableHeader,
} from "@/src/components/ui/dashboard/AdminTable";

import { MentoringRequestForm } from "../components/MentoringRequestForm";
import { MentoringAssignmentDialog } from "../components/MentoringAssignmentDialog";
import { MentoringImpactSummary } from "../components/MentoringImpactSummary";
import { useMentoring } from "../hooks/useMentoring";

// ── Status label / color map ─────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  pending:  "Menunggu",
  assigned: "Advisor Ditugaskan",
  ongoing:  "Berlangsung",
  done:     "Selesai",
};
const STATUS_COLOR: Record<string, string> = {
  pending:  "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  assigned: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  ongoing:  "bg-primary/10 text-primary border-primary/20",
  done:     "bg-success/10 text-success border-success/20",
};

// ── UMKM-specific mentoring panel ─────────────────────────────────────────────
function UmkmMentoringPanel({ requests, loading, setShowForm }: any) {
  const t = useTranslations("MentoringView");
  const router = useRouter();

  if (loading) return <LoadingState message={t("message_memuat_data_pendampingan")} />;

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <EmptyState
          icon={HandshakeIcon}
          title={t("title_belum_ada_pendampingan")}
          description={t("description_ajukan_permintaan_pendampingan_untuk_men")}
        />
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Ajukan Pendampingan
        </Button>
      </div>
    );
  }

  // Most recent active; fallback to first
  const active = requests.find((r: any) => r.status !== "done") || requests[0];

  return (
    <div className="space-y-6">
      {/* Active Mentoring Card */}
      <Card className="border-border/50 shadow-sm rounded-xl overflow-hidden bg-card">
        <CardHeader className="bg-muted/10 border-b border-border/50 p-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <HandshakeIcon size={15} className="text-primary" />
              Pendampingan Aktif
            </CardTitle>
            <Badge className={`rounded-md text-[10px] font-semibold border ${STATUS_COLOR[active.status] ?? "bg-muted text-muted-foreground border-border"}`}>
              {STATUS_LABEL[active.status] ?? active.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">

          {/* Topic */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground tracking-wide mb-1">{t("topik_pendampingan")}</p>
            <p className="font-semibold text-foreground text-sm">{active.topic || "-"}</p>
            {active.description && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{active.description}</p>
            )}
          </div>

          {/* Advisor / Pendamping */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] font-semibold text-muted-foreground tracking-wide mb-3">{t("pendamping_advisor")}</p>
            {active.assignments?.length > 0 ? (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <UserCircle size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    {active.assignments[0]?.mentor?.name || "–"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {active.assignments[0]?.mentor?.email || ""}
                  </p>
                </div>
                <Badge className="ml-auto text-[10px] bg-primary/10 text-primary border-primary/20 border rounded-md font-semibold">
                  Ditugaskan
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock size={14} />
                <span>{t("menunggu_penugasan_advisor_oleh_admin")}</span>
              </div>
            )}
          </div>

          {/* Department */}
          {active.department && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 size={14} className="text-primary shrink-0" />
              <span>Departemen: <span className="font-medium text-foreground">{active.department.name}</span></span>
            </div>
          )}

          {/* Sessions summary */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground tracking-wide mb-2">{t("sesi_pendampingan")}</p>
            {active.sessions?.length > 0 ? (
              <div className="space-y-2">
                {active.sessions.slice(0, 3).map((s: any, i: number) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${s.status === "completed" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">
                        {s.scheduled_at
                          ? new Date(s.scheduled_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                          : "–"}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">{s.medium} · {s.status}</p>
                    </div>
                    {s.status === "completed" && <CheckCircle2 size={14} className="text-success shrink-0" />}
                  </div>
                ))}
                {active.sessions.length > 3 && (
                  <p className="text-xs text-muted-foreground pl-2">+{active.sessions.length - 3} sesi lainnya</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">{t("belum_ada_sesi_terjadwal")}</p>
            )}
          </div>

          {/* View detail button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 font-semibold"
            onClick={() => router.push(`/workspace/umkm/mentoring/${active.id}`)}
          >
            Lihat Detail Pendampingan <ChevronRight size={14} />
          </Button>
        </CardContent>
      </Card>

      {/* Impact / Score summary */}
      <MentoringImpactSummary requestId={active.id} />

      {/* History of previous requests */}
      {requests.length > 1 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground tracking-wide mb-3 px-1">{t("riwayat_pendampingan")}</p>
          <div className="space-y-2">
            {requests.filter((r: any) => r.id !== active.id).map((r: any) => (
              <div key={r.id} className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <HandshakeIcon size={15} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{r.topic || "Pendampingan"}</p>
                  <p className="text-[10px] text-muted-foreground">{r.assignments?.[0]?.mentor?.name || "Belum ada advisor"}</p>
                </div>
                <Badge className={`rounded-md text-[10px] font-semibold border ${STATUS_COLOR[r.status] ?? ""}`}>
                  {STATUS_LABEL[r.status] ?? r.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────
export function MentoringView() {
  const t = useTranslations("MentoringView");
  const router = useRouter();

  const {
    requests,
    departments,
    advisors,
    loading,
    showForm,
    setShowForm,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    isAdmin,
    selectedDept,
    setSelectedDept,
    selectedAdvisor,
    setSelectedAdvisor,
    handleAssignDepartment,
    handleAssignAdvisor,
    refresh,
    status,
    setStatus,
  } = useMentoring();

  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [searchBy, setSearchBy] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortKey, setSortKey] = useState("company");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const searchOptions = [
    { value: "all", label: "Semua" },
    { value: "company", label: "UMKM" },
    { value: "topic", label: "Topik" },
  ];

  const departmentOptions = [
    { value: "all", label: "Semua Departemen" },
    ...departments.map((d) => ({ value: String(d.id), label: d.name })),
  ];

  const filteredRequests = useMemo(() => {
    let data = [...requests];
    if (searchTerm) {
      data = data.filter((item: any) => {
        const company = item.umkm?.business_name?.toLowerCase() || "";
        const topic = item.topic?.toLowerCase() || "";
        const keyword = searchTerm.toLowerCase();
        if (searchBy === "company") return company.includes(keyword);
        if (searchBy === "topic") return topic.includes(keyword);
        return company.includes(keyword) || topic.includes(keyword);
      });
    }
    if (departmentFilter !== "all") {
      data = data.filter((item: any) => String(item.department_id) === String(departmentFilter));
    }
    data.sort((a: any, b: any) => {
      const valA = String(a?.[sortKey] || "").toLowerCase();
      const valB = String(b?.[sortKey] || "").toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [requests, searchTerm, searchBy, departmentFilter, sortKey, sortOrder]);

  const totalPages = Math.ceil(filteredRequests.length / perPage);
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * perPage, currentPage * perPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleSort = (key: string) => {
    if (sortKey === key) { setSortOrder((prev) => prev === "asc" ? "desc" : "asc"); return; }
    setSortKey(key);
    setSortOrder("asc");
  };

  const adminTabs = [
    { value: "pending", label: "Pending" },
    { value: "delegated", label: "Terdelegasi" },
  ];

  // ── UMKM: show advisor-focused panel ──────────────────────────────────────
  if (!isAdmin) {
    return (
      <DashboardPageShell
        title={t("title_pendampingan_saya")}
        subtitle={t("title_pantau_perkembangan_pendampingan_dan_adv")}
        icon={HandshakeIcon}
        actions={
          (requests.every((r: any) => r.status === "done") || requests.length === 0) ? (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" /> {t("mulai_bimbingan")}
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-6">
          <StatusAlert status={status} onDismiss={() => setStatus(null)} />
          <UmkmMentoringPanel
            requests={requests}
            loading={loading}
            setShowForm={setShowForm}
          />
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

  // ── Admin / Advisor: show assignment management table ─────────────────────
  return (
    <DashboardPageShell
      title={t("title_delegasi_mentoring")}
      subtitle={t("title_pusat_pengelolaan_bantuan_dan_penugasan")}
      icon={HandshakeIcon}
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        <AdminDataCard
          toolbar={
            <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
              <AdminSearchFilter
                placeholder={t("placeholder_cari_mentoring")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                options={searchOptions}
                selectedOption={searchBy}
                onOptionChange={setSearchBy}
                containerClassName="max-w-none md:flex-1"
              />
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <AdminSelectFilter
                  label={t("label_filter_departemen")}
                  options={departmentOptions}
                  value={departmentFilter}
                  onChange={(v) => setDepartmentFilter(v)}
                />
                <TabSwitch
                  tabs={adminTabs}
                  activeTab={activeTab}
                  onTabChange={(v) => setActiveTab(v as "pending" | "delegated")}
                />
              </div>
            </AdminToolbar>
          }
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {searchTerm
                  ? `Ditemukan ${filteredRequests.length} hasil untuk "${searchTerm}"`
                  : `Total ${filteredRequests.length} data mentoring`}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message={t("message_memuat_data")} />
          ) : filteredRequests.length === 0 ? (
            <EmptyState
              icon={activeTab === "pending" ? Clock : CheckCircle2}
              title={t("title_tidak_ada_data_mentoring")}
              description={t("description_belum_ada_data_mentoring_tersedia")}
            />
          ) : (
            <>
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <SortableHeader label={t("label_umkm")} sortKey="company" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <SortableHeader label={t("label_topik")} sortKey="topic" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                    <AdminTableHeadCell>{t("departemen")}</AdminTableHeadCell>
                    {activeTab === "delegated" && <AdminTableHeadCell>{t("mentor")}</AdminTableHeadCell>}
                    {activeTab === "delegated" && <AdminTableHeadCell>{t("progres")}</AdminTableHeadCell>}
                    <AdminTableHeadCell>{t("status")}</AdminTableHeadCell>
                    <AdminTableHeadCell align="right">{t("aksi")}</AdminTableHeadCell>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {paginatedRequests.map((request: any) => (
                    <AdminTableRow key={request.id}>
                      <AdminTableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                            {(() => {
                              const photo = request.umkm?.logo_url || request.umkm?.profile_photo_url || request.umkm?.image_url;
                              return photo && !photo.includes('placeholder') ? (
                                <img src={photo} alt={request.umkm?.business_name || request.umkm?.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-sm font-bold text-primary">
                                  {(request.umkm?.business_name || request.umkm?.name || '?').charAt(0).toUpperCase()}
                                </span>
                              );
                            })()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{request.umkm?.business_name || request.umkm?.name || "-"}</p>
                            <p className="text-[10px] text-muted-foreground">{request.umkm?.owner_name}</p>
                          </div>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <span className="font-medium text-sm">{request.topic || "-"}</span>
                      </AdminTableCell>
                      <AdminTableCell>
                        <span className="text-sm">
                          {departments.find((d) => String(d.id) === String(request.department_id))?.name || "-"}
                        </span>
                      </AdminTableCell>
                      {activeTab === "delegated" && (
                        <AdminTableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                              <UserCircle className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <span className="text-sm">{request.assignments?.[0]?.mentor?.name || "-"}</span>
                          </div>
                        </AdminTableCell>
                      )}
                      {activeTab === "delegated" && (
                        <AdminTableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span>{request.sessions?.length || 0} Sesi</span>
                            </div>
                            <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${Math.min((request.sessions?.length || 0) * 20, 100)}%` }}
                              />
                            </div>
                          </div>
                        </AdminTableCell>
                      )}
                      <AdminTableCell>
                        <Badge className={`rounded-md text-[10px] font-semibold border ${STATUS_COLOR[request.status] ?? "bg-muted/30 text-muted-foreground border-border"}`}>
                          {STATUS_LABEL[request.status] ?? request.status}
                        </Badge>
                      </AdminTableCell>
                      <AdminTableCell align="right">
                        <div className="flex justify-end gap-2">
                          {activeTab === "delegated" && (
                            <AdminIconButton
                              onClick={() => router.push(`/workspace/advisor/mentoring/${request.id}`)}
                              title={t("title_lihat_progres")}
                              tone="default"
                            >
                              <Eye className="h-4 w-4" />
                            </AdminIconButton>
                          )}
                          <AdminIconButton
                            onClick={() => {
                              setSelectedRequestId(request.id);
                              setSelectedDept(String(request.department_id || ""));
                              setSelectedAdvisor(String(request.assignments?.[0]?.mentor_user_id || ""));
                              setShowAssignmentDialog(true);
                            }}
                            title={t("title_kelola")}
                            tone="primary"
                          >
                            <HandshakeIcon className="h-4 w-4" />
                          </AdminIconButton>
                        </div>
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>

              {totalPages > 1 && (
                <AdminPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageNumbers={pageNumbers}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </AdminDataCard>
      </div>

      <MentoringAssignmentDialog
        open={showAssignmentDialog}
        onOpenChange={setShowAssignmentDialog}
        requestId={selectedRequestId}
        departments={departments}
        advisors={advisors}
        currentDeptId={selectedDept}
        currentAdvisorId={selectedAdvisor}
        onAssign={async (id, deptId, advisorId) => {
          try {
            await handleAssignDepartment(id, deptId);
            await handleAssignAdvisor(id, advisorId);
            setStatus({ type: "success", message: t("msg_delegasi_berhasil_disimpan") });
            refresh();
          } catch (err) {
            console.error("Delegation failed", err);
          }
        }}
      />
    </DashboardPageShell>
  );
}