"use client";

import React from "react";
import { UserCheck, CheckCircle2, XCircle, Users, Loader2 } from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Button } from "@/src/components/ui/button";
import { StatusAlert } from "@/src/components/ui/dashboard/StatusAlert";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import {
  AdminDataCard,
  InitialsAvatar,
} from "@/src/components/ui/dashboard/AdminDataView";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHeader,
  AdminTableHeadCell,
  AdminTableRow,
} from "@/src/components/ui/dashboard/AdminTable";
import { useSikimApprovals } from "../hooks/useSikimApprovals";

export function SikimApprovalsView() {
  const {
    members,
    loading,
    processingId,
    organization,
    handleUpdateStatus,
    status,
    setStatus,
  } = useSikimApprovals();

  return (
    <DashboardPageShell
      title="Persetujuan anggota"
      subtitle="Verifikasi dan berikan otorisasi bagi entitas yang mendaftar ke unit Anda."
      icon={UserCheck}
    >
      <div className="space-y-6">
        <StatusAlert status={status} onDismiss={() => setStatus(null)} />

        {organization && (
          <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Organisasi</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{organization.name}</p>
            </div>
          </div>
        )}

        <AdminDataCard
          description={
            !loading ? (
              <p className="text-xs text-muted-foreground px-1">
                {members.length > 0 ? `${members.length} permohonan menunggu verifikasi` : "Tidak ada permohonan baru"}
              </p>
            ) : null
          }
        >
          {loading ? (
            <LoadingState message="Memuat permohonan..." />
          ) : members.length === 0 ? (
            <EmptyState icon={UserCheck} title="Antrean kosong" description="Belum ada permohonan anggota baru yang masuk." />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <AdminTableRow>
                  <AdminTableHeadCell>Nama pendaftar</AdminTableHeadCell>
                  <AdminTableHeadCell>Email</AdminTableHeadCell>
                  <AdminTableHeadCell>Waktu mendaftar</AdminTableHeadCell>
                  <AdminTableHeadCell align="right">Aksi</AdminTableHeadCell>
                </AdminTableRow>
              </AdminTableHeader>
              <AdminTableBody>
                {members.map((user) => (
                  <AdminTableRow key={user.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <InitialsAvatar name={user.name} />
                        <span className="font-medium text-foreground truncate max-w-[180px]">{user.name}</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="text-sm text-muted-foreground">
                        {user.joined_at ? new Date(user.joined_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : "Menunggu"}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1.5"
                          onClick={() => handleUpdateStatus(user.id, false)}
                          disabled={processingId === user.id}
                        >
                          <XCircle size={14} /> Tolak
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1.5 bg-success hover:bg-success/80"
                          onClick={() => handleUpdateStatus(user.id, true)}
                          disabled={processingId === user.id}
                        >
                          {processingId === user.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          Setujui
                        </Button>
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
          )}
        </AdminDataCard>
      </div>
    </DashboardPageShell>
  );
}
