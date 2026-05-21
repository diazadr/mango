"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import {
    Plus, RefreshCw, Loader2, Wifi, WifiOff, KeyRound, Trash2,
    ToggleLeft, ToggleRight, AlertCircle, Copy, CheckCheck, MapPin, Clock, Database
} from "lucide-react";
import { DashboardPageShell } from "@/src/components/layouts/dashboard/DashboardPageShell";
import { SectionCard } from "@/src/components/ui/dashboard/SectionCard";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { manufacturingService, type EdgeSite } from "../services/manufacturingService";

// ── One-time API key reveal modal ─────────────────────────────────────────────
function ApiKeyRevealModal({ apiKey, siteName, onClose }: {
    apiKey: string;
    siteName: string;
    onClose: () => void;
}) {
    const t = useTranslations("EdgeSiteManagementView");
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-warning" />
                        API Key untuk "{siteName}"
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
                        <p className="text-xs font-semibold text-warning mb-1">{t("warning_one_time")}</p>
                        <p className="text-xs text-muted-foreground">
                            API key ini <strong>tidak dapat dilihat kembali</strong> setelah modal ini ditutup.
                            Salin dan simpan di tempat yang aman, lalu masukkan ke <code>config.yaml</code> edge system Anda.
                        </p>
                    </div>

                    <div className="relative">
                        <code className="block w-full rounded-xl bg-muted/50 border border-border p-4 text-sm font-mono text-foreground break-all select-all pr-12">
                            {apiKey}
                        </code>
                        <button
                            onClick={copy}
                            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted transition-colors"
                        >
                            {copied ? <CheckCheck size={16} className="text-success" /> : <Copy size={16} className="text-muted-foreground" />}
                        </button>
                    </div>

                    <div className="rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground font-mono space-y-1">
                        <p className="font-semibold text-foreground text-[11px] mb-2">{t("masukkan_ke_edge_configyaml")}</p>
                        <p>mango:</p>
                        <p className="pl-4">api_key: "<span className="text-primary">{apiKey}</span>"</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={onClose} className="w-full">
                        Saya sudah menyimpan key ini
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Create site modal ─────────────────────────────────────────────────────────
function CreateSiteModal({ onClose, onCreated }: {
    onClose: () => void;
    onCreated: (apiKey: string, name: string) => void;
}) {
    const t = useTranslations("EdgeSiteManagementView");
    const [form, setForm] = useState({ name: "", site_id: "", description: "", location: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const siteIdFromName = (n: string) =>
        n.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");

    const handleNameChange = (name: string) => {
        setForm(f => ({ ...f, name, site_id: siteIdFromName(name) }));
    };

    const handleSubmit = async () => {
        setError("");
        if (!form.name.trim() || !form.site_id.trim()) {
            setError("Nama dan Site ID wajib diisi.");
            return;
        }
        setSaving(true);
        try {
            const res = await manufacturingService.createEdgeSite({
                name: form.name.trim(),
                site_id: form.site_id.trim(),
                description: form.description || undefined,
                location: form.location || undefined,
            });
            onCreated(res.data?.data?.api_key ?? "", form.name.trim());
        } catch (err: any) {
            setError(manufacturingService.parseErrors(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-primary" />
                        Tambah Edge Site Baru
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nama Site <span className="text-destructive">*</span></Label>
                        <Input
                            placeholder={t("placeholder_contoh_pabrik_bandung")}
                            value={form.name}
                            onChange={e => handleNameChange(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Site ID <span className="text-destructive">*</span></Label>
                        <Input
                            placeholder={t("placeholder_factory001")}
                            value={form.site_id}
                            onChange={e => setForm(f => ({ ...f, site_id: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "") }))}
                            className="font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Hanya huruf kapital, angka, dan underscore. Harus cocok dengan <code>site_id</code> di config.yaml edge.</p>
                    </div>
                    <div className="space-y-2">
                        <Label>{t("deskripsi")}</Label>
                        <Textarea
                            placeholder={t("placeholder_keterangan_singkat_tentang_site_ini")}
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={2}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t("location")}</Label>
                        <Input
                            placeholder={t("placeholder_jl_industri_no1_bandung")}
                            value={form.location}
                            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                        />
                    </div>
                    {error && (
                        <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                            <p className="text-xs text-destructive">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={saving}>{t("cancel")}</Button>
                    <Button onClick={handleSubmit} disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={14} />}
                        {saving ? "Membuat..." : "Buat Site"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Site card ─────────────────────────────────────────────────────────────────
function SiteCard({ site, onToggle, onRotateKey, onDelete }: {
    site: EdgeSite;
    onToggle: () => void;
    onRotateKey: () => void;
    onDelete: () => void;
}) {
    const t = useTranslations("EdgeSiteManagementView");
    return (
        <div className={`relative flex flex-col gap-4 p-5 rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md ${
            !site.is_active ? "opacity-60" : ""
        } ${site.is_online ? "border-success/30 ring-1 ring-success/10" : ""}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`relative flex h-2.5 w-2.5 shrink-0`}>
                            {site.is_online && <span className="animate-ping absolute h-full w-full rounded-full bg-success opacity-75" />}
                            <span className={`relative rounded-full h-2.5 w-2.5 ${site.is_online ? "bg-success" : "bg-muted-foreground/30"}`} />
                        </span>
                        <h3 className="text-sm font-bold text-foreground truncate">{site.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-[10px]">{site.site_id}</Badge>
                        <Badge
                            variant="outline"
                            className={`text-[10px] ${site.is_active
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-muted text-muted-foreground"}`}
                        >
                            {site.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                        {site.is_online && (
                            <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                                Online
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Info rows */}
            <div className="space-y-1.5 text-xs text-muted-foreground">
                {site.location && (
                    <div className="flex items-center gap-1.5">
                        <MapPin size={11} />
                        <span>{site.location}</span>
                    </div>
                )}
                <div className="flex items-center gap-1.5">
                    <Clock size={11} />
                    {site.last_sync_at ? (
                        <span>
                            Terakhir sync: <b className={site.is_online ? "text-success" : "text-foreground"}>
                                {site.minutes_since_sync != null
                                    ? site.minutes_since_sync < 1
                                        ? "baru saja"
                                        : `${site.minutes_since_sync} menit lalu`
                                    : "—"
                                }
                            </b>
                        </span>
                    ) : (
                        <span>{t("belum_pernah_sync")}</span>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    <KeyRound size={11} />
                    <span className="font-mono">{site.api_key_preview}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 text-xs h-8 rounded-lg"
                    onClick={onToggle}
                >
                    {site.is_active
                        ? <><ToggleRight size={13} className="text-success" /> {t("nonaktifkan")}</>
                        : <><ToggleLeft size={13} /> {t("aktifkan")}</>
                    }
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 text-xs h-8 rounded-lg text-warning border-warning/30 hover:bg-warning/10"
                    onClick={onRotateKey}
                >
                    <KeyRound size={13} /> Rotate Key
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={onDelete}
                >
                    <Trash2 size={13} />
                </Button>
            </div>
        </div>
    );
}

// ── Main View ─────────────────────────────────────────────────────────────────
export function EdgeSiteManagementView() {
    const t = useTranslations("EdgeSiteManagementView");
    const [sites, setSites] = useState<EdgeSite[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [revealKey, setRevealKey] = useState<{ key: string; name: string } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<EdgeSite | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await manufacturingService.getEdgeSites();
            setSites(res.data?.data?.sites ?? []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreated = (key: string, name: string) => {
        setShowCreate(false);
        setRevealKey({ key, name });
        load();
    };

    const handleRotateKey = async (site: EdgeSite) => {
        if (!confirm(`Rotate API key untuk "${site.name}"? Edge system harus diupdate dengan key baru.`)) return;
        setActionLoading(site.id);
        try {
            const res = await manufacturingService.rotateEdgeSiteKey(site.id);
            const newKey = res.data?.data?.api_key;
            if (newKey) setRevealKey({ key: newKey, name: site.name });
            await load();
        } catch { /* silent */ }
        finally { setActionLoading(null); }
    };

    const handleToggle = async (site: EdgeSite) => {
        setActionLoading(site.id);
        try {
            await manufacturingService.updateEdgeSite(site.id, { is_active: !site.is_active });
            await load();
        } catch { /* silent */ }
        finally { setActionLoading(null); }
    };

    const handleDelete = async (site: EdgeSite) => {
        setActionLoading(site.id);
        setConfirmDelete(null);
        try {
            await manufacturingService.deleteEdgeSite(site.id);
            await load();
        } catch { /* silent */ }
        finally { setActionLoading(null); }
    };

    const onlineCount = sites.filter(s => s.is_online).length;
    const activeCount = sites.filter(s => s.is_active).length;

    return (
        <DashboardPageShell
            title={t("title_manajemen_edge_sites")}
            subtitle={t("title_kelola_koneksi_dari_edge_cnc_system_ke_m")}
            icon={Database}
            actions={
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 h-9 rounded-xl" onClick={load} disabled={loading}>
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                    <Button size="sm" className="gap-2 h-9 rounded-xl" onClick={() => setShowCreate(true)}>
                        <Plus size={14} />
                        Tambah Site
                    </Button>
                </div>
            }
        >
            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { label: "Total Sites", value: sites.length, icon: Database, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Online (≤10 menit)", value: onlineCount, icon: Wifi, color: "text-success", bg: "bg-success/10" },
                    { label: "Aktif", value: activeCount, icon: ToggleRight, color: "text-primary", bg: "bg-primary/10" },
                ].map(m => (
                    <div key={m.label} className="flex items-center gap-3 p-4 rounded-2xl border bg-card shadow-sm">
                        <div className={`p-2 rounded-xl ${m.bg}`}>
                            <m.icon className={`h-5 w-5 ${m.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground tracking-wide">{m.label}</p>
                            <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sites table */}
            <SectionCard title={t("title_daftar_edge_sites")} icon={Database} noPadding>
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                ) : sites.length === 0 ? (
                    <div className="flex flex-col items-center py-12 gap-3">
                        <WifiOff className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">{t("belum_ada_edge_site_terdaftar")}</p>
                        <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
                            <Plus size={13} /> Tambah Site Pertama
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50 bg-muted/30">
                                    {['Status', 'Nama Site', 'Site ID', 'Lokasi', 'Terakhir Sync', 'API Key', 'Aksi'].map(h => (
                                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-muted-foreground tracking-wider uppercase">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sites.map(site => (
                                    <tr key={site.id} className={`border-b border-border/40 hover:bg-muted/20 transition-colors ${!site.is_active ? 'opacity-60' : ''}`}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="relative flex h-2.5 w-2.5 shrink-0">
                                                    {site.is_online && <span className="animate-ping absolute h-full w-full rounded-full bg-success opacity-75" />}
                                                    <span className={`relative rounded-full h-2.5 w-2.5 ${site.is_online ? 'bg-success' : 'bg-muted-foreground/30'}`} />
                                                </span>
                                                <div className="flex flex-col gap-0.5">
                                                    <Badge variant="outline" className={`text-[10px] w-fit ${site.is_active ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'}`}>
                                                        {site.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                    {site.is_online && <Badge variant="outline" className="text-[10px] w-fit bg-primary/10 text-primary border-primary/20">Online</Badge>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-foreground">{site.name}</p>
                                            {site.description && <p className="text-xs text-muted-foreground truncate max-w-[180px]">{site.description}</p>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded-lg border border-border/50">{site.site_id}</span>
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground text-xs">
                                            {site.location ? (
                                                <div className="flex items-center gap-1"><MapPin size={11} />{site.location}</div>
                                            ) : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1"><Clock size={11} />
                                                {site.last_sync_at ? (
                                                    <span className={site.is_online ? 'text-success font-semibold' : ''}>
                                                        {site.minutes_since_sync != null ? site.minutes_since_sync < 1 ? 'baru saja' : `${site.minutes_since_sync} mnt lalu` : '—'}
                                                    </span>
                                                ) : t("belum_pernah_sync")}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-xs text-muted-foreground flex items-center gap-1"><KeyRound size={11} />{site.api_key_preview}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1 relative">
                                                {actionLoading === site.id && (
                                                    <div className="absolute inset-0 bg-background/60 rounded z-10 flex items-center justify-center">
                                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                    </div>
                                                )}
                                                <Button variant="outline" size="sm" className="gap-1 text-xs h-8 rounded-lg" onClick={() => handleToggle(site)}>
                                                    {site.is_active ? <><ToggleRight size={13} className="text-success" />{t("nonaktifkan")}</> : <><ToggleLeft size={13} />{t("aktifkan")}</>}
                                                </Button>
                                                <Button variant="outline" size="sm" className="gap-1 text-xs h-8 rounded-lg text-warning border-warning/30 hover:bg-warning/10" onClick={() => handleRotateKey(site)}>
                                                    <KeyRound size={13} /> Key
                                                </Button>
                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setConfirmDelete(site)}>
                                                    <Trash2 size={13} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>


            {/* Modals */}
            {showCreate && (
                <CreateSiteModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
            )}
            {revealKey && (
                <ApiKeyRevealModal
                    apiKey={revealKey.key}
                    siteName={revealKey.name}
                    onClose={() => setRevealKey(null)}
                />
            )}
            {confirmDelete && (
                <Dialog open onOpenChange={() => setConfirmDelete(null)}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="text-destructive">{t("hapus_edge_site")}</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            Site <b>"{confirmDelete.name}"</b> ({confirmDelete.site_id}) akan dihapus permanen.
                            Edge system yang masih menggunakan API key ini tidak akan bisa lagi mengirim data.
                        </p>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setConfirmDelete(null)}>{t("cancel")}</Button>
                            <Button variant="destructive" onClick={() => handleDelete(confirmDelete)}>{t("hapus")}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </DashboardPageShell>
    );
}
