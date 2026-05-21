"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import api from "@/src/lib/http/axios";
import { 
  Loader2, Wrench, AlertCircle, Plus, Trash2, Pencil,
  Settings2, CheckCircle2, Save, FileText, MapPin,
  Tag, Hash, Package, Zap, CalendarClock, DollarSign,
  Info
} from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Badge } from "@/src/components/ui/badge";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { useAuth } from "@/src/components/providers/AuthProvider";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle
} from "@/src/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/src/components/ui/select";
import { 
  AdminTable, AdminTableBody, AdminTableCell,
  AdminTableHeadCell, AdminTableHeader, AdminTableRow,
  SortableHeader,
} from "@/src/components/ui/dashboard/AdminTable";
import {
  AdminToolbar, AdminSearchFilter, AdminSelectFilter,
  AdminIconButton, EmptyState,
} from "@/src/components/ui/dashboard/AdminDataView";
import { LoadingState } from "@/src/components/ui/dashboard/LoadingSkeleton";
import { useTranslations } from "next-intl";

// ── Tipe kondisi ──────────────────────────────────────────────────────────────
const CONDITION_MAP: Record<string, { label: string; className: string }> = {
  good: { label: "Baik", className: "bg-success/10 text-success border-success/20" },
  fair: { label: "Perlu Perbaikan", className: "bg-warning/10 text-warning border-warning/20" },
  poor: { label: "Rusak", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  available: { label: "Tersedia", className: "bg-success/10 text-success border-success/20" },
  busy: { label: "Dipakai", className: "bg-warning/10 text-warning border-warning/20" },
  maintenance: { label: "Maintenance", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

function formatRp(n: number | string) {
  return "Rp " + Number(n).toLocaleString("id-ID");
}

const DEFAULT_MACHINE_FORM = {
  name: "", code: "", type: "", brand: "",
  quantity: "1", condition: "good",
  purchase_year: "", dimensions: "", power_consumption_watt: "",
  is_iot_enabled: false, is_reservable: false,
  location: "", notes: "",
  hourly_rate: "0", description: "", status: "available",
};

export function TechnicalProfileView() {
  const t = useTranslations("TechnicalProfileView");
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [umkm, setUmkm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [reservableFilter, setReservableFilter] = useState("all");
  const [sortKey, setSortKey] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [machines, setMachines] = useState<any[]>([]);
  const [machineDialogOpen, setMachineDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "destructive"; message: string } | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [machineForm, setMachineForm] = useState(DEFAULT_MACHINE_FORM);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (authLoading || !isAuthenticated || !user) return;
    setLoading(true);
    try {
      const umkmData = user.umkm;
      if (umkmData) {
        setUmkm(umkmData);
        const machRes = await api.get("/v1/machines", { params: { owner: "me", per_page: 200 } });
        const machData = machRes.data?.data?.data ?? machRes.data?.data ?? machRes.data;
        setMachines(Array.isArray(machData) ? machData : []);
      }
    } catch (err) {
      console.error("Gagal mengambil data teknis:", err);
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) fetchData();
  }, [fetchData, isAuthenticated, authLoading]);

  // ── Sort ───────────────────────────────────────────────────────────────────
  const handleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortOrder("asc");
      return key;
    });
  }, []);

  // ── Filter + Sort (client-side) ────────────────────────────────────────────
  const filteredMachines = useMemo(() => {
    return machines
      .filter((m) => {
        const matchSearch =
          !searchTerm ||
          m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.location?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCondition = conditionFilter === "all" || m.condition === conditionFilter;
        const matchReservable =
          reservableFilter === "all" ||
          (reservableFilter === "true" ? m.is_reservable : !m.is_reservable);
        return matchSearch && matchCondition && matchReservable;
      })
      .sort((a, b) => {
        const valA = String(a[sortKey] ?? "").toLowerCase();
        const valB = String(b[sortKey] ?? "").toLowerCase();
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [machines, searchTerm, conditionFilter, reservableFilter, sortKey, sortOrder]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleMachineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!umkm) return;
    setSubmitting(true);
    setStatus(null);
    try {
      const formData = new FormData();
      Object.entries(machineForm).forEach(([k, v]) => {
        if (typeof v === "boolean") formData.append(k, v ? "1" : "0");
        else if (k === "hourly_rate") formData.append(k, String(v).replace(/\D/g, ""));
        else formData.append(k, String(v));
      });
      if (!editingMachine) {
        formData.append("owner_type", "umkm");
        formData.append("owner_id", String(umkm.id));
      }
      if (imageFile) formData.append("image", imageFile);

      if (editingMachine) {
        formData.append("_method", "PUT");
        await api.post(`/v1/machines/${editingMachine.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setStatus({ type: "success", message: t("msg_data_mesin_berhasil_diperbarui") });
      } else {
        await api.post("/v1/machines", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setStatus({ type: "success", message: t("msg_mesin_baru_berhasil_ditambahkan") });
      }
      setMachineDialogOpen(false);
      fetchData();
    } catch (err: any) {
      let errorMsg = err.response?.data?.message || "Gagal menyimpan data.";
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const msgs = Object.values(err.response.data.errors as Record<string, string[]>).flat();
        errorMsg = msgs.join(" | ");
      }
      setStatus({ type: "destructive", message: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteMachine = async (id: number) => {
    if (!confirm(t("confirm_hapus_data_mesin_ini"))) return;
    setStatus(null);
    try {
      await api.delete(`/v1/machines/${id}`);
      setStatus({ type: "success", message: t("msg_data_mesin_dihapus") });
      fetchData();
    } catch (err: any) {
      setStatus({ type: "destructive", message: err.response?.data?.message || "Gagal menghapus data." });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const openMachineDialog = (item?: any) => {
    if (item) {
      setEditingMachine(item);
      setMachineForm({
        name: item.name || "",
        code: item.code || "",
        type: item.type || "",
        brand: item.brand || "",
        quantity: String(item.quantity ?? 1),
        condition: item.condition || "good",
        purchase_year: String(item.purchase_year || ""),
        dimensions: item.dimensions || "",
        power_consumption_watt: String(item.power_consumption_watt || ""),
        is_iot_enabled: item.is_iot_enabled ?? false,
        is_reservable: item.is_reservable ?? false,
        location: item.location || "",
        notes: item.notes || "",
        hourly_rate: String(item.hourly_rate || 0),
        description: item.description || "",
        status: item.status || "available",
      });
      setImagePreview(item.image_large || item.image_url || item.image || null);
      setImageFile(null);
    } else {
      setEditingMachine(null);
      setMachineForm(DEFAULT_MACHINE_FORM);
      setImagePreview(null);
      setImageFile(null);
    }
    setMachineDialogOpen(true);
  };

  if (loading && !umkm) {
    return (
      <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Menghubungkan ke pusat data teknis...
        </p>
      </div>
    );
  }

  const conditionOptions = [
    { value: "all", label: "Semua Kondisi" },
    { value: "good", label: "Baik" },
    { value: "fair", label: "Perlu Perbaikan" },
    { value: "poor", label: "Rusak" },
  ];

  const reservableOptions = [
    { value: "all", label: "Semua Layanan" },
    { value: "true", label: "Bisa Reservasi" },
    { value: "false", label: "Internal Only" },
  ];

  return (
    <DashboardPageShell
      title={t("title_profil_permesinan_industri")}
      subtitle={t("title_pusat_manajemen_aset_permesinan_dan_peng")}
      icon={Settings2}
    >
      <div className="space-y-8">
        {/* Status Alert */}
        {status && (
          <Alert variant={status.type} className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-2xl">
            {status.type === "success"
              ? <CheckCircle2 className="h-4 w-4" />
              : <AlertCircle className="h-4 w-4" />}
            <AlertDescription className="flex items-center justify-between">
              {status.message}
              <button
                onClick={() => setStatus(null)}
                className="ml-4 text-xs font-bold tracking-wide opacity-70 hover:opacity-100 transition-opacity"
              >
                Tutup
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Mesin Card */}
        <Card className="border-border/50 shadow-sm rounded-xl overflow-hidden bg-card">
          <CardHeader className="bg-muted/10 border-b border-border/50 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Settings2 size={18} />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">{t("daftar_permesinan")}</CardTitle>
                  <CardDescription className="text-xs">
                    Aset peralatan pendukung produksi dan pengaturan reservasi.
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => openMachineDialog()}
                className="rounded-xl gap-2 font-bold bg-primary shadow-lg shadow-primary/20 h-10"
              >
                <Plus size={16} /> Tambah Mesin
              </Button>
            </div>

            {/* Toolbar: Search + Filter */}
            <div className="mt-5">
              <AdminToolbar className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
                <AdminSearchFilter
                  placeholder={t("placeholder_cari_nama_kode_merk_lokasi")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  containerClassName="max-w-none md:flex-1"
                />
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <AdminSelectFilter
                    label={t("label_kondisi")}
                    options={conditionOptions}
                    value={conditionFilter}
                    onChange={setConditionFilter}
                  />
                  <AdminSelectFilter
                    label={t("label_layanan")}
                    options={reservableOptions}
                    value={reservableFilter}
                    onChange={setReservableFilter}
                  />
                </div>
              </AdminToolbar>
              {!loading && (
                <p className="text-xs text-muted-foreground px-1 mt-2">
                  {searchTerm
                    ? `Ditemukan ${filteredMachines.length} mesin untuk "${searchTerm}"`
                    : `Total ${machines.length} mesin terdaftar`}
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <LoadingState message={t("message_memuat_data_mesin")} />
            ) : (
              <div className="overflow-x-auto">
                <AdminTable>
                  <AdminTableHeader>
                    <AdminTableRow>
                      {/* Gambar diperbesar, kolom lebih lebar */}
                      <AdminTableHeadCell className="w-[280px]">{t("mesin")}</AdminTableHeadCell>
                      <SortableHeader label={t("label_kode")} sortKey="code" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                      <SortableHeader label={t("label_merk_tipe")} sortKey="brand" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                      <SortableHeader label={t("label_lokasi")} sortKey="location" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                      <AdminTableHeadCell align="center">{t("qty")}</AdminTableHeadCell>
                      <SortableHeader label={t("label_kondisi_1")} sortKey="condition" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                      <AdminTableHeadCell>{t("layanan")}</AdminTableHeadCell>
                      <SortableHeader label={t("label_tarifjam")} sortKey="hourly_rate" currentSort={sortKey} direction={sortOrder} onSort={handleSort} />
                      <AdminTableHeadCell>{t("ketersediaan")}</AdminTableHeadCell>
                      <AdminTableHeadCell align="right">{t("aksi")}</AdminTableHeadCell>
                    </AdminTableRow>
                  </AdminTableHeader>
                  <AdminTableBody>
                    {filteredMachines.length === 0 ? (
                      <AdminTableRow>
                        <AdminTableCell colSpan={10}>
                          <EmptyState
                            icon={Wrench}
                            title={t("title_tidak_ada_mesin_ditemukan")}
                            description={t("description_tambah_mesin_baru_atau_ubah_filter_penca")}
                          />
                        </AdminTableCell>
                      </AdminTableRow>
                    ) : (
                      filteredMachines.map((item) => {
                        const cond = CONDITION_MAP[item.condition] ?? CONDITION_MAP.good;
                        const stat = STATUS_MAP[item.status] ?? STATUS_MAP.available;
                        return (
                          <AdminTableRow key={item.id}>
                            {/* ── Kolom Mesin: gambar diperbesar ── */}
                            <AdminTableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border/50">
                                  {item.image_url || item.image ? (
                                    <img
                                      src={item.image_url || item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Wrench size={20} className="text-muted-foreground/40" />
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-foreground leading-tight truncate max-w-[160px]">
                                    {item.name}
                                  </span>
                                  {item.notes && (
                                    <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[160px]">
                                      {item.notes}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </AdminTableCell>

                            {/* Kode */}
                            <AdminTableCell>
                              <code className="font-mono text-xs bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground">
                                {item.code || "—"}
                              </code>
                            </AdminTableCell>

                            {/* Merk / Tipe */}
                            <AdminTableCell>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">{item.brand || "—"}</span>
                                {item.type && (
                                  <span className="text-[10px] text-muted-foreground">{item.type}</span>
                                )}
                              </div>
                            </AdminTableCell>

                            {/* Lokasi */}
                            <AdminTableCell>
                              {item.location ? (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin size={11} className="shrink-0" />
                                  <span className="truncate max-w-[120px]">{item.location}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </AdminTableCell>

                            {/* Qty */}
                            <AdminTableCell align="center">
                              <span className="font-bold text-sm">{item.quantity ?? 1}</span>
                            </AdminTableCell>

                            {/* Kondisi */}
                            <AdminTableCell>
                              <Badge className={`rounded-lg font-bold text-[10px] shadow-none border ${cond.className}`}>
                                {cond.label}
                              </Badge>
                            </AdminTableCell>

                            {/* Layanan */}
                            <AdminTableCell>
                              <div className="flex flex-wrap gap-1">
                                {item.is_iot_enabled && (
                                  <Badge className="rounded-lg text-[9px] bg-blue-500/10 text-blue-600 border-blue-200 shadow-none">
                                    <Zap size={8} className="mr-0.5" /> IoT
                                  </Badge>
                                )}
                                {item.is_reservable ? (
                                  <Badge className="rounded-lg text-[9px] bg-primary/10 text-primary border-primary/20 shadow-none">
                                    <CalendarClock size={8} className="mr-0.5" /> Reservasi
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="rounded-lg text-[9px] text-muted-foreground opacity-60 shadow-none">
                                    Internal
                                  </Badge>
                                )}
                              </div>
                            </AdminTableCell>

                            {/* Tarif/Jam */}
                            <AdminTableCell>
                              {item.is_reservable ? (
                                <span className="text-sm font-semibold text-foreground">
                                  {formatRp(item.hourly_rate || 0)}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </AdminTableCell>

                            {/* Ketersediaan */}
                            <AdminTableCell>
                              {item.is_reservable ? (
                                <Badge className={`rounded-lg font-bold text-[10px] shadow-none border ${stat.className}`}>
                                  {stat.label}
                                </Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </AdminTableCell>

                            {/* Aksi */}
                            <AdminTableCell align="right">
                              <div className="flex justify-end gap-1">
                                <AdminIconButton
                                  onClick={() => openMachineDialog(item)}
                                  title={t("title_edit")}
                                  tone="primary"
                                >
                                  <Pencil size={14} />
                                </AdminIconButton>
                                <AdminIconButton
                                  onClick={() => deleteMachine(item.id)}
                                  title={t("title_hapus")}
                                  tone="destructive"
                                >
                                  <Trash2 size={14} />
                                </AdminIconButton>
                              </div>
                            </AdminTableCell>
                          </AdminTableRow>
                        );
                      })
                    )}
                  </AdminTableBody>
                </AdminTable>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Dialog Form ─────────────────────────────────────────────────────── */}
      <Dialog open={machineDialogOpen} onOpenChange={setMachineDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-xl p-0 overflow-hidden border border-border/50 shadow-2xl bg-card">
          <DialogHeader className="bg-muted/10 border-b border-border/50 p-6">
            <DialogTitle className="text-xl font-bold tracking-tight text-primary">
              {editingMachine ? "Edit data mesin" : "Tambah mesin produksi"}
            </DialogTitle>
            <DialogDescription className="text-xs font-medium">
              Informasi aset peralatan pendukung operasional dan pengaturan reservasi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleMachineSubmit}>
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">

              {/* ── Foto Mesin (diperbesar) ── */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground ml-1">{t("foto_mesin")}</Label>
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className={`relative h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden bg-muted/20 ${
                    imagePreview
                      ? "border-primary"
                      : "border-input hover:border-primary hover:bg-muted/30"
                  }`}
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="absolute inset-0 w-full h-full object-contain p-2"
                      />
                      <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-[10px] font-bold text-primary border border-primary/20">
                        Klik untuk ganti
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Wrench size={28} className="opacity-30" />
                      <p className="text-xs font-bold">{t("klik_untuk_unggah_foto")}</p>
                      <p className="text-[10px] opacity-60">{t("jpg_png_webp_maks_2mb")}</p>
                    </div>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* Nama + Kode */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">Nama Mesin <span className="text-destructive">*</span></Label>
                  <Input
                    value={machineForm.name}
                    onChange={(e) => setMachineForm({ ...machineForm, name: e.target.value })}
                    placeholder={t("placeholder_cnc_makino")}
                    className="h-11 rounded-xl bg-background border-input"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t("kode_id")}</Label>
                  <Input
                    value={machineForm.code}
                    onChange={(e) => setMachineForm({ ...machineForm, code: e.target.value })}
                    placeholder={t("placeholder_mch01")}
                    className="h-11 rounded-xl bg-background border-input font-mono text-xs"
                  />
                </div>
              </div>

              {/* Merk + Tipe */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t("merk")}</Label>
                  <Input
                    value={machineForm.brand}
                    onChange={(e) => setMachineForm({ ...machineForm, brand: e.target.value })}
                    placeholder={t("placeholder_dmg_mori")}
                    className="h-11 rounded-xl bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t("tipe_model")}</Label>
                  <Input
                    value={machineForm.type}
                    onChange={(e) => setMachineForm({ ...machineForm, type: e.target.value })}
                    placeholder={t("placeholder_horizontal_milling")}
                    className="h-11 rounded-xl bg-background border-input"
                  />
                </div>
              </div>

              {/* Qty + Kondisi */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t("jumlah_unit")}</Label>
                  <Input
                    type="number"
                    min={1}
                    value={machineForm.quantity}
                    onChange={(e) => setMachineForm({ ...machineForm, quantity: e.target.value })}
                    className="h-11 rounded-xl bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t("kondisi")}</Label>
                  <Select value={machineForm.condition} onValueChange={(v) => setMachineForm({ ...machineForm, condition: v })}>
                    <SelectTrigger className="h-11 rounded-xl bg-background border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="good">{t("baik_layak_pakai")}</SelectItem>
                      <SelectItem value="fair">{t("butuh_perbaikan_ringan")}</SelectItem>
                      <SelectItem value="poor">{t("rusak_tidak_jalan")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lokasi + Catatan */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t("lokasi_workshop")}</Label>
                  <Input
                    value={machineForm.location}
                    onChange={(e) => setMachineForm({ ...machineForm, location: e.target.value })}
                    placeholder={t("placeholder_workshop_a_lantai_1")}
                    className="h-11 rounded-xl bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t("catatan_internal")}</Label>
                  <Input
                    value={machineForm.notes}
                    onChange={(e) => setMachineForm({ ...machineForm, notes: e.target.value })}
                    placeholder={t("placeholder_perlu_kalibrasi_rutin")}
                    className="h-11 rounded-xl bg-background border-input"
                  />
                </div>
              </div>

              {/* Detail Spesifikasi */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">Tahun Pembelian</Label>
                  <Input type="number" min={1900} max={new Date().getFullYear()} value={machineForm.purchase_year} onChange={(e) => setMachineForm({ ...machineForm, purchase_year: e.target.value })} placeholder="Cth: 2021" className="h-11 rounded-xl bg-background border-input" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">Dimensi</Label>
                  <Input value={machineForm.dimensions} onChange={(e) => setMachineForm({ ...machineForm, dimensions: e.target.value })} placeholder="Cth: 200x150x180 cm" className="h-11 rounded-xl bg-background border-input" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground ml-1">Konsumsi Daya (W)</Label>
                  <Input type="number" min={0} value={machineForm.power_consumption_watt} onChange={(e) => setMachineForm({ ...machineForm, power_consumption_watt: e.target.value })} placeholder="Cth: 2500" className="h-11 rounded-xl bg-background border-input" />
                </div>
              </div>

              {/* IoT Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold flex items-center gap-1.5">
                    <Zap size={13} className="text-blue-500" /> Integrasi IoT
                  </Label>
                  <p className="text-[10px] text-muted-foreground">{t("mesin_terhubung_ke_sensor_atau_platform")}</p>
                </div>
                <input
                  type="checkbox"
                  checked={machineForm.is_iot_enabled}
                  onChange={(e) => setMachineForm({ ...machineForm, is_iot_enabled: e.target.checked })}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </div>

              {/* ── Pengaturan Reservasi ── */}
              <div className="pt-4 border-t border-dashed border-border/50 space-y-4">
                <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <CalendarClock size={12} /> Pengaturan Reservasi Publik
                </p>

                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">{t("status_reservasi")}</Label>
                    <p className="text-[10px] text-muted-foreground">{t("aktifkan_agar_mesin_tampil_di_katalog_pu")}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={machineForm.is_reservable}
                    onChange={(e) => setMachineForm({ ...machineForm, is_reservable: e.target.checked })}
                    className="w-5 h-5 accent-primary cursor-pointer"
                  />
                </div>

                <div className={`grid grid-cols-2 gap-4 transition-all duration-300 ${!machineForm.is_reservable ? "opacity-40 pointer-events-none" : ""}`}>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground ml-1">{t("biaya_sewa_per_jam")}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">Rp</span>
                      <Input
                        type="text"
                        value={machineForm.hourly_rate ? Number(machineForm.hourly_rate.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                        onChange={(e) => setMachineForm({ ...machineForm, hourly_rate: e.target.value })}
                        className="h-11 rounded-xl bg-background border-input pl-10"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground ml-1">{t("ketersediaan_1")}</Label>
                    <Select value={machineForm.status} onValueChange={(v) => setMachineForm({ ...machineForm, status: v })}>
                      <SelectTrigger className="h-11 rounded-xl bg-background border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="available">{t("tersedia_untuk_reservasi")}</SelectItem>
                        <SelectItem value="busy">{t("sedang_penuh_dipakai")}</SelectItem>
                        <SelectItem value="maintenance">{t("maintenance_perbaikan")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className={`space-y-2 transition-all duration-300 ${!machineForm.is_reservable ? "opacity-40 pointer-events-none" : ""}`}>
                  <Label className="text-xs font-bold text-muted-foreground ml-1">{t("deskripsi_spesifikasi_layanan")}</Label>
                  <Textarea
                    value={machineForm.description}
                    onChange={(e) => setMachineForm({ ...machineForm, description: e.target.value })}
                    className="rounded-xl bg-background border-input h-24 resize-none text-sm"
                    placeholder={t("placeholder_jelaskan_spesifikasi_atau_ketentuan_rese")}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 pt-2 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMachineDialogOpen(false)}
                className="rounded-xl"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 h-11 rounded-xl font-bold bg-primary shadow-lg shadow-primary/20"
              >
                {submitting
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <><Save className="h-4 w-4 mr-2" /> {t("simpan_data_mesin")}</>
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardPageShell>
  );
}