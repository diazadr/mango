"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Mail, Phone, MapPin, Users, ArrowLeft,
  Search, ChevronLeft, ChevronRight, Store, BadgeCheck,
  User, ExternalLink, Loader2,
} from "lucide-react";
import { api } from "@/src/lib/http/axios";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { StatusBadge } from "@/src/components/ui/dashboard/StatusBadge";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { EmptyState } from "@/src/components/ui/dashboard/EmptyState";
import {
  AdminTable, AdminTableBody, AdminTableCell,
  AdminTableHeader, AdminTableHeadCell, AdminTableRow,
} from "@/src/components/ui/dashboard/AdminTable";
import { Button } from "@/src/components/ui/button";

interface OrgDetailViewProps {
  orgId: string;
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3 border-b border-dashed border-border/60 pb-3">
      <div className="rounded-lg bg-primary/5 p-2 text-primary">
        <Icon size={14} strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-tight text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-bold leading-tight text-foreground">{value || "—"}</p>
      </div>
    </div>
  );
}

export function OrgDetailView({ orgId }: OrgDetailViewProps) {
  const router = useRouter();

  const [org, setOrg] = useState<any>(null);
  const [umkmList, setUmkmList] = useState<any[]>([]);
  const [orgLoading, setOrgLoading] = useState(true);
  const [umkmLoading, setUmkmLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => setCurrentPage(1), [debouncedSearch]);

  // Fetch org detail
  useEffect(() => {
    setOrgLoading(true);
    api.get(`/v1/admin/organizations/${orgId}`)
      .then((res) => setOrg(res.data?.data ?? res.data))
      .catch(console.error)
      .finally(() => setOrgLoading(false));
  }, [orgId]);

  // Fetch UMKM list
  const fetchUmkm = useCallback(() => {
    setUmkmLoading(true);
    api.get(`/v1/admin/organizations/${orgId}/umkm`, {
      params: { search: debouncedSearch || undefined, page: currentPage, per_page: 10 },
    })
      .then((res) => {
        const data = res.data;
        setUmkmList(data.data ?? []);
        setTotalPages(data.last_page ?? 1);
        setTotalRecords(data.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setUmkmLoading(false));
  }, [orgId, debouncedSearch, currentPage]);

  useEffect(() => { fetchUmkm(); }, [fetchUmkm]);

  if (orgLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <LoadingState message="Memuat data organisasi..." />
      </div>
    );
  }

  if (!org) {
    return (
      <DashboardPageShell title="Detail Organisasi" icon={Building2}>
        <EmptyState icon={Building2} title="Organisasi tidak ditemukan" description="Data organisasi tidak dapat dimuat." />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={org.name || "Detail Organisasi"}
      subtitle={org.display_type || "Manajemen Organisasi"}
      icon={Building2}
      actions={
        <Button variant="outline" onClick={() => router.back()} className="h-10 gap-2 rounded-xl">
          <ArrowLeft size={16} /> Kembali
        </Button>
      }
    >
      <div className="space-y-6">
        {/* ── Org Info ── */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Identity card */}
          <SectionCard title="Profil Identitas" icon={Building2} className="md:col-span-1">
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-primary/20 bg-primary/5 flex items-center justify-center shadow">
                {org.logo_url && !org.logo_url.includes("placeholder") ? (
                  <img src={org.logo_url} alt={org.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-primary">{org.name?.charAt(0) || "O"}</span>
                )}
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <h2 className="text-lg font-black text-foreground">{org.name}</h2>
                  {org.is_active && <BadgeCheck className="text-primary" size={18} />}
                </div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {org.display_type || org.type}
                </span>
              </div>
              <StatusBadge type="status" value={org.is_active ? "active" : "inactive"} />
            </div>
          </SectionCard>

          {/* Contact & Location */}
          <SectionCard title="Informasi Kontak & Lokasi" icon={MapPin} className="md:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow icon={User} label="Penanggung Jawab (PIC)" value={org.pic_name} />
              <InfoRow icon={Phone} label="Kontak PIC" value={org.pic_phone} />
              <InfoRow icon={Mail} label="Email" value={org.email} />
              <InfoRow icon={Phone} label="Telepon Organisasi" value={org.phone} />
              <InfoRow icon={MapPin} label="Alamat" value={org.address} />
              <InfoRow icon={MapPin} label="Kota / Kabupaten" value={org.regency} />
              <InfoRow icon={MapPin} label="Provinsi" value={org.province} />
            </div>
            {org.description && (
              <div className="mt-4 rounded-xl border border-border/50 bg-muted/20 p-4">
                <p className="text-xs font-bold text-muted-foreground tracking-wider mb-2">Deskripsi</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{org.description}</p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── UMKM Table ── */}
        <SectionCard
          title={`Daftar UMKM (${totalRecords})`}
          icon={Store}
          className="rounded-2xl"
        >
          {/* Search bar */}
          <div className="mb-4 flex items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari UMKM atau pemilik..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {umkmLoading ? (
            <LoadingState message="Memuat daftar UMKM..." />
          ) : umkmList.length === 0 ? (
            <EmptyState
              icon={Store}
              title="Belum ada UMKM"
              description="Belum ada UMKM yang terdaftar dalam organisasi ini."
            />
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-border/50">
                <AdminTable>
                  <AdminTableHeader>
                    <AdminTableRow>
                      <AdminTableHeadCell>Nama UMKM</AdminTableHeadCell>
                      <AdminTableHeadCell>Pemilik / User</AdminTableHeadCell>
                      <AdminTableHeadCell>Sektor</AdminTableHeadCell>
                      <AdminTableHeadCell>Status</AdminTableHeadCell>
                      <AdminTableHeadCell>NIB</AdminTableHeadCell>
                    </AdminTableRow>
                  </AdminTableHeader>
                  <AdminTableBody>
                    {umkmList.map((umkm) => (
                      <AdminTableRow key={umkm.id}>
                        <AdminTableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden border border-border/50 bg-muted/20">
                              {umkm.logo_url && !umkm.logo_url.includes("placeholder") ? (
                                <img src={umkm.logo_url} alt={umkm.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-muted-foreground">
                                  {umkm.name?.charAt(0) || "U"}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{umkm.name}</p>
                              {umkm.legal_entity_type && (
                                <p className="text-xs text-muted-foreground">{umkm.legal_entity_type}</p>
                              )}
                            </div>
                          </div>
                        </AdminTableCell>
                        <AdminTableCell>
                          {umkm.user ? (
                            <div>
                              <p className="text-sm font-medium text-foreground">{umkm.user.name}</p>
                              <p className="text-xs text-muted-foreground">{umkm.user.email}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </AdminTableCell>
                        <AdminTableCell>
                          <span className="text-sm text-foreground capitalize">{umkm.sector || "—"}</span>
                        </AdminTableCell>
                        <AdminTableCell>
                          <StatusBadge
                            type="status"
                            value={umkm.is_active ? "active" : "inactive"}
                          />
                        </AdminTableCell>
                        <AdminTableCell>
                          <span className="text-xs font-mono text-muted-foreground">{umkm.nib || "—"}</span>
                        </AdminTableCell>
                      </AdminTableRow>
                    ))}
                  </AdminTableBody>
                </AdminTable>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Total {totalRecords} UMKM — Halaman {currentPage} dari {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-border p-1.5 disabled:opacity-40 hover:bg-muted transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                          p === currentPage
                            ? "bg-primary text-white"
                            : "border border-border hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-border p-1.5 disabled:opacity-40 hover:bg-muted transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </SectionCard>
      </div>
    </DashboardPageShell>
  );
}
